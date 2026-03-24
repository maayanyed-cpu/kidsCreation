import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { setFollowerCookie, getFollowerId } from "@/lib/followerSession";

interface Params { params: Promise<{ shareCode: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { shareCode } = await params;
  const body = await req.json();
  const { name, email } = body as { name?: string; email?: string };

  const child = await prisma.child.findUnique({ where: { share_code: shareCode } });
  if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let followerId = await getFollowerId();

  // If no existing follower session, require name+email to create one
  if (!followerId) {
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Find or create follower
    let follower = await prisma.follower.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!follower) {
      follower = await prisma.follower.create({
        data: { email: email.trim().toLowerCase(), name: name.trim() },
      });
    }
    followerId = follower.id;
    await setFollowerCookie(followerId);
  }

  // Create follow (ignore if already exists)
  try {
    await prisma.follow.create({
      data: { follower_id: followerId, child_id: child.id },
    });
  } catch {
    // Unique constraint violation = already following
  }

  return NextResponse.json({ ok: true, followerId });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { shareCode } = await params;
  const followerId = await getFollowerId();
  if (!followerId) return NextResponse.json({ error: "Not a follower" }, { status: 401 });

  const child = await prisma.child.findUnique({ where: { share_code: shareCode } });
  if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.follow.deleteMany({
    where: { follower_id: followerId, child_id: child.id },
  });

  return NextResponse.json({ ok: true });
}
