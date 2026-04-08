export interface Child {
  id: string;
  name: string;
  name_he?: string | null;
  avatar_emoji: string;
  avatar_color?: string;
  share_code?: string | null;
  date_of_birth?: Date | null;
  is_public?: boolean;
  created_at: Date;
}
