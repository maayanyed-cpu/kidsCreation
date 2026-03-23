import type { ArtworkAnalysis } from "@/types/artwork";
import { serialize, deserialize } from "@/lib/db/serialization";
import { getAnthropicClient, VISION_MODEL, isMockMode } from "./client";
import {
  ARTWORK_ANALYSIS_SYSTEM,
  buildArtworkAnalysisPrompt,
} from "./prompts";

// ─── Shape returned by the Vision API (before DB mapping) ──────────────────
// This is the exact JSON Claude returns — mock mode produces the same shape.
interface VisionResult {
  predominant_colors: string[];
  main_subjects: string[];
  technique_notes: string;
  ai_tags: string[];
  emotional_tone: string;
}

// ─── Mock fixture pool ──────────────────────────────────────────────────────
// Realistic fixtures that match real Claude output. Each entry is a complete
// VisionResult. The pool rotates by artwork index so repeated test runs are
// deterministic but varied across artworks.

const MOCK_FIXTURES: VisionResult[] = [
  {
    predominant_colors: ["crimson red", "golden yellow", "cobalt blue"],
    main_subjects: ["roaring lion", "radiant sun"],
    technique_notes:
      "The lion's mane bursts outward in confident, circular strokes — a wonderful example of building form through layered lines. The sun's rays reach all the way to the page edges, filling the space with warmth and ownership.",
    ai_tags: ["animals", "nature", "bold_colors", "circular_patterns"],
    emotional_tone: "Joyful",
  },
  {
    predominant_colors: ["ocean blue", "seafoam green", "pearl white"],
    main_subjects: ["breaching whale", "ocean waves", "tiny fish"],
    technique_notes:
      "The wavy horizontal lines used to represent water show a sophisticated understanding that you represent environments symbolically. The whale's scale relative to the fish shows emerging spatial reasoning.",
    ai_tags: ["animals", "ocean", "scale_awareness", "environment"],
    emotional_tone: "Calm",
  },
  {
    predominant_colors: ["deep purple", "soft pink", "silver"],
    main_subjects: ["night sky", "crescent moon", "scattered stars"],
    technique_notes:
      "The stars are drawn at varied sizes and angles rather than identically repeated — this randomness reveals careful observation of the actual night sky. The moon is given a gentle face, showing a wonderful tendency to personify the world.",
    ai_tags: ["space", "night", "imagination", "personification"],
    emotional_tone: "Dreamy",
  },
  {
    predominant_colors: ["forest green", "warm brown", "lemon yellow"],
    main_subjects: ["climbing monkey", "tall tree", "hanging bananas"],
    technique_notes:
      "The bananas hang in clusters drawn with individual curved C-shapes — a lovely example of using shape vocabulary precisely to represent real objects. The monkey's arms are elongated just right for climbing.",
    ai_tags: ["animals", "food", "nature", "shape_accuracy"],
    emotional_tone: "Playful",
  },
  {
    predominant_colors: ["bright orange", "midnight black", "rusty red"],
    main_subjects: ["tiger prowling", "jungle stripes"],
    technique_notes:
      "The alternating stripe pattern shows real patience and pattern-recognition ability — each stripe is drawn deliberately, not randomly. The tiger's expression has intensity, demonstrating growing ability to convey character.",
    ai_tags: ["animals", "patterns", "repetition", "character_expression"],
    emotional_tone: "Bold",
  },
  {
    predominant_colors: ["rose pink", "valentine red", "cream white"],
    main_subjects: ["family portrait", "floating hearts", "cozy house"],
    technique_notes:
      "Each family member is drawn with distinct visual identifiers — different hair, different heights. This shows that the child sees and honors individuality in the people they love, a beautiful sign of emotional intelligence.",
    ai_tags: ["family", "love", "people", "emotional_intelligence"],
    emotional_tone: "Warm",
  },
  {
    predominant_colors: ["electric blue", "metallic silver", "neon green"],
    main_subjects: ["geometric robot", "numbered control buttons", "antenna"],
    technique_notes:
      "The robot's body is built from confident rectangles and circles — clear evidence of growing geometric vocabulary. The numbered buttons show a wonderful bridge between drawing and early numeracy.",
    ai_tags: ["technology", "geometry", "numbers", "imagination"],
    emotional_tone: "Energetic",
  },
  {
    predominant_colors: ["teal", "royal purple", "burnished gold"],
    main_subjects: ["mermaid with individual scales", "underwater treasure chest"],
    technique_notes:
      "The individually drawn scales on the mermaid's tail are a remarkable demonstration of patient, deliberate mark-making. Each tiny U-shape is placed with care — this is the work of a child who slows down to get it right.",
    ai_tags: ["fantasy", "ocean", "detail_work", "patience"],
    emotional_tone: "Dreamy",
  },
  {
    predominant_colors: ["sky blue", "grass green", "sunshine yellow", "bark brown"],
    main_subjects: ["family picnic scene", "spreading oak tree", "checkered blanket"],
    technique_notes:
      "This is a full narrative scene — there's a before (the tree providing shade), a during (the picnic), and an implied after (the food being eaten). This level of sequential storytelling through a single image is genuinely impressive.",
    ai_tags: ["family", "outdoor", "storytelling", "narrative_depth"],
    emotional_tone: "Joyful",
  },
  {
    predominant_colors: ["indigo", "cosmic silver", "deep black", "star-white"],
    main_subjects: ["floating astronaut", "ringed Saturn", "distant Earth"],
    technique_notes:
      "The astronaut floats with arms outstretched, capturing the feeling of weightlessness rather than just the look of a person in a suit. This shows the child is drawing feelings and physics, not just appearances.",
    ai_tags: ["space", "science", "movement", "conceptual_thinking"],
    emotional_tone: "Curious",
  },
];

