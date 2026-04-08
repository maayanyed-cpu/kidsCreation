import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

function s(arr: string[]): string {
  return JSON.stringify(arr);
}

// Real children's artwork from Wikimedia Commons (CC-licensed)
const KID_ART = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Barnebilde_tegning_med_sol_og_blomster.jpg/400px-Barnebilde_tegning_med_sol_og_blomster.jpg", // sun + flowers drawing
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Autistic_Child_Drawing_3_Friends.jpg/400px-Autistic_Child_Drawing_3_Friends.jpg", // stick figures / friends
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/A_tree_that_was_painted_by_year_6-7.jpg/400px-A_tree_that_was_painted_by_year_6-7.jpg", // painted tree
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Art_Gabrielle_6_soon.jpg/400px-Art_Gabrielle_6_soon.jpg", // 6yo artwork
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Art_of_Gabrielle_when_she_was_5.jpg/400px-Art_of_Gabrielle_when_she_was_5.jpg", // 5yo artwork
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Autoportrait_-_enfant_-_3_ans.jpeg/400px-Autoportrait_-_enfant_-_3_ans.jpeg", // 3yo self-portrait
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Barnetegninger_01.jpg/400px-Barnetegninger_01.jpg", // colorful crayon drawing
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dessin_d_enfant.jpg/400px-Dessin_d_enfant.jpg", // child's drawing
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Dessin_efant.jpg/400px-Dessin_efant.jpg", // child's sketch
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Arbre_noel_dessin.jpg/400px-Arbre_noel_dessin.jpg", // Christmas tree drawing
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/A_childs_drawing_-_blomstereng_tegning.jpg/400px-A_childs_drawing_-_blomstereng_tegning.jpg", // flower meadow drawing
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/1624869955729_kajsa.jpg/400px-1624869955729_kajsa.jpg", // colorful kid art
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Barnetegninger_02.jpg/400px-Barnetegninger_02.jpg", // more crayon art
];
/** Cycle through the art pool deterministically */
function kidArt(index: number): string {
  return KID_ART[index % KID_ART.length];
}

