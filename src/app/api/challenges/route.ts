import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const challenges = await prisma.challenge.findMany({
    where: { active: true },
    orderBy: { week_start: "desc" },
    include: { submissions: { select: { child_id: true, artwork_id: true } } },
  });

  return NextResponse.json({ challenges });
}
