import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { getFollowerId } from "@/lib/followerSession";
import { moderateComment } from "@/lib/anthropic/moderateComment";

interface Params { params: Promise<{ artworkId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { artworkId } = await params;

  const comments = await prisma.comment.findMany({
    where: { artwork_id: artworkId, approved: true, deleted_at: null },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      author_name: true,
      text: true,
      user_type: true,
      created_at: true,
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { artworkId } = await params;
  const session = await auth();
  const followerId = await getFollowerId();

  let userType: string;
  let userId: string;
  let authorName: string;

  if (session?.user?.id) {
    userType = "parent";
    userId = session.user.id;
    authorName = session.user.name ?? "Parent";
  } else if (followerId) {
    userType = "follower";
    userId = followerId;
    const follower = await prisma.follower.findUnique({ where: { id: followerId } });
    if (!follower) return NextResponse.json({ error: "Follower not found" }, { status: 401 });
    authorName = follower.name;
  } else {
    return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });
  }

  const { text } = await req.json();
  if (!text?.trim() || text.trim().length > 500) {
    return NextResponse.json({ error: "Comment must be 1-500 characters" }, { status: 400 });
  }

  // Rate limit: max 10 comments per follower per day
  if (userType === "follower") {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.comment.count({
      where: { user_type: "follower", user_id: userId, created_at: { gte: dayAgo } },
    });
    if (recentCount >= 10) {
      return NextResponse.json({ error: "Daily comment limit reached" }, { status: 429 });
    }
  }

  // AI moderation
  const modResult = await moderateComment(text.trim());

  if (modResult === "rejected") {
    return NextResponse.json({
      error: "positive_only",
      message: "Let's keep it positive! Try saying something encouraging about the artwork 🌟",
    }, { status: 422 });
  }

  const comment = await prisma.comment.create({
    data: {
      artwork_id: artworkId,
      user_type: userType,
      user_id: userId,
      author_name: authorName,
      text: text.trim(),
      approved: modResult === "approved", // "pending" → approved=false
    },
  });

  if (modResult === "pending") {
    return NextResponse.json({
      comment: { id: comment.id, pending: true },
      message: "Your comment is being reviewed and will appear shortly.",
    }, { status: 202 });
  }

  return NextResponse.json({
    comment: {
      id: comment.id,
      author_name: authorName,
      text: text.trim(),
      user_type: userType,
      created_at: comment.created_at,
    },
  }, { status: 201 });
}
