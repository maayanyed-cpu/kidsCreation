import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getFollowerId } from "@/lib/followerSession";

interface Params { params: Promise<{ artworkId: string }> }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getIdentity(session: any, followerId: string | null) {
  if (session?.user?.id) return { user_type: "parent" as const, user_id: session.user.id as string };
  if (followerId) return { user_type: "follower" as const, user_id: followerId };
  return null;
}

export async function GET(_req: Request, { params }: Params) {
  const { artworkId } = await params;

  const reactions = await prisma.reaction.findMany({ where: { artwork_id: artworkId } });

  // Count per emoji
  const counts: Record<string, number> = {};
  for (const r of reactions) counts[r.emoji] = (counts[r.emoji] || 0) + 1;

  // Current user's reaction
  const session = await auth();
  const followerId = await getFollowerId();
  const identity = getIdentity(session, followerId);
  let myReaction: string | null = null;
  if (identity) {
    const mine = reactions.find(
      (r) => r.user_type === identity.user_type && r.user_id === identity.user_id
    );
    myReaction = mine?.emoji ?? null;
  }

  return NextResponse.json({ counts, myReaction, total: reactions.length });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { artworkId } = await params;
  const session = await auth();
  const followerId = await getFollowerId();
  const identity = getIdentity(session, followerId);
  if (!identity) return NextResponse.json({ error: "Sign in to react" }, { status: 401 });

  const { emoji } = await req.json();
  if (!emoji) return NextResponse.json({ error: "emoji required" }, { status: 400 });

  const where = {
    artwork_id_user_type_user_id: {
      artwork_id: artworkId,
      user_type: identity.user_type,
      user_id: identity.user_id,
    },
  };

  const existing = await prisma.reaction.findUnique({ where });

  if (existing) {
    if (existing.emoji === emoji) {
      // Toggle off — same emoji, remove reaction
      await prisma.reaction.delete({ where });
      return NextResponse.json({ action: "removed" });
    }
    // Switch emoji
    await prisma.reaction.update({ where, data: { emoji } });
    return NextResponse.json({ action: "switched", emoji });
  }

  // New reaction
  await prisma.reaction.create({
    data: { artwork_id: artworkId, emoji, ...identity },
  });
  return NextResponse.json({ action: "added", emoji });
}
