import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ artworkId: string }> }
) {
  const { artworkId } = await params;

  const existing = await prisma.artworkAnalysis.findUnique({
    where: { artwork_id: artworkId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
  }

  await prisma.artworkAnalysis.delete({ where: { artwork_id: artworkId } });
  return new NextResponse(null, { status: 204 });
}
