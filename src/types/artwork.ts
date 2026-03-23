export interface ArtworkAnalysis {
  id: string;
  artwork_id: string;
  child_id: string;
  image_url: string;
  analysis_date: Date;
  predominant_colors: string[];
  main_subjects: string[];
  technique_notes: string;
  ai_tags: string[];
  emotional_tone: string;
}
