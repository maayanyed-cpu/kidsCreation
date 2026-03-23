import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { mapInsight } from "@/lib/db/insightMapper";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const { childId } = await params;

  const raw = await prisma.insights.findFirst({
    where: { child_id: childId },
    orderBy: { created_at: "desc" },
  });

  if (!raw) {
    return NextResponse.json(
      { error: `No insights found for child '${childId}'`, code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json(mapInsight(raw));
}