// ─── JSON cleanup (Claude occasionally wraps in fences despite instructions) ─
function cleanJson(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

// ─── Parse and validate the Vision API JSON response ────────────────────────
function parseVisionResult(raw: string, artworkId: string): VisionResult {
  try {
    const parsed = JSON.parse(cleanJson(raw));
    return {
      predominant_colors: Array.isArray(parsed.predominant_colors)
        ? parsed.predominant_colors
        : [],
      main_subjects: Array.isArray(parsed.main_subjects)
        ? parsed.main_subjects
        : [],
      technique_notes:
        typeof parsed.technique_notes === "string"
          ? parsed.technique_notes
          : "A creative and expressive piece.",
      ai_tags: Array.isArray(parsed.ai_tags) ? parsed.ai_tags : [],
      emotional_tone:
        typeof parsed.emotional_tone === "string"
          ? parsed.emotional_tone
          : "Joyful",
    };
  } catch {
    console.warn(`[analyzeArtwork] JSON parse failed for ${artworkId}, using fallback`);
    return {
      predominant_colors: ["mixed colors"],
      main_subjects: ["creative artwork"],
      technique_notes:
        "A wonderful creative piece showing imagination and artistic expression.",
      ai_tags: ["creative", "expressive"],
      emotional_tone: "Joyful",
    };
  }
}

// ─── Rate-limit delay between sequential API calls ───────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Main export ─────────────────────────────────────────────────────────────
// Both the mock and live paths return ArtworkAnalysis with identical shape.
// The only difference is the source of the data.

export async function analyzeArtworkImage(
  input: { artwork_id: string; child_id: string; image_url: string },
  fixtureIndex: number = 0
): Promise<Omit<ArtworkAnalysis, "id" | "analysis_date">> {
  const prompt = buildArtworkAnalysisPrompt();
  let result: VisionResult;

  if (isMockMode()) {
    // Rotate through fixtures deterministically so tests are reproducible
    const fixture = MOCK_FIXTURES[fixtureIndex % MOCK_FIXTURES.length];
    // Simulate a small delay so mock pipeline feels like real sequential processing
    await delay(50);
    result = fixture;
    console.log(
      `[MOCK] analyzeArtwork: ${input.artwork_id} → ${result.main_subjects[0]} (${result.emotional_tone})`
    );
  } else {
    const client = getAnthropicClient();

    // Determine source type: picsum/external URLs use "url", otherwise base64 needed
    const isExternalUrl =
      input.image_url.startsWith("http://") ||
      input.image_url.startsWith("https://");

    if (!isExternalUrl) {
      throw new Error(
        `analyzeArtworkImage: local file paths require base64 encoding. ` +
          `Received: ${input.image_url}. Upload images to a CDN or convert to base64.`
      );
    }

    const response = await client.messages.create({
      model: VISION_MODEL,
      max_tokens: 1024,
      system: ARTWORK_ANALYSIS_SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              // Image block must come BEFORE text block
              type: "image",
              source: {
                type: "url",
                url: input.image_url,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const firstBlock = response.content[0];
    if (firstBlock.type !== "text") {
      throw new Error(
        `Unexpected response type from Vision API: ${firstBlock.type}`
      );
    }

    result = parseVisionResult(firstBlock.text, input.artwork_id);

    // Rate-limit buffer between sequential calls (40 req/min on most tiers)
    await delay(1500);
  }

  // Map VisionResult → ArtworkAnalysis shape (serialize arrays for SQLite)
  return {
    artwork_id: input.artwork_id,
    child_id: input.child_id,
    image_url: input.image_url,
    predominant_colors: result.predominant_colors,
    main_subjects: result.main_subjects,
    technique_notes: result.technique_notes,
    ai_tags: result.ai_tags,
    emotional_tone: result.emotional_tone,
  };
}
