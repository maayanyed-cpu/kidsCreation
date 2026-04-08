import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name, childId } = body as {
    email?: string;
    name?: string;
    childId?: string;
  };

  if (!email?.trim()) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  if (!childId?.trim()) {
    return NextResponse.json(
      { error: "childId is required" },
      { status: 400 }
    );
  }

  // Verify the child exists
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  // Find or create follower
  const emailNorm = email.trim().toLowerCase();
  let follower = await prisma.follower.findUnique({
    where: { email: emailNorm },
  });

  if (!follower) {
    follower = await prisma.follower.create({
      data: {
        email: emailNorm,
        name: name?.trim() || emailNorm.split("@")[0],
      },
    });
  }

  // Create follow relationship (ignore if already exists)
  try {
    await prisma.follow.create({
      data: { follower_id: follower.id, child_id: childId },
    });
  } catch {
    // Unique constraint violation = already following
  }

  return NextResponse.json({ ok: true, followerId: follower.id });
}
