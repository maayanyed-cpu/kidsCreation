import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getFollowerId } from "@/lib/followerSession";

export async function GET() {
  const followerId = await getFollowerId();
  if (!followerId) return NextResponse.json({ follower: null });

  const follower = await prisma.follower.findUnique({
    where: { id: followerId },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ follower });
}
