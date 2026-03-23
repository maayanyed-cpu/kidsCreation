export interface VisualEvolution {
  color_diversity: number; // 0-100
  line_confidence: string; // e.g. "Tentative", "Developing", "Confident", "Expressive"
  subject_complexity: string; // e.g. "Simple shapes", "Stick figures", "Detailed scenes"
}

export interface ThematicFocus {
  subjects: Record<string, number>; // e.g. { "animals": 0.7, "family": 0.2, "abstract": 0.1 }
}

export interface Insight {
  id: string;
  child_id: string;
  analysis_period: string;
  tags: string[];
  sentiment: string;
  milestone_detected: string;
  top_interest: string;
  growth_tip: string;
  encouragement_scripts: string[];
  visual_evolution: VisualEvolution;
  thematic_focus: ThematicFocus;
  created_at: Date;
}

export function isVisualEvolution(v: unknown): v is VisualEvolution {
  return (
    typeof v === "object" &&
    v !== null &&
    "color_diversity" in v &&
    "line_confidence" in v &&
    "subject_complexity" in v
  );
}

export function isThematicFocus(v: unknown): v is ThematicFocus {
  return (
    typeof v === "object" &&
    v !== null &&
    "subjects" in v &&
    typeof (v as ThematicFocus).subjects === "object"
  );
}
