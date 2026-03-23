import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { mapInsight } from "@/lib/db/insightMapper";

// Period arrives URL-decoded by Next.js App Router.
// "March%202026" in the URL becomes "March 2026" here — matches our DB format.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ childId: string; period: string }> }
) {
  const { childId, period } = await params;

  const raw = await prisma.insights.findUnique({
    where: {
      child_id_analysis_period: {
        child_id: childId,
        analysis_period: period,
      },
    },
  });

  if (!raw) {
    return NextResponse.json(
      {
        error: `No insight found for child '${childId}' in period '${period}'`,
        code: "NOT_FOUND",
      },
      { status: 404 }
    );
  }

  return NextResponse.json(mapInsight(raw));
}
