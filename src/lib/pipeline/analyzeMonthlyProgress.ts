import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { serialize, deserialize } from "@/lib/db/serialization";
import { analyzeArtworkImage } from "@/lib/anthropic/analyzeArtwork";
import { aggregateAnalyses } from "@/lib/anthropic/aggregateAnalyses";
import { generateEncouragement } from "@/lib/anthropic/generateEncouragement";
import type { ArtworkAnalysis } from "@/types/artwork";
import type { Insight } from "@/types/insights";

// ─── Result types ─────────────────────────────────────────────────────────

export interface PipelineSuccess {
  ok: true;
  insight: Insight;
}

export interface PipelineSkipped {
  ok: false;
  reason: "insufficient_artworks";
  message: string;
  artworkCount: number;
}

export type PipelineResult = PipelineSuccess | PipelineSkipped;

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatPeriod(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function thirtyDaysAgo(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d;
}

/** Map a raw DB ArtworkAnalysis row to the typed ArtworkAnalysis interface */
function mapDbArtwork(row: {
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
}): ArtworkAnalysis {
  return {
    id: row.id,
    artwork_id: row.artwork_id,
    child_id: row.child_id,
    image_url: row.image_url,
    thumb_url: row.thumb_url,
    title: row.title,
    status: row.status,
    analysis_date: row.analysis_date,
    predominant_colors: deserialize(row.predominant_colors),
    main_subjects: deserialize(row.main_subjects),
    technique_notes: row.technique_notes,
    ai_tags: deserialize(row.ai_tags),
    emotional_tone: row.emotional_tone,
    deleted_at: row.deleted_at,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────

/**
 * Analyzes the last 30 days of artwork for a child and generates (or updates)
 * a monthly Insight record.
 *
 * Steps:
 * 1. Fetch artworks from last 30 days
 * 2. Skip if fewer than 5 (not enough data for meaningful insight)
 * 3. For each artwork without an existing analysis, call Vision API sequentially
 * 4. Persist each analysis to DB as we go (pipeline is crash-resumable)
 * 5. Aggregate all analyses into monthly insight fields
 * 6. Generate growth_tip and encouragement_scripts
 * 7. Upsert into Insights (@@unique prevents duplicates for same period)
 *
 * Production note: This function can take 30–120s with live API calls.
 * Move to a background job (e.g., Vercel waitUntil or a queue) before
 * exposing this to production traffic.
 */
export async function analyzeMonthlyProgress(
  childId: string,
  childName?: string,
  periodOverride?: string,
  locale?: "en" | "he"
): Promise<PipelineResult> {
  const period = periodOverride ?? formatPeriod();
  const since = thirtyDaysAgo();

  console.log(`[pipeline] Starting analysis for child=${childId}, period="${period}"`);

  // ── Step 1: Fetch artworks from last 30 days ────────────────────────────
  const rawArtworks = await prisma.artworkAnalysis.findMany({
    where: {
      child_id: childId,
      analysis_date: { gte: since },
      deleted_at: null,
    },
    orderBy: { analysis_date: "asc" },
  });

  // ── Step 2: Skip if fewer than 5 ────────────────────────────────────────
  if (rawArtworks.length < 5) {
    console.log(
      `[pipeline] Skipping: only ${rawArtworks.length} artworks found (minimum 5 required)`
    );
    return {
      ok: false,
      reason: "insufficient_artworks",
      message: `Only ${rawArtworks.length} artwork${rawArtworks.length === 1 ? "" : "s"} found in the last 30 days. At least 5 are needed to generate a Creative Growth Report.`,
      artworkCount: rawArtworks.length,
    };
  }

  console.log(`[pipeline] Found ${rawArtworks.length} artworks to process`);

  // ── Step 3 & 4: Analyze each artwork, save to DB as we go ───────────────
  const analyses: ArtworkAnalysis[] = [];

  for (let i = 0; i < rawArtworks.length; i++) {
    const raw = rawArtworks[i];

    // Check if this artwork already has a technique_notes (i.e., was analyzed)
    // Our seed data includes technique_notes, so seeded artworks are treated as
    // already-analyzed and skipped — only newly uploaded artworks need Vision API.
    const alreadyAnalyzed =
      raw.technique_notes &&
      raw.technique_notes !== "" &&
      raw.ai_tags &&
      raw.ai_tags !== "[]";

    if (alreadyAnalyzed) {
      analyses.push(mapDbArtwork(raw));
      continue;
    }

    // Call Vision API (or mock)
    const result = await analyzeArtworkImage(
      {
        artwork_id: raw.artwork_id,
        child_id: raw.child_id,
        image_url: raw.image_url,
      },
      i
    );

    // Persist result to DB
    const updated = await prisma.artworkAnalysis.update({
      where: { artwork_id: raw.artwork_id },
      data: {
        predominant_colors: serialize(result.predominant_colors),
        main_subjects: serialize(result.main_subjects),
        technique_notes: result.technique_notes,
        ai_tags: serialize(result.ai_tags),
        emotional_tone: result.emotional_tone,
        status: "analyzed",
      },
    });

    analyses.push(mapDbArtwork(updated));
    console.log(`[pipeline] Analyzed artwork ${i + 1}/${rawArtworks.length}`);
  }

  // ── Step 5: Aggregate into monthly insight fields ────────────────────────
  const aggregation = await aggregateAnalyses(analyses, childName, locale);

  // ── Step 6: Generate encouragement + growth tip ──────────────────────────
  const encouragement = await generateEncouragement(
    analyses,
    aggregation.top_interest,
    aggregation.milestone_detected,
    childName,
    locale
  );

  // ── Step 7: Upsert Insights record ──────────────────────────────────────
  const insightData = {
    child_id: childId,
    analysis_period: period,
    tags: serialize(aggregation.tags),
    sentiment: aggregation.sentiment,
    milestone_detected: aggregation.milestone_detected,
    top_interest: aggregation.top_interest,
    growth_tip: encouragement.growth_tip,
    encouragement_scripts: serialize(encouragement.encouragement_scripts),
    visual_evolution: aggregation.visual_evolution as unknown as Prisma.InputJsonValue,
    thematic_focus: aggregation.thematic_focus as unknown as Prisma.InputJsonValue,
  };

  const upserted = await prisma.insights.upsert({
    where: {
      child_id_analysis_period: {
        child_id: childId,
        analysis_period: period,
      },
    },
    update: insightData,
    create: insightData,
  });

  console.log(`[pipeline] Insight upserted: id=${upserted.id}, period="${period}"`);

  // Map DB row to typed Insight
  const insight: Insight = {
    id: upserted.id,
    child_id: upserted.child_id,
    analysis_period: upserted.analysis_period,
    tags: deserialize(upserted.tags),
    sentiment: upserted.sentiment,
    milestone_detected: upserted.milestone_detected,
    top_interest: upserted.top_interest,
    growth_tip: upserted.growth_tip,
    encouragement_scripts: deserialize(upserted.encouragement_scripts),
    visual_evolution: upserted.visual_evolution as unknown as Insight["visual_evolution"],
    thematic_focus: upserted.thematic_focus as unknown as Insight["thematic_focus"],
    created_at: upserted.created_at,
  };

  return { ok: true, insight };
}

// ─── CLI test entry point ─────────────────────────────────────────────────
// Run: npx tsx src/lib/pipeline/analyzeMonthlyProgress.ts
if (
  process.env.NODE_ENV !== "production" &&
  typeof require !== "undefined" &&
  require.main === module
) {
  analyzeMonthlyProgress("child_001", "Zohar")
    .then((result) => {
      if (result.ok) {
        console.log("\n✓ Pipeline succeeded:");
        console.log(`  Period: ${result.insight.analysis_period}`);
        console.log(`  Sentiment: ${result.insight.sentiment}`);
        console.log(`  Top Interest: ${result.insight.top_interest}`);
        console.log(`  Tags: ${result.insight.tags.join(", ")}`);
        console.log(`  Milestone: ${result.insight.milestone_detected}`);
        console.log(`  Growth Tip: ${result.insight.growth_tip.slice(0, 80)}...`);
        console.log(
          `  Scripts: ${result.insight.encouragement_scripts.length} generated`
        );
      } else {
        console.log(`\n⚠ Pipeline skipped: ${result.message}`);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n✗ Pipeline error:", err);
      process.exit(1);
    });
}
