import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { mapArtwork } from "@/lib/db/artworkMapper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("childId");

  const rows = await prisma.artworkAnalysis.findMany({
    where: {
      ...(childId ? { child_id: childId } : {}),
      deleted_at: null,
    },
    orderBy: { analysis_date: "desc" },
  });

  return NextResponse.json(rows.map(mapArtwork));
}
