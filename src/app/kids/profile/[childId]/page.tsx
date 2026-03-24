import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { mapArtwork } from "@/lib/db/artworkMapper";
import { getStreak } from "@/lib/challenges";
import { ChildProfileCard } from "@/components/kids/ChildProfileCard";

interface PageProps {
  params: Promise<{ childId: string }>;
}

export default async function ChildProfilePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const { childId } = await params;

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) notFound();

  const [artworkCount, recentArtworks, challengesCompleted, streak] = await Promise.all([
    prisma.artworkAnalysis.count({
      where: { child_id: childId, deleted_at: null },
    }),
    prisma.artworkAnalysis.findMany({
      where: { child_id: childId, deleted_at: null },
      orderBy: { analysis_date: "desc" },
      take: 6,
    }),
    prisma.challengeSubmission.count({ where: { child_id: childId } }),
    getStreak(childId),
  ]);

  return (
    <ChildProfileCard
      child={{
        id: child.id,
        name: child.name,
        name_he: child.name_he,
        avatar_emoji: child.avatar_emoji,
        date_of_birth: child.date_of_birth?.toISOString() ?? null,
        share_code: child.share_code,
      }}
      stats={{ artworkCount, challengesCompleted, streak }}
      recentArtworks={recentArtworks.map(mapArtwork)}
    />
  );
}
