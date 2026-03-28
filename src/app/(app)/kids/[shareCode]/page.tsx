import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { KidPublicProfile } from "@/components/kids/KidPublicProfile";

interface PageProps {
  params: Promise<{ shareCode: string }>;
}

export default async function KidProfilePage({ params }: PageProps) {
  const { shareCode } = await params;

  const child = await prisma.child.findUnique({
    where: { share_code: shareCode },
    select: { id: true, name: true, avatar_emoji: true, share_code: true, date_of_birth: true },
  });
  if (!child || !child.share_code) notFound();

  const artworks = await prisma.artworkAnalysis.findMany({
    where: { child_id: child.id, deleted_at: null },
    orderBy: { analysis_date: "desc" },
    select: {
      artwork_id: true,
      image_url: true,
      thumb_url: true,
      title: true,
      analysis_date: true,
      emotional_tone: true,
    },
  });

  return (
    <KidPublicProfile
      child={{ id: child.id, name: child.name, avatar_emoji: child.avatar_emoji, date_of_birth: child.date_of_birth?.toISOString() ?? null }}
      shareCode={child.share_code}
      artworks={artworks}
    />
  );
}
