/**
 * Translation maps for data-driven content that comes from AI/mock in English.
 * Used when locale === "he" to translate tags, interests, sentiments, etc.
 */

// ── AI Tags (shown as pills) ─────────────────────────────────────────────────
export const TAG_HE: Record<string, string> = {
  animals: "חיות",
  nature: "טבע",
  family: "משפחה",
  love: "אהבה",
  fantasy: "פנטזיה",
  space: "חלל",
  ocean: "אוקיינוס",
  storytelling: "סיפור",
  imagination: "דמיון",
  bold_colors: "צבעים עזים",
  bright_colors: "צבעים בהירים",
  circular_patterns: "דפוסים מעגליים",
  scale_awareness: "מודעות לקנה מידה",
  environment: "סביבה",
  personification: "האנשה",
  shape_accuracy: "דיוק צורות",
  patterns: "דפוסים",
  repetition: "חזרתיות",
  character_expression: "ביטוי דמות",
  emotional_intelligence: "אינטליגנציה רגשית",
  geometry: "גאומטריה",
  numbers: "מספרים",
  technology: "טכנולוגיה",
  detail_work: "עבודת פרטים",
  patience: "סבלנות",
  outdoor: "חוץ",
  narrative_depth: "עומק סיפורי",
  conceptual_thinking: "חשיבה מושגית",
  movement: "תנועה",
  science: "מדע",
  people: "אנשים",
  food: "אוכל",
  creative: "יצירתי",
  expressive: "ביטויי",
  night: "לילה",
  milestone: "אבן דרך",
  diverse_palette: "פלטה מגוונת",
  perspective: "פרספקטיבה",
  composition: "קומפוזיציה",
  layering: "שכבות",
  spring: "אביב",
  sports: "ספורט",
  action: "פעולה",
  brawl_stars: "בראול סטארס",
  gaming: "משחקים",
  characters: "דמויות",
  pets: "חיות מחמד",
  self_portrait: "דיוקן עצמי",
  face: "פנים",
  holiday: "חג",
  adventure: "הרפתקה",
  architecture: "אדריכלות",
  cityscape: "נוף עירוני",
  context: "הקשר",
};

// ── Top Interests ─────────────────────────────────────────────────────────────
export const INTEREST_HE: Record<string, string> = {
  Animals: "חיות",
  "Animals & Nature": "חיות וטבע",
  "Family & People": "משפחה ואנשים",
  "Family Life": "חיי משפחה",
  "Games & Adventure": "משחקים והרפתקאות",
  "Space & Planets": "חלל וכוכבי לכת",
  "Fantasy & Magic": "פנטזיה וקסם",
  "Technology & Robots": "טכנולוגיה ורובוטים",
  "Ocean & Sea Creatures": "אוקיינוס ויצורי ים",
  "Nature & Outdoors": "טבע וחוץ",
  "Creative Exploration": "חקירה יצירתית",
};

// ── Sentiments (displayed in UI) ──────────────────────────────────────────────
export const SENTIMENT_HE: Record<string, string> = {
  Joyful: "שמח",
  Calm: "רגוע",
  Energetic: "אנרגטי",
  Expressive: "ביטויי",
  Dreamy: "חלומי",
  Curious: "סקרן",
  Bold: "נועז",
  Warm: "חמים",
  Playful: "משחקי",
};

// ── Line Confidence ───────────────────────────────────────────────────────────
export const CONFIDENCE_HE: Record<string, string> = {
  Tentative: "מהסס",
  Developing: "מתפתח",
  Confident: "בטוח",
  Expressive: "ביטויי",
};

// ── Thematic Focus Subject Keys (from mock/AI data) ───────────────────────────
export const SUBJECT_HE: Record<string, string> = {
  animals: "חיות",
  family: "משפחה",
  fantasy: "פנטזיה",
  nature: "טבע",
  abstract: "מופשט",
  space: "חלל",
  technology: "טכנולוגיה",
  "brawl_stars / gaming": "בראול סטארס / משחקים",
  ocean: "אוקיינוס",
  patterns: "דפוסים",
};

// ── Subject Complexity descriptions ───────────────────────────────────────────
export const COMPLEXITY_HE: Record<string, string> = {
  "Single subjects with basic detail": "נושאים בודדים עם פרטים בסיסיים",
  "Multiple subjects with relationships": "נושאים מרובים עם קשרים ביניהם",
  "Multiple figures with environmental context": "דמויות מרובות עם הקשר סביבתי",
  "Complex scenes with depth and narrative": "סצנות מורכבות עם עומק וסיפור",
  "Complex compositions with narrative": "קומפוזיציות מורכבות עם סיפור",
  "Detailed scenes with backgrounds": "סצנות מפורטות עם רקעים",
  "Single subjects": "נושאים בודדים",
  "Multiple figures": "דמויות מרובות",
};

export function translateComplexity(text: string, locale: string): string {
  if (locale !== "he") return text;
  return COMPLEXITY_HE[text] ?? text;
}

// ── Helper: translate a string if Hebrew, else return as-is ───────────────────
export function translateTag(tag: string, locale: string): string {
  if (locale !== "he") return tag.replace(/_/g, " ");
  return TAG_HE[tag] ?? TAG_HE[tag.toLowerCase()] ?? tag.replace(/_/g, " ");
}

export function translateInterest(interest: string, locale: string): string {
  if (locale !== "he") return interest;
  return INTEREST_HE[interest] ?? interest;
}

export function translateSentiment(sentiment: string, locale: string): string {
  if (locale !== "he") return sentiment;
  return SENTIMENT_HE[sentiment] ?? sentiment;
}

export function translateConfidence(level: string, locale: string): string {
  if (locale !== "he") return level;
  return CONFIDENCE_HE[level] ?? level;
}

export function translateSubject(subject: string, locale: string): string {
  if (locale !== "he") return subject;
  return SUBJECT_HE[subject] ?? SUBJECT_HE[subject.toLowerCase()] ?? subject;
}