async function main() {
  console.log("Seeding database with mock data...");

  // ─── Test parent user ────────────────────────────────────────────────────────

  const testParent = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      id: "user_test_001",
      email: "test@example.com",
      name: "Test Parent",
      onboarding_complete: true,
      locale: "en",
    },
  });

  console.log(`Upserted test parent: ${testParent.email}`);

  // ─── Children ────────────────────────────────────────────────────────────────

  const children = [
    {
      id: "child_001",
      parent_id: testParent.id,
      name: "Arad",
      name_he: "אראד",
      avatar_emoji: "⚡",
      share_code: "arad-x1k9",
      date_of_birth: new Date("2016-01-15"), // ~age 10
      is_public: true,
    },
    {
      id: "child_002",
      parent_id: testParent.id,
      name: "Noa",
      name_he: "נועה",
      avatar_emoji: "🌸",
      share_code: "noa-m3p7",
      date_of_birth: new Date("2019-09-10"), // ~age 6.5, the gymnast
      is_public: false,
    },
    {
      id: "child_003",
      parent_id: testParent.id,
      name: "Zohar",
      name_he: "זוהר",
      avatar_emoji: "🦁",
      share_code: "zohar-a7k2",
      date_of_birth: new Date("2023-03-15"), // ~age 3
      is_public: false,
    },
  ];

  for (const child of children) {
    await prisma.child.upsert({
      where: { id: child.id },
      update: { parent_id: child.parent_id, share_code: child.share_code },
      create: child,
    });
  }

  console.log(`Created ${children.length} Child records`);

  // ─── Arad (child_001) — 3 artworks, no insights (shows empty/progress state) ─

  const aradArtworks = [
    {
      artwork_id: "art_arad_001",
      child_id: "child_001",
      image_url: kidArt(0),
      analysis_date: new Date("2026-03-03"),
      predominant_colors: s(["blue", "orange", "red"]),
      main_subjects: s(["Brawl Stars character", "battle arena"]),
      technique_notes:
        "Dynamic action lines radiate from the central character, showing a strong instinct for conveying energy and movement.",
      ai_tags: s(["gaming", "brawl_stars", "action", "bold_colors"]),
      emotional_tone: "Energetic",
    },
    {
      artwork_id: "art_arad_002",
      child_id: "child_001",
      image_url: kidArt(1),
      analysis_date: new Date("2026-03-10"),
      predominant_colors: s(["green", "brown", "yellow"]),
      main_subjects: s(["soccer player", "goal", "crowd"]),
      technique_notes:
        "First crowd scene! Tiny figures in the background demonstrate an emerging grasp of depth and scale.",
      ai_tags: s(["sports", "soccer", "crowd", "perspective"]),
      emotional_tone: "Joyful",
    },
    {
      artwork_id: "art_arad_003",
      child_id: "child_001",
      image_url: kidArt(2),
      analysis_date: new Date("2026-03-18"),
      predominant_colors: s(["black", "silver", "red"]),
      main_subjects: s(["robot warrior", "laser beams"]),
      technique_notes:
        "Careful geometric shapes for the robot's body show growing patience and precision with line work.",
      ai_tags: s(["technology", "fantasy", "geometric", "detail_work"]),
      emotional_tone: "Bold",
    },
  ];

  // ─── Noa (child_002) — 3 artworks, no insights (shows empty/progress state) ──

  const noaArtworks = [
    {
      artwork_id: "art_noa_001",
      child_id: "child_002",
      image_url: kidArt(3),
      analysis_date: new Date("2026-03-04"),
      predominant_colors: s(["pink", "purple", "gold"]),
      main_subjects: s(["gymnast on balance beam", "spotlight"]),
      technique_notes:
        "The gymnast's outstretched arms perfectly capture the poise and balance of the sport — this shows keen observational skill.",
      ai_tags: s(["gymnastics", "movement", "elegance", "sports"]),
      emotional_tone: "Expressive",
    },
    {
      artwork_id: "art_noa_002",
      child_id: "child_002",
      image_url: kidArt(4),
      analysis_date: new Date("2026-03-11"),
      predominant_colors: s(["teal", "pink", "white"]),
      main_subjects: s(["ballet dancer", "stage", "flowers"]),
      technique_notes:
        "The tutu is drawn with individual layers of ruffles — this meticulous attention to texture is remarkable.",
      ai_tags: s(["dance", "performance", "detail_work", "texture"]),
      emotional_tone: "Dreamy",
    },
    {
      artwork_id: "art_noa_003",
      child_id: "child_002",
      image_url: kidArt(5),
      analysis_date: new Date("2026-03-19"),
      predominant_colors: s(["yellow", "orange", "green"]),
      main_subjects: s(["unicorn", "rainbow", "meadow"]),
      technique_notes:
        "A joyful, rainbow-filled scene with a unicorn that has a distinctly playful personality — the smile says it all.",
      ai_tags: s(["fantasy", "animals", "rainbow", "bright_colors"]),
      emotional_tone: "Joyful",
    },
  ];

  // ─── Zohar (child_003) — full 3 months of artworks + insights ─────────────────

  const januaryArtworks = [
    {
      artwork_id: "art_jan_001",
      child_id: "child_003",
      image_url: kidArt(6),
      analysis_date: new Date("2026-01-05"),
      predominant_colors: s(["red", "yellow", "blue"]),
      main_subjects: s(["lion", "sun"]),
      technique_notes:
        "Bold, confident strokes with bright primary colors. The lion's mane shows delightful circular layering.",
      ai_tags: s(["animals", "nature", "bold_colors", "circular_patterns"]),
      emotional_tone: "Joyful",
    },
    {
      artwork_id: "art_jan_002",
      child_id: "child_003",
      image_url: kidArt(7),
      analysis_date: new Date("2026-01-08"),
      predominant_colors: s(["orange", "yellow", "green"]),
      main_subjects: s(["giraffe", "trees"]),
      technique_notes:
        "Wonderful sense of scale — the giraffe stretches to the top of the page, showing spatial awareness.",
      ai_tags: s(["animals", "nature", "tall_subjects", "scale_awareness"]),
      emotional_tone: "Joyful",
    },
    {
      artwork_id: "art_jan_003",
      child_id: "child_003",
      image_url: kidArt(8),
      analysis_date: new Date("2026-01-12"),
      predominant_colors: s(["purple", "pink", "white"]),
      main_subjects: s(["elephant", "flowers"]),
      technique_notes:
        "Gentle, flowing lines for the elephant contrast beautifully with the tiny detailed flowers.",
      ai_tags: s(["animals", "nature", "contrast", "detail_work"]),
      emotional_tone: "Calm",
    },
    {
      artwork_id: "art_jan_004",
      child_id: "child_003",
      image_url: kidArt(9),
      analysis_date: new Date("2026-01-15"),
      predominant_colors: s(["blue", "green", "grey"]),
      main_subjects: s(["whale", "ocean", "fish"]),
      technique_notes:
        "First underwater scene! The wavy blue lines to represent water show growing understanding of environments.",
      ai_tags: s(["animals", "ocean", "environment_awareness", "blue_palette"]),
      emotional_tone: "Calm",
    },
    {
      artwork_id: "art_jan_005",
      child_id: "child_003",
      image_url: kidArt(10),
      analysis_date: new Date("2026-01-19"),
      predominant_colors: s(["red", "orange", "black"]),
      main_subjects: s(["tiger", "stripes"]),
      technique_notes:
        "The alternating stripe pattern on the tiger shows emerging pattern recognition and repetition skills.",
      ai_tags: s(["animals", "patterns", "repetition", "warm_colors"]),
      emotional_tone: "Bold",
    },
    {
      artwork_id: "art_jan_006",
      child_id: "child_003",
      image_url: kidArt(11),
      analysis_date: new Date("2026-01-22"),
      predominant_colors: s(["green", "brown", "yellow"]),
      main_subjects: s(["monkey", "tree", "bananas"]),
      technique_notes:
        "The bananas are drawn with careful curved shapes — a lovely example of shape-to-object mapping.",
      ai_tags: s(["animals", "food", "nature", "curved_shapes"]),
      emotional_tone: "Joyful",
    },
    {
      artwork_id: "art_jan_007",
      child_id: "child_003",
      image_url: kidArt(12),
      analysis_date: new Date("2026-01-28"),
      predominant_colors: s(["pink", "white", "black"]),
      main_subjects: s(["flamingo", "water"]),
      technique_notes:
        "The one-legged stance of the flamingo demonstrates growing confidence in depicting balance.",
      ai_tags: s(["animals", "balance", "pink_palette", "elegance"]),
      emotional_tone: "Calm",
    },
  ];

  const februaryArtworks = [
    {
      artwork_id: "art_feb_001",
      child_id: "child_003",
      image_url: kidArt(13),
      analysis_date: new Date("2026-02-03"),
      predominant_colors: s(["red", "pink", "white"]),
      main_subjects: s(["family", "hearts", "house"]),
      technique_notes:
        "Wonderful Valentine's theme — each family member is drawn with distinct features, showing character awareness.",
      ai_tags: s(["family", "love", "people", "holiday"]),
      emotional_tone: "Warm",
    },
    {
      artwork_id: "art_feb_002",
      child_id: "child_003",
      image_url: kidArt(14),
      analysis_date: new Date("2026-02-07"),
      predominant_colors: s(["blue", "purple", "silver"]),
      main_subjects: s(["stars", "moon", "space"]),
      technique_notes:
        "First space drawing! The scattered stars show expanding imagination beyond the familiar.",
      ai_tags: s(["space", "night", "imagination", "abstract"]),
      emotional_tone: "Dreamy",
    },
    {
      artwork_id: "art_feb_003",
      child_id: "child_003",
      image_url: kidArt(15),
      analysis_date: new Date("2026-02-11"),
      predominant_colors: s(["yellow", "orange", "red"]),
      main_subjects: s(["self_portrait", "smile"]),
      technique_notes:
        "First self-portrait with distinct facial features! Eyes, nose, mouth AND ears — remarkable milestone.",
      ai_tags: s(["self_portrait", "face", "milestone", "people"]),
      emotional_tone: "Joyful",
    },
    {
      artwork_id: "art_feb_004",
      child_id: "child_003",
      image_url: kidArt(16),
      analysis_date: new Date("2026-02-14"),
      predominant_colors: s(["pink", "red", "gold"]),
      main_subjects: s(["mom", "flowers", "hearts"]),
      technique_notes:
        "The flowers around mom are drawn with individual petals — detail work is becoming more refined.",
      ai_tags: s(["family", "love", "holiday", "detail_work"]),
      emotional_tone: "Warm",
    },
    {
      artwork_id: "art_feb_005",
      child_id: "child_003",
      image_url: kidArt(17),
      analysis_date: new Date("2026-02-17"),
      predominant_colors: s(["green", "blue", "white"]),
      main_subjects: s(["dragon", "castle"]),
      technique_notes:
        "The dragon and castle show wonderful storytelling — there's a clear narrative with a hero and a challenge.",
      ai_tags: s(["fantasy", "storytelling", "imagination", "adventure"]),
      emotional_tone: "Energetic",
    },
    {
      artwork_id: "art_feb_006",
      child_id: "child_003",
      image_url: kidArt(18),
      analysis_date: new Date("2026-02-21"),
      predominant_colors: s(["brown", "green", "blue"]),
      main_subjects: s(["dog", "park", "ball"]),
      technique_notes:
        "The dog is mid-run with a sense of motion — this shows understanding of action and energy in drawing.",
      ai_tags: s(["animals", "action", "pets", "outdoor"]),
      emotional_tone: "Joyful",
    },
    {
      artwork_id: "art_feb_007",
      child_id: "child_003",
      image_url: kidArt(19),
      analysis_date: new Date("2026-02-25"),
      predominant_colors: s(["blue", "white", "silver"]),
      main_subjects: s(["robot", "buttons", "lights"]),
      technique_notes:
        "The robot's buttons are numbered and labeled — a beautiful bridge between drawing and early literacy.",
      ai_tags: s(["fantasy", "technology", "numbers", "detail_work"]),
      emotional_tone: "Curious",
    },
  ];

  const marchArtworks = [
    {
      artwork_id: "art_mar_001",
      child_id: "child_003",
      image_url: kidArt(20),
      analysis_date: new Date("2026-03-02"),
      predominant_colors: s(["green", "yellow", "pink"]),
      main_subjects: s(["garden", "flowers", "butterfly"]),
      technique_notes:
        "Spring palette with layered depth — background flowers are smaller than foreground ones, showing perspective.",
      ai_tags: s(["nature", "spring", "perspective", "layering"]),
      emotional_tone: "Joyful",
    },
    {
      artwork_id: "art_mar_002",
      child_id: "child_003",
      image_url: kidArt(21),
      analysis_date: new Date("2026-03-05"),
      predominant_colors: s(["orange", "blue", "white"]),
      main_subjects: s(["basketball_player", "court"]),
      technique_notes:
        "The player is drawn mid-jump — capturing movement in a still image shows advanced visual thinking.",
      ai_tags: s(["sports", "action", "brawl_stars", "movement"]),
      emotional_tone: "Energetic",
    },
    {
      artwork_id: "art_mar_003",
      child_id: "child_003",
      image_url: kidArt(22),
      analysis_date: new Date("2026-03-09"),
      predominant_colors: s(["red", "blue", "yellow", "green"]),
      main_subjects: s(["game_characters", "battle", "arena"]),
      technique_notes:
        "Multiple characters in one scene with an environment — composition skills are developing beautifully.",
      ai_tags: s(["brawl_stars", "gaming", "characters", "composition"]),
      emotional_tone: "Energetic",
    },
    {
      artwork_id: "art_mar_004",
      child_id: "child_003",
      image_url: kidArt(23),
      analysis_date: new Date("2026-03-12"),
      predominant_colors: s(["teal", "purple", "gold"]),
      main_subjects: s(["mermaid", "ocean", "treasure"]),
      technique_notes:
        "The mermaid's scales are drawn individually — this level of patient detail work is truly impressive.",
      ai_tags: s(["fantasy", "ocean", "detail_work", "patience"]),
      emotional_tone: "Dreamy",
    },
    {
      artwork_id: "art_mar_005",
      child_id: "child_003",
      image_url: kidArt(24),
      analysis_date: new Date("2026-03-15"),
      predominant_colors: s(["brown", "green", "blue", "orange"]),
      main_subjects: s(["family_picnic", "trees", "food"]),
      technique_notes:
        "A full family scene with context and environment — narrative complexity is growing every month.",
      ai_tags: s(["family", "outdoor", "storytelling", "context"]),
      emotional_tone: "Warm",
    },
    {
      artwork_id: "art_mar_006",
      child_id: "child_003",
      image_url: kidArt(25),
      analysis_date: new Date("2026-03-18"),
      predominant_colors: s(["blue", "purple", "silver", "gold"]),
      main_subjects: s(["spaceship", "planets", "astronaut"]),
      technique_notes:
        "The astronaut floats between planets — wonderful understanding of weightlessness and space environments.",
      ai_tags: s(["space", "science", "imagination", "detail_work"]),
      emotional_tone: "Curious",
    },
    {
      artwork_id: "art_mar_007",
      child_id: "child_003",
      image_url: kidArt(26),
      analysis_date: new Date("2026-03-21"),
      predominant_colors: s(["red", "orange", "blue", "green", "purple"]),
      main_subjects: s(["rainbow_city", "buildings", "people"]),
      technique_notes:
        "A rainbow city with tiny people in windows — the most compositionally complex work yet. A landmark piece.",
      ai_tags: s(["cityscape", "architecture", "diverse_palette", "milestone"]),
      emotional_tone: "Expressive",
    },
  ];

  // ─── Upsert all ArtworkAnalysis ─────────────────────────────────────────────

  for (const artwork of [
    ...aradArtworks,
    ...noaArtworks,
    ...januaryArtworks,
    ...februaryArtworks,
    ...marchArtworks,
  ]) {
    await prisma.artworkAnalysis.upsert({
      where: { artwork_id: artwork.artwork_id },
      update: artwork,
      create: artwork,
    });
  }

  console.log(
    `Created ${aradArtworks.length + noaArtworks.length + januaryArtworks.length + februaryArtworks.length + marchArtworks.length} ArtworkAnalysis records`
  );

  // ─── Insights for Zohar (child_003) ─────────────────────────────────────────

  const insights = [
    {
      child_id: "child_003",
      analysis_period: "January 2026",
      tags: s(["animals", "nature", "bright_colors", "patterns"]),
      sentiment: "Joyful",
      milestone_detected:
        "Emerging pattern recognition — Zohar's tiger stripes show she understands how patterns create texture and identity in animals.",
      top_interest: "Animals",
      growth_tip:
        "Zohar is a true animal whisperer! Her ability to capture the personality of each creature is remarkable. To stretch this superpower, try an 'Animal Feelings Day' — pick an animal and draw it feeling happy, then sad, then surprised. How does a sad elephant look different from a happy one?",
      encouragement_scripts: s([
        "I love how you made the giraffe so tall it almost touched the top of the page — you really understood how big giraffes are!",
        "The stripes on your tiger are so perfectly even — you were so patient and careful with every single line.",
        "Your flamingo standing on one leg is so elegant! How did you know flamingos do that?",
      ]),
      visual_evolution: {
        color_diversity: 45,
        line_confidence: "Developing",
        subject_complexity: "Single subjects with basic detail",
      },
      thematic_focus: {
        subjects: {
          animals: 0.72,
          nature: 0.18,
          patterns: 0.1,
        },
      },
      created_at: new Date("2026-02-01"),
    },
    {
      child_id: "child_003",
      analysis_period: "February 2026",
      tags: s(["family", "imagination", "storytelling", "milestone", "self_portrait"]),
      sentiment: "Energetic",
      milestone_detected:
        "First self-portrait with full facial features! In her February drawing, Zohar included eyes, nose, mouth, ears, and even hair — a significant leap in self-awareness and observational skill.",
      top_interest: "Family & People",
      growth_tip:
        "Zohar made an incredible leap this month — she drew her very first self-portrait! This shows she's starting to see herself as a character in her own story. Celebrate this by making a 'Family Gallery' together: each family member draws their self-portrait and you hang them all side by side.",
      encouragement_scripts: s([
        "That self-portrait you drew looks so much like you — I could tell it was you right away just from the smile!",
        "I love how you drew mom with flowers all around her. Those petals are so detailed — how long did that take you?",
        "Your robot is amazing — I love that you put numbers on the buttons. That's such a smart idea!",
      ]),
      visual_evolution: {
        color_diversity: 62,
        line_confidence: "Confident",
        subject_complexity: "Multiple subjects with relationships",
      },
      thematic_focus: {
        subjects: {
          family: 0.35,
          fantasy: 0.3,
          animals: 0.15,
          space: 0.12,
          technology: 0.08,
        },
      },
      created_at: new Date("2026-03-01"),
    },
    {
      child_id: "child_003",
      analysis_period: "March 2026",
      tags: s(["composition", "perspective", "storytelling", "diverse_palette", "milestone"]),
      sentiment: "Expressive",
      milestone_detected:
        "Zohar created her most compositionally complex artwork yet — a rainbow city with tiny people visible in windows. This shows advanced spatial thinking, narrative layering, and emotional investment in imaginary worlds.",
      top_interest: "Games & Adventure",
      growth_tip:
        "Zohar is a world-builder! This month she created entire universes — from game arenas to rainbow cities to outer space. To take this even further, try a 'Story in Three Panels' challenge: draw what happened BEFORE the scene, the scene itself, and what happens AFTER. Comics, here we come!",
      encouragement_scripts: s([
        "That rainbow city with the tiny people in the windows is incredible — I want to live there! Did you name the city?",
        "I noticed how you drew the basketball player in mid-jump — how did you know how to show someone moving?",
        "The mermaid's individual scales must have taken so long — that kind of patience shows what a dedicated artist you are.",
      ]),
      visual_evolution: {
        color_diversity: 85,
        line_confidence: "Expressive",
        subject_complexity: "Complex scenes with depth and narrative",
      },
      thematic_focus: {
        subjects: {
          "brawl_stars / gaming": 0.28,
          fantasy: 0.22,
          family: 0.18,
          space: 0.17,
          nature: 0.15,
        },
      },
      created_at: new Date("2026-03-23"),
    },
  ];

  for (const insight of insights) {
    const { tags, encouragement_scripts, visual_evolution, thematic_focus, ...rest } = insight;
    await prisma.insights.upsert({
      where: {
        child_id_analysis_period: {
          child_id: rest.child_id,
          analysis_period: rest.analysis_period,
        },
      },
      update: { ...rest, tags, encouragement_scripts, visual_evolution, thematic_focus },
      create: { ...rest, tags, encouragement_scripts, visual_evolution, thematic_focus },
    });
  }

  console.log(`Created ${insights.length} Insights records`);

  // ─── Weekly Challenges (8 weeks) ──────────────────────────────────────────

  const challenges = [
    {
      title: "Rainbow World",
      title_he: "עולם הקשת",
      description: "Draw something using every color of the rainbow! Can you fit them all in one picture?",
      description_he: "ציירו משהו עם כל צבעי הקשת! אפשר להכניס את כולם לתמונה אחת?",
      emoji: "🌈",
      category: "colors",
      difficulty: "easy",
      week_start: new Date("2026-02-09"),
      week_end: new Date("2026-02-15T23:59:59"),
    },
    {
      title: "My Happy Place",
      title_he: "המקום המאושר שלי",
      description: "Draw the place where you feel happiest. Is it your room? The park? Grandma's house?",
      description_he: "ציירו את המקום שבו אתם הכי שמחים. החדר שלכם? הפארק? אצל סבתא?",
      emoji: "🏠",
      category: "family",
      difficulty: "easy",
      week_start: new Date("2026-02-16"),
      week_end: new Date("2026-02-22T23:59:59"),
    },
    {
      title: "Impossible Animals",
      title_he: "חיות בלתי אפשריות",
      description: "Invent an animal that doesn't exist! What does it eat? Where does it live? Give it a name!",
      description_he: "המציאו חיה שלא קיימת! מה היא אוכלת? איפה היא גרה? תנו לה שם!",
      emoji: "🦄",
      category: "imagination",
      difficulty: "medium",
      week_start: new Date("2026-02-23"),
      week_end: new Date("2026-03-01T23:59:59"),
    },
    {
      title: "Texture Hunt",
      title_he: "ציד המרקמים",
      description: "Create art using something besides a pencil — fingers, sponges, leaves, anything goes!",
      description_he: "צרו אומנות עם משהו שהוא לא עיפרון — אצבעות, ספוגים, עלים, הכל מותר!",
      emoji: "👐",
      category: "technique",
      difficulty: "adventure",
      week_start: new Date("2026-03-02"),
      week_end: new Date("2026-03-08T23:59:59"),
    },
    {
      title: "Dream Drawing",
      title_he: "ציור חלום",
      description: "Draw something from a dream you had. Was it funny? Magical? A little weird? Even better!",
      description_he: "ציירו משהו מחלום שחלמתם. מצחיק? קסום? קצת מוזר? עוד יותר טוב!",
      emoji: "🌙",
      category: "imagination",
      difficulty: "medium",
      week_start: new Date("2026-03-09"),
      week_end: new Date("2026-03-15T23:59:59"),
    },
    {
      title: "Food Art",
      title_he: "אמנות האוכל",
      description: "Draw your favorite meal — make it look so delicious everyone gets hungry!",
      description_he: "ציירו את האוכל האהוב עליכם — שזה ייראה כל כך טעים שכולם ירעבו!",
      emoji: "🍕",
      category: "colors",
      difficulty: "easy",
      week_start: new Date("2026-03-16"),
      week_end: new Date("2026-03-22T23:59:59"),
    },
    {
      title: "Future Me",
      title_he: "אני בעתיד",
      description: "Draw yourself 20 years from now. What will you look like? What will you be doing?",
      description_he: "ציירו את עצמכם בעוד 20 שנה. איך תיראו? מה תעשו?",
      emoji: "🤖",
      category: "imagination",
      difficulty: "medium",
      week_start: new Date("2026-03-23"),
      week_end: new Date("2026-03-29T23:59:59"),
    },
    {
      title: "Underwater Adventure",
      title_he: "הרפתקה מתחת למים",
      description: "What lives at the bottom of the ocean? Show us the creatures, the colors, the world down there!",
      description_he: "מה חי בתחתית האוקיינוס? הראו לנו את היצורים, הצבעים, העולם שלמטה!",
      emoji: "🌊",
      category: "nature",
      difficulty: "medium",
      week_start: new Date("2026-03-30"),
      week_end: new Date("2026-04-05T23:59:59"),
    },
  ];

  for (const ch of challenges) {
    // Use a deterministic ID based on the title for upsert
    const id = `ch_${ch.title.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12)}`;
    await prisma.challenge.upsert({
      where: { id },
      update: ch,
      create: { id, ...ch },
    });
  }

  console.log(`Created ${challenges.length} Challenge records`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
