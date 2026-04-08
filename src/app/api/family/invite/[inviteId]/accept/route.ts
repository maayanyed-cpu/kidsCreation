import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const { inviteId } = await params;

  const invite = await prisma.familyInvite.findUnique({ where: { id: inviteId } });
  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.status === "accepted") {
    return NextResponse.json({ ok: true, message: "Already accepted" });
  }

  // Mark invite as accepted
  await prisma.familyInvite.update({
    where: { id: inviteId },
    data: { status: "accepted" },
  });

  // Create Follower if not exists
  const emailNorm = invite.email.toLowerCase();
  let follower = await prisma.follower.findUnique({ where: { email: emailNorm } });
  if (!follower) {
    follower = await prisma.follower.create({
      data: {
        email: emailNorm,
        name: emailNorm.split("@")[0],
      },
    });
  }

  // Create Follow relationship
  try {
    await prisma.follow.create({
      data: { follower_id: follower.id, child_id: invite.kid_id },
    });
  } catch {
    // Already following
  }

  return NextResponse.json({ ok: true, followerId: follower.id });
}
