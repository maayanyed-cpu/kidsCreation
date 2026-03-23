import { prisma } from "@/lib/db/prisma";
import { mapInsight } from "@/lib/db/insightMapper";
import { deserialize } from "@/lib/db/serialization";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";
import { ParentInsightDashboard } from "@/components/insights/ParentInsightDashboard";
import type { ArtworkAnalysis } from "@/types/artwork";
import type { Child } from "@/types/child";

const DEFAULT_CHILD_ID = "child_003";

async function getAllChildren(): Promise<Child[]> {
  const rows = await prisma.child.findMany({ orderBy: { created_at: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    name_he: r.name_he,
    avatar_emoji: r.avatar_emoji,
    date_of_birth: r.date_of_birth,
    created_at: r.created_at,
  }));
}

async function getLatestInsight(childId: string) {
  const raw = await prisma.insights.findFirst({
    where: { child_id: childId },
    orderBy: { created_at: "desc" },
  });
  return raw ? mapInsight(raw) : null;
}

async function getAllPeriods(childId: string) {
  const rows = await prisma.insights.findMany({
    where: { child_id: childId },
    select: { analysis_period: true },
    orderBy: { created_at: "desc" },
  });
  return rows.map((r) => r.analysis_period);
}

async function getArtworksForChild(childId: string): Promise<ArtworkAnalysis[]> {
  const rows = await prisma.artworkAnalysis.findMany({
    where: { child_id: childId },
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

interface PageProps {
  searchParams: Promise<{ child?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.child ?? DEFAULT_CHILD_ID;

  const [allChildren, initialInsight, periods, artworks] = await Promise.all([
    getAllChildren(),
    getLatestInsight(childId),
    getAllPeriods(childId),
    getArtworksForChild(childId),
  ]);

  // Fall back to default child if the requested ID doesn't exist
  const selectedChild =
    allChildren.find((c) => c.id === childId) ??
    allChildren.find((c) => c.id === DEFAULT_CHILD_ID) ??
    allChildren[0];

  return (
    <LocaleProvider>
      <ParentInsightDashboard
        initialInsight={initialInsight}
        childId={selectedChild.id}
        childName={selectedChild.name}
        childNameHe={selectedChild.name_he ?? undefined}
        availablePeriods={periods}
        allArtworks={artworks}
        allChildren={allChildren}
        selectedChildId={selectedChild.id}
      />
    </LocaleProvider>
  );
}
