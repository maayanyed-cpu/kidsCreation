import { prisma } from "@/lib/db/prisma";
import { mapInsight } from "@/lib/db/insightMapper";
import { deserialize } from "@/lib/db/serialization";
import { ParentInsightDashboard } from "@/components/insights/ParentInsightDashboard";
import type { ArtworkAnalysis } from "@/types/artwork";

// Hardcoded for now — in production, derive from the authenticated session.
const CHILD_ID = "child_001";
const CHILD_NAME = "Zohar";

async function getLatestInsight() {
  const raw = await prisma.insights.findFirst({
    where: { child_id: CHILD_ID },
    orderBy: { created_at: "desc" },
  });
  return raw ? mapInsight(raw) : null;
}

async function getAllPeriods() {
  const rows = await prisma.insights.findMany({
    where: { child_id: CHILD_ID },
    select: { analysis_period: true },
    orderBy: { created_at: "desc" },
  });
  return rows.map((r) => r.analysis_period);
}

async function getArtworksForChild(): Promise<ArtworkAnalysis[]> {
  const rows = await prisma.artworkAnalysis.findMany({
    where: { child_id: CHILD_ID },
    orderBy: { analysis_date: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    artwork_id: r.artwork_id,
    child_id: r.child_id,
    image_url: r.image_url,
    analysis_date: r.analysis_date,
    predominant_colors: deserialize(r.predominant_colors),
    main_subjects: deserialize(r.main_subjects),
    technique_notes: r.technique_notes,
    ai_tags: deserialize(r.ai_tags),
    emotional_tone: r.emotional_tone,
  }));
}

export default async function DashboardPage() {
  const [initialInsight, periods, artworks] = await Promise.all([
    getLatestInsight(),
    getAllPeriods(),
    getArtworksForChild(),
  ]);

  return (
    <ParentInsightDashboard
      initialInsight={initialInsight}
      childId={CHILD_ID}
      childName={CHILD_NAME}
      availablePeriods={periods}
      allArtworks={artworks}
    />
  );
}
