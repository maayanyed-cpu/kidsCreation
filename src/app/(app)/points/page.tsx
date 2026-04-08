import { prisma } from "@/lib/db/prisma";
import { PointsPage } from "@/components/points/PointsPage";

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default async function PointsPageServer() {
  const [artworks, followers, submissions, children] = await Promise.all([
    prisma.artworkAnalysis.count({ where: { deleted_at: null } }),
    prisma.follower.count(),
    prisma.challengeSubmission.count(),
    prisma.child.count(),
  ]);

  const total = artworks * 10 + followers * 25 + submissions * 20 + children * 15;

  // Fetch recent artworks for activity list
  const recentArtworks = await prisma.artworkAnalysis.findMany({
    where: { deleted_at: null },
    orderBy: { analysis_date: "desc" },
    take: 6,
    select: {
      id: true,
      title: true,
      child_id: true,
      analysis_date: true,
    },
  });

  // Get child names for the recent artworks
  const childIds = [...new Set(recentArtworks.map((a) => a.child_id))];
  const childRows = await prisma.child.findMany({
    where: { id: { in: childIds } },
    select: { id: true, name: true },
  });
  const childNameMap = Object.fromEntries(childRows.map((c) => [c.id, c.name]));

  // Build activity list: real uploads + mock invite/challenge entries
  const recentActivity = [
    ...recentArtworks.map((a) => ({
      id: a.id,
      type: "upload" as const,
      emoji: "🎨",
      highlight: childNameMap[a.child_id] ?? "Child",
      label: `— uploaded "${a.title ?? "artwork"}" drawing`,
      time: timeAgo(a.analysis_date),
      points: 10,
    })),
    // Mock entries for variety
    {
      id: "mock-invite-1",
      type: "invite" as const,
      emoji: "👨‍👩‍👧",
      highlight: "grandma@email.com",
      label: "accepted your invite!",
      time: "2 days ago",
      points: 25,
    },
    {
      id: "mock-challenge-1",
      type: "challenge" as const,
      emoji: "🏆",
      highlight: "Weekly Challenge",
      label: '— completed "Draw Your Dream House"',
      time: "3 days ago",
      points: 20,
    },
  ];

  return (
    <PointsPage
      total={total}
      artworks={artworks}
      followers={followers}
      submissions={submissions}
      children={children}
      recentActivity={recentActivity}
    />
  );
}
