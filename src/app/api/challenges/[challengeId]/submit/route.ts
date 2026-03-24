import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

interface Params { params: Promise<{ challengeId: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { challengeId } = await params;
  const { childId, artworkId } = await req.json();

  if (!childId || !artworkId) {
    return NextResponse.json({ error: "childId and artworkId required" }, { status: 400 });
  }

  // Verify the challenge exists
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  // Create submission (ignore if already exists)
  try {
    await prisma.challengeSubmission.create({
      data: { challenge_id: challengeId, child_id: childId, artwork_id: artworkId },
    });
  } catch {
    // Unique constraint — already submitted
  }

  const totalSubmissions = await prisma.challengeSubmission.count({
    where: { challenge_id: challengeId },
  });

  return NextResponse.json({ ok: true, totalSubmissions }, { status: 201 });
}
