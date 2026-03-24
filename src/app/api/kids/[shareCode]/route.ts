import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getFollowerId } from "@/lib/followerSession";

interface Params { params: Promise<{ shareCode: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { shareCode } = await params;

  const child = await prisma.child.findUnique({
    where: { share_code: shareCode },
    select: { id: true, name: true, avatar_emoji: true, share_code: true },
  });
  if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  // Check if the current visitor is a follower
  const followerId = await getFollowerId();
  let isFollowing = false;
  if (followerId) {
    const follow = await prisma.follow.findUnique({
      where: { follower_id_child_id: { follower_id: followerId, child_id: child.id } },
    });
    isFollowing = !!follow;
  }

  const followerCount = await prisma.follow.count({ where: { child_id: child.id } });

  return NextResponse.json({
    child: { id: child.id, name: child.name, avatar_emoji: child.avatar_emoji },
    artworks,
    isFollowing,
    followerCount,
    followerId,
  });
}
