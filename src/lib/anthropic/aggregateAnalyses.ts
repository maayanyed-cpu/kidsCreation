import type { ArtworkAnalysis } from "@/types/artwork";
import type { VisualEvolution, ThematicFocus } from "@/types/insights";
import { getAnthropicClient, VISION_MODEL, isMockMode } from "./client";
import { buildAggregationPrompt } from "./prompts";

// ─── Shape returned by the aggregation API call ────────────────────────────
export interface AggregationResult {
  sentiment: string;
  milestone_detected: string;
  top_interest: string;
  tags: string[];
  visual_evolution: VisualEvolution;
  thematic_focus: ThematicFocus;
}

// ─── Mock fixture ──────────────────────────────────────────────────────────
// Deterministic mock that reflects what Claude would return for a rich month
// of varied artwork. Matches the exact JSON shape of the real API response.
function getMockAggregation(analyses: ArtworkAnalysis[]): AggregationResult {
  // Derive a plausible top interest from the first analysis's tags
  const allTags = analyses.flatMap((a) => a.ai_tags);
  const tagCounts: Record<string, number> = {};
  for (const tag of allTags) {
    tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
  }
  const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "creativity";
  const topInterestMap: Record<string, string> = {
    animals: "Animals & Nature",
    family: "Family & People",
    space: "Space & Planets",
    fantasy: "Fantasy & Magic",
    "brawl_stars": "Games & Adventure",
    gaming: "Games & Adventure",
    technology: "Technology & Robots",
    ocean: "Ocean & Sea Creatures",
    nature: "Nature & Outdoors",
  };
  const top_interest = topInterestMap[topTag] ?? "Creative Exploration";

  return {
    sentiment: "Joyful",
    milestone_detected:
      "This month showed a wonderful leap in narrative thinking — instead of drawing single subjects, the artwork began telling stories with multiple characters, environments, and implied action. This is a significant developmental milestone.",
    top_interest,
    tags: ["storytelling", "animals", "bright_colors", "imagination", "detail_work"],
    visual_evolution: {
      color_diversity: 72,
      line_confidence: "Confident",
      subject_complexity: "Multiple figures with environmental context",
    },
    thematic_focus: {
      subjects: {
        animals: 0.38,
        family: 0.22,
        fantasy: 0.18,
        nature: 0.12,
        abstract: 0.1,
      },
    },
  };
}

// ─── JSON cleanup ─────────────────────────────────────────────────────────
function cleanJson(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

function parseAggregation(raw: string): AggregationResult {
  try {
    const parsed = JSON.parse(cleanJson(raw));
    return {
      sentiment: parsed.sentiment ?? "Joyful",
      milestone_detected: parsed.milestone_detected ?? "",
      top_interest: parsed.top_interest ?? "Creative Exploration",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      visual_evolution: {
        color_diversity:
          typeof parsed.visual_evolution?.color_diversity === "number"
            ? parsed.visual_evolution.color_diversity
            : 50,
        line_confidence: parsed.visual_evolution?.line_confidence ?? "Developing",
        subject_complexity:
          parsed.visual_evolution?.subject_complexity ?? "Single subjects",
      },
      thematic_focus: {
        subjects:
          parsed.thematic_focus?.subjects &&
          typeof parsed.thematic_focus.subjects === "object"
            ? parsed.thematic_focus.subjects
            : {},
      },
    };
  } catch {
    console.warn("[aggregateAnalyses] JSON parse failed, using fallback");
    return getMockAggregation([]);
  }
}

// ─── Hebrew mock ──────────────────────────────────────────────────────────
function getMockAggregationHe(analyses: ArtworkAnalysis[]): AggregationResult {
  const base = getMockAggregation(analyses);
  return {
    ...base,
    // sentiment + top_interest stay in English (enum values / emoji lookup)
    milestone_detected:
      "החודש הראה קפיצה נהדרת בחשיבה נרטיבית — במקום לצייר נושאים בודדים, היצירות החלו לספר סיפורים עם דמויות מרובות, סביבות ופעולות משתמעות. זוהי אבן דרך התפתחותית משמעותית.",
    tags: ["סיפור_סיפורים", "בעלי_חיים", "צבעים_בוהקים", "דמיון", "עבודת_פרטים"],
    visual_evolution: {
      ...base.visual_evolution,
      subject_complexity: "דמויות מרובות עם הקשר סביבתי",
    },
    thematic_focus: {
      subjects: {
        "בעלי חיים": 0.38,
        "משפחה": 0.22,
        "פנטזיה": 0.18,
        "טבע": 0.12,
        "מופשט": 0.1,
      },
    },
  };
}

// ─── Main export ──────────────────────────────────────────────────────────
export async function aggregateAnalyses(
  analyses: ArtworkAnalysis[],
  childName?: string,
  locale?: "en" | "he"
): Promise<AggregationResult> {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 80));
    const result = locale === "he" ? getMockAggregationHe(analyses) : getMockAggregation(analyses);
    console.log(
      `[MOCK] aggregateAnalyses: ${analyses.length} artworks → top interest: "${result.top_interest}" (locale: ${locale ?? "en"})`
    );
    return result;
  }

  const client = getAnthropicClient();
  const prompt = buildAggregationPrompt(analyses, childName, locale);

  const response = await client.messages.create({
    model: VISION_MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const firstBlock = response.content[0];
  if (firstBlock.type !== "text") {
    throw new Error(`Unexpected aggregation response type: ${firstBlock.type}`);
  }

  return parseAggregation(firstBlock.text);
}
