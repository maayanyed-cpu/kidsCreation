import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";

interface Params { params: Promise<{ artworkId: string; commentId: string }> }

export async function DELETE(_req: Request, { params }: Params) {
  const { artworkId, commentId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the parent owns the child who owns this artwork
  const artwork = await prisma.artworkAnalysis.findUnique({
    where: { artwork_id: artworkId },
    select: { child_id: true },
  });
  if (!artwork) return NextResponse.json({ error: "Artwork not found" }, { status: 404 });

  const child = await prisma.child.findUnique({
    where: { id: artwork.child_id },
    select: { parent_id: true },
  });
  if (child?.parent_id !== session.user.id) {
    return NextResponse.json({ error: "Not your child's artwork" }, { status: 403 });
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { deleted_at: new Date() },
  });

  return NextResponse.json({ ok: true });
}
