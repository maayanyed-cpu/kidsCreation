import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { mapArtwork } from "@/lib/db/artworkMapper";

type RouteContext = { params: Promise<{ artworkId: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const { artworkId } = await params;
  const raw = await prisma.artworkAnalysis.findUnique({
    where: { artwork_id: artworkId, deleted_at: null },
  });
  if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapArtwork(raw));
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { artworkId } = await params;

  const existing = await prisma.artworkAnalysis.findUnique({
    where: { artwork_id: artworkId, deleted_at: null },
  });
  if (!existing) {
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
  }

  await prisma.artworkAnalysis.update({
    where: { artwork_id: artworkId },
    data: { deleted_at: new Date() },
  });
  return new NextResponse(null, { status: 204 });
}
