import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

function s(arr: string[]): string {
  return JSON.stringify(arr);
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
      date_of_birth: new Date("2017-06-15"), // ~age 8-9
    },
    {
      id: "child_002",
      parent_id: testParent.id,
      name: "Noa",
      name_he: "נועה",
      avatar_emoji: "🌸",
      date_of_birth: new Date("2019-09-10"), // ~age 6.5, the gymnast
    },
    {
      id: "child_003",
      parent_id: testParent.id,
      name: "Zohar",
      name_he: "זוהר",
      avatar_emoji: "🦁",
      date_of_birth: new Date("2023-03-15"), // ~age 3
    },
  ];

  for (const child of children) {
    await prisma.child.upsert({
      where: { id: child.id },
      update: { parent_id: child.parent_id },
      create: child,
    });
  }

  console.log(`Created ${children.length} Child records`);

  // ─── Arad (child_001) — 3 artworks, no insights (shows empty/progress state) ─

  const aradArtworks = [
    {
      artwork_id: "art_arad_001",
      child_id: "child_001",
      image_url: "https://picsum.photos/seed/arad1/400/300",
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
      image_url: "https://picsum.photos/seed/arad2/400/300",
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
      image_url: "https://picsum.photos/seed/arad3/400/300",
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
      image_url: "https://picsum.photos/seed/noa1/400/300",
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
      image_url: "https://picsum.photos/seed/noa2/400/300",
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
      image_url: "https://picsum.photos/seed/noa3/400/300",
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
      image_url: "https://picsum.photos/seed/art1/400/300",
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
      image_url: "https://picsum.photos/seed/art2/400/300",
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
      image_url: "https://picsum.photos/seed/art3/400/300",
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
      image_url: "https://picsum.photos/seed/art4/400/300",
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
      image_url: "https://picsum.photos/seed/art5/400/300",
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
      image_url: "https://picsum.photos/seed/art6/400/300",
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
      image_url: "https://picsum.photos/seed/art7/400/300",
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
      image_url: "https://picsum.photos/seed/art8/400/300",
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
      image_url: "https://picsum.photos/seed/art9/400/300",
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
      image_url: "https://picsum.photos/seed/art10/400/300",
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
      image_url: "https://picsum.photos/seed/art11/400/300",
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
      image_url: "https://picsum.photos/seed/art12/400/300",
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
      image_url: "https://picsum.photos/seed/art13/400/300",
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
      image_url: "https://picsum.photos/seed/art14/400/300",
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
      image_url: "https://picsum.photos/seed/art15/400/300",
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
      image_url: "https://picsum.photos/seed/art16/400/300",
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
      image_url: "https://picsum.photos/seed/art17/400/300",
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
      image_url: "https://picsum.photos/seed/art18/400/300",
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
      image_url: "https://picsum.photos/seed/art19/400/300",
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
      image_url: "https://picsum.photos/seed/art20/400/300",
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
      image_url: "https://picsum.photos/seed/art21/400/300",
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
