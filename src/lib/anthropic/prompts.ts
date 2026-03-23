import type { ArtworkAnalysis } from "@/types/artwork";

// ─── Per-image artwork analysis prompt ─────────────────────────────────────

export const ARTWORK_ANALYSIS_SYSTEM = `You are a warm, observant child development specialist who analyzes children's artwork. Your role is to notice what's wonderful, specific, and developmental about each piece.

Rules you must never break:
- NEVER use critical or negative language
- Frame everything as growth, curiosity, and exploration
- Be specific — mention actual details you see in the image, not generic observations
- Emotional tone should reflect what the child expressed, not what you think they should feel`;

export function buildArtworkAnalysisPrompt(): string {
  return `Analyze this child's artwork and respond with a JSON object. Do not include any text outside the JSON.

{
  "predominant_colors": ["list up to 5 colors you can see, from most to least prominent"],
  "main_subjects": ["list 1-4 main things depicted — be specific, e.g. 'tiger with stripes' not just 'animal'"],
  "technique_notes": "One specific, encouraging observation about technique or creativity. Reference an actual detail you see. 2-3 sentences max.",
  "ai_tags": ["4-6 single-word or hyphenated descriptive tags, e.g. 'animals', 'bright_colors', 'symmetry', 'storytelling'"],
  "emotional_tone": "One word capturing the emotional energy of the piece, e.g. 'Joyful', 'Calm', 'Energetic', 'Dreamy', 'Bold'"
}`;
}

// ─── Monthly aggregation prompt ─────────────────────────────────────────────

const HEBREW_AGGREGATION_NOTE = `
LANGUAGE REQUIREMENT: Write all free-text content in Hebrew (right-to-left).
The following fields must remain in English (they are enum values used by the app):
- "sentiment": must be exactly one of: Joyful, Calm, Energetic, Expressive, Dreamy, Curious, Bold, Warm, Playful
- "line_confidence": must be exactly one of: Tentative, Developing, Confident, Expressive
- "top_interest": must be 2-4 words in English (e.g. "Animals & Nature", "Space & Planets")
All other text fields — milestone_detected, subject_complexity, thematic_focus subject keys, tags — must be in Hebrew.
`;

export function buildAggregationPrompt(
  analyses: ArtworkAnalysis[],
  childName: string = "this child",
  locale: "en" | "he" = "en"
): string {
  const analysisJson = analyses.map((a) => ({
    subjects: a.main_subjects,
    colors: a.predominant_colors,
    tags: a.ai_tags,
    technique: a.technique_notes,
    tone: a.emotional_tone,
  }));

  return `You are a warm child development specialist writing a monthly creative growth report. Below are analyses of ${analyses.length} artworks created by ${childName} this month.
${locale === "he" ? HEBREW_AGGREGATION_NOTE : ""}
ARTWORK ANALYSES:
${JSON.stringify(analysisJson, null, 2)}

Based on these analyses, respond with a JSON object. Do not include any text outside the JSON.

{
  "sentiment": "The single dominant emotional quality across this month's work — one word, e.g. 'Joyful', 'Energetic', 'Calm', 'Expressive', 'Curious'",
  "milestone_detected": "A specific developmental observation about what this child accomplished this month. Reference actual artwork details. 1-2 sentences. Never critical. If no clear milestone, describe the most notable creative pattern instead.",
  "top_interest": "The single clearest theme or obsession this month — 2-4 words, e.g. 'Animals', 'Space & Planets', 'Family Life', 'Games & Adventure'",
  "tags": ["4-6 tags summarizing the month's creative themes, e.g. 'animals', 'bright_colors', 'storytelling'"],
  "visual_evolution": {
    "color_diversity": <number 0-100 estimating palette breadth: 0=monochrome, 100=full rainbow spectrum>,
    "line_confidence": "One of: 'Tentative' | 'Developing' | 'Confident' | 'Expressive'",
    "subject_complexity": "Brief phrase describing complexity, e.g. 'Single subjects', 'Multiple figures', 'Detailed scenes with backgrounds', 'Complex compositions with narrative'"
  },
  "thematic_focus": {
    "subjects": {
      "<subject>": <proportion 0.0-1.0>,
      "<subject>": <proportion 0.0-1.0>
    }
  }
}

The thematic_focus.subjects values must sum to 1.0. Include 3-6 subjects.`;
}

// ─── Encouragement + growth tip prompt ──────────────────────────────────────

const HEBREW_ENCOURAGEMENT_NOTE = `
LANGUAGE REQUIREMENT: Write all content in Hebrew (right-to-left). Both "growth_tip" and all three "encouragement_scripts" must be in Hebrew.
`;

export function buildEncouragementPrompt(
  analyses: ArtworkAnalysis[],
  topInterest: string,
  milestoneDetected: string,
  childName: string = "your child",
  locale: "en" | "he" = "en"
): string {
  const highlights = analyses.slice(0, 5).map((a) => ({
    subjects: a.main_subjects.slice(0, 2),
    technique: a.technique_notes,
    tags: a.ai_tags.slice(0, 3),
  }));

  return `You are writing the most encouraging part of a child's Creative Growth Report for their parent.
${locale === "he" ? HEBREW_ENCOURAGEMENT_NOTE : ""}

TOP INTEREST THIS MONTH: ${topInterest}
MILESTONE: ${milestoneDetected}
SELECTED ARTWORK HIGHLIGHTS:
${JSON.stringify(highlights, null, 2)}

Using the "Celebrate & Stretch" framework:
1. CELEBRATE what the child is already doing brilliantly (be specific, reference actual details)
2. STRETCH by suggesting one playful, low-pressure activity that extends their strength

Respond with a JSON object. Do not include any text outside the JSON.

{
  "growth_tip": "A 2-4 sentence Celebrate & Stretch recommendation for the parent. First celebrate something specific (e.g. '${childName} is a master of...'). Then suggest a playful activity. Make it feel exciting, not like homework. Example tone: 'Zohar is a master of monochrome! To expand her toolkit, try a Blue Day challenge where everything she draws uses shades of blue.'",
  "encouragement_scripts": [
    "Script 1: A specific praise line the parent can say out loud to their child. Must reference a real detail from the artwork (e.g. 'I noticed how much detail you put into the wings of that bird!'). 1 sentence.",
    "Script 2: Another specific, different praise line referencing a different artwork detail.",
    "Script 3: A third praise line that celebrates effort or creative thinking, not just the result."
  ]
}`;
}
