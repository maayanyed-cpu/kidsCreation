import { deserialize } from "./serialization";
import type { Insight, VisualEvolution, ThematicFocus } from "@/types/insights";

type RawInsight = {
  id: string;
  child_id: string;
  analysis_period: string;
  tags: string;
  sentiment: string;
  milestone_detected: string;
  top_interest: string;
  growth_tip: string;
  encouragement_scripts: string;
  visual_evolution: unknown;
  thematic_focus: unknown;
  created_at: Date;
};

export function mapInsight(raw: RawInsight): Insight {
  return {
    id: raw.id,
    child_id: raw.child_id,
    analysis_period: raw.analysis_period,
    tags: deserialize(raw.tags),
    sentiment: raw.sentiment,
    milestone_detected: raw.milestone_detected,
    top_interest: raw.top_interest,
    growth_tip: raw.growth_tip,
    encouragement_scripts: deserialize(raw.encouragement_scripts),
    visual_evolution: raw.visual_evolution as VisualEvolution,
    thematic_focus: raw.thematic_focus as ThematicFocus,
    created_at: raw.created_at,
  };
}
