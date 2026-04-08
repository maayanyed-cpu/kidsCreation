import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name, childId, userId } = body as {
    email?: string;
    name?: string;
    childId?: string;
    userId?: string;
  };

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!childId?.trim()) {
    return NextResponse.json({ error: "childId is required" }, { status: 400 });
  }

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  const emailNorm = email.trim().toLowerCase();
  const invitedBy = userId ?? child.parent_id ?? "unknown";

  // Create the family invite
  const invite = await prisma.familyInvite.create({
    data: {
      email: emailNorm,
      kid_id: childId,
      invited_by: invitedBy,
      status: "pending",
    },
  });

  // Also create follower + follow immediately (existing behavior for backwards compat)
  let follower = await prisma.follower.findUnique({ where: { email: emailNorm } });
  if (!follower) {
    follower = await prisma.follower.create({
      data: { email: emailNorm, name: name?.trim() || emailNorm.split("@")[0] },
    });
  }

  try {
    await prisma.follow.create({
      data: { follower_id: follower.id, child_id: childId },
    });
  } catch {
    // Already following
  }

  return NextResponse.json({ ok: true, inviteId: invite.id, followerId: follower.id });
}
