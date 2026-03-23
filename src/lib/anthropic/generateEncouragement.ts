import type { ArtworkAnalysis } from "@/types/artwork";
import { getAnthropicClient, VISION_MODEL, isMockMode } from "./client";
import { buildEncouragementPrompt } from "./prompts";

export interface EncouragementResult {
  growth_tip: string;
  encouragement_scripts: string[];
}

// ─── Mock fixtures ────────────────────────────────────────────────────────
// Three pools of encouragement + tips, rotated by top_interest so mock
// output feels contextually relevant even without hitting the API.

const MOCK_ENCOURAGEMENT: Record<string, EncouragementResult> = {
  Animals: {
    growth_tip:
      "Your child is a true animal whisperer — the personality and emotion captured in each creature shows remarkable empathy and observation. To stretch this superpower, try an 'Animal Feelings Day': pick one animal and draw it feeling happy, then scared, then surprised. How does a surprised giraffe look different from a calm one?",
    encouragement_scripts: [
      "I love how you made the tiger's stripes so perfectly even — you were so patient and careful with every single line.",
      "Your whale looks like it could actually splash water! How did you make it look so real?",
      "I can tell you really looked at the flamingo and thought about how it stands. That's what real artists do.",
    ],
  },
  "Family & People": {
    growth_tip:
      "Your child has a gift for capturing the people they love — each family member in their drawings has their own look and personality. That's a real artistic skill! To celebrate this, try making a 'Family Portrait Gallery' together: everyone in the family draws their own self-portrait, and you hang them all side by side.",
    encouragement_scripts: [
      "That self-portrait looks so much like you — I could tell it was you right away just from your smile!",
      "I love how you drew everyone in our family with something special about them. You really see us.",
      "The way you drew mom with all those flowers around her — she's going to love it when she sees it.",
    ],
  },
  "Games & Adventure": {
    growth_tip:
      "Your child is a world-builder — this month they created entire universes full of action, characters, and drama. That's an incredible creative gift! To take it even further, try a 'Story in Three Panels' challenge: draw what happened BEFORE the scene, the scene itself, and what happens AFTER. Comics, here we come!",
    encouragement_scripts: [
      "I noticed how you drew the character in mid-jump — how did you figure out how to show someone moving?",
      "That arena scene has so many characters and so much happening — I could look at it for hours and keep finding new things.",
      "The way you thought about what each character looks like shows you really know them. That's what great storytellers do.",
    ],
  },
  "Space & Planets": {
    growth_tip:
      "Your child's imagination reaches all the way to the stars — literally! The space scenes this month show wonderful scientific curiosity mixed with pure creativity. Try a 'Space Mission' drawing challenge: design a spaceship for a specific mission. What does a ship that only travels to ice planets look like?",
    encouragement_scripts: [
      "I love that your astronaut looks like they're floating — you really thought about what it feels like in space, not just what it looks like.",
      "The way you drew Saturn with its rings so carefully — did you look at a picture, or did you just know?",
      "That rocket has so many details on it. I can tell you really thought about how it would actually work.",
    ],
  },
};

const DEFAULT_ENCOURAGEMENT: EncouragementResult = {
  growth_tip:
    "Your child is blossoming into a wonderfully expressive artist — each piece this month showed new confidence and creativity. To celebrate, try a 'Draw What You Hear' challenge: play their favorite song and ask them to draw what the music looks like. There's no wrong answer!",
  encouragement_scripts: [
    "I love how much color you used — it feels like the picture is full of energy, just like you.",
    "You spent so much time on this — I could see you really thinking about what you wanted to draw.",
    "I notice you always try new things in your drawings. That bravery is what makes you a great artist.",
  ],
};

// ─── JSON cleanup ─────────────────────────────────────────────────────────
function cleanJson(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

function parseEncouragement(raw: string): EncouragementResult {
  try {
    const parsed = JSON.parse(cleanJson(raw));
    return {
      growth_tip:
        typeof parsed.growth_tip === "string"
          ? parsed.growth_tip
          : DEFAULT_ENCOURAGEMENT.growth_tip,
      encouragement_scripts: Array.isArray(parsed.encouragement_scripts)
        ? parsed.encouragement_scripts.slice(0, 3)
        : DEFAULT_ENCOURAGEMENT.encouragement_scripts,
    };
  } catch {
    console.warn("[generateEncouragement] JSON parse failed, using fallback");
    return DEFAULT_ENCOURAGEMENT;
  }
}

// ─── Main export ──────────────────────────────────────────────────────────
export async function generateEncouragement(
  analyses: ArtworkAnalysis[],
  topInterest: string,
  milestoneDetected: string,
  childName?: string
): Promise<EncouragementResult> {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 60));
    // Find the closest matching mock, fall back to default
    const result =
      MOCK_ENCOURAGEMENT[topInterest] ??
      Object.entries(MOCK_ENCOURAGEMENT).find(([key]) =>
        topInterest.toLowerCase().includes(key.toLowerCase().split(" ")[0])
      )?.[1] ??
      DEFAULT_ENCOURAGEMENT;

    console.log(
      `[MOCK] generateEncouragement: top interest "${topInterest}" → growth tip generated`
    );
    return result;
  }

  const client = getAnthropicClient();
  const prompt = buildEncouragementPrompt(
    analyses,
    topInterest,
    milestoneDetected,
    childName
  );

  const response = await client.messages.create({
    model: VISION_MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const firstBlock = response.content[0];
  if (firstBlock.type !== "text") {
    throw new Error(
      `Unexpected encouragement response type: ${firstBlock.type}`
    );
  }

  return parseEncouragement(firstBlock.text);
}
