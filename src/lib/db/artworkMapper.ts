import { deserialize } from "./serialization";
import type { ArtworkAnalysis } from "@/types/artwork";

type RawArtwork = {
  id: string;
  artwork_id: string;
  child_id: string;
  image_url: string;
  thumb_url: string | null;
  title: string | null;
  status: string;
  analysis_date: Date;
  predominant_colors: string;
  main_subjects: string;
  technique_notes: string;
  ai_tags: string;
  emotional_tone: string;
  deleted_at: Date | null;
};

export function mapArtwork(raw: RawArtwork): ArtworkAnalysis {
  return {
    id: raw.id,
    artwork_id: raw.artwork_id,
    child_id: raw.child_id,
    image_url: raw.image_url,
    thumb_url: raw.thumb_url,
    title: raw.title,
    status: raw.status,
    analysis_date: raw.analysis_date,
    predominant_colors: deserialize(raw.predominant_colors),
    main_subjects: deserialize(raw.main_subjects),
    technique_notes: raw.technique_notes,
    ai_tags: deserialize(raw.ai_tags),
    emotional_tone: raw.emotional_tone,
    deleted_at: raw.deleted_at,
  };
}
