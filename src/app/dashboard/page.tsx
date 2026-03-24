import { prisma } from "@/lib/db/prisma";
import { mapInsight } from "@/lib/db/insightMapper";
import { mapArtwork } from "@/lib/db/artworkMapper";
import { ParentInsightDashboard } from "@/components/insights/ParentInsightDashboard";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { getCurrentChallenge, getChallengeStatus, daysRemaining } from "@/lib/challenges";
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
    where: { child_id: childId, deleted_at: null },
    orderBy: { analysis_date: "desc" },
  });
  return rows.map(mapArtwork);
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

  // Fetch current challenge + submission status
  const challenge = await getCurrentChallenge();
  let challengeStatus: { completed: boolean; artworkId: string | null } | null = null;
  let challengeThumb: string | null = null;
  if (challenge) {
    challengeStatus = await getChallengeStatus(challenge.id, selectedChild.id);
    if (challengeStatus.artworkId) {
      const art = await prisma.artworkAnalysis.findUnique({
        where: { artwork_id: challengeStatus.artworkId },
        select: { thumb_url: true, image_url: true },
      });
      challengeThumb = art?.thumb_url ?? art?.image_url ?? null;
    }
  }

  return (
    <>
      {/* Weekly challenge banner — rendered above the dashboard */}
      {challenge && (
        <div
          className="md:pl-0"
          style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 40%, #f0faf8 100%)" }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
            <ChallengeCard
              challenge={{
                id: challenge.id,
                title: challenge.title,
                title_he: challenge.title_he,
                description: challenge.description,
                description_he: challenge.description_he,
                emoji: challenge.emoji,
                category: challenge.category,
                difficulty: challenge.difficulty,
                week_end: challenge.week_end.toISOString(),
              }}
              childId={selectedChild.id}
              childName={selectedChild.name}
              completed={challengeStatus?.completed ?? false}
              submissionThumb={challengeThumb}
              daysLeft={daysRemaining(challenge.week_end)}
            />
          </div>
        </div>
      )}

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
    </>
  );
}
