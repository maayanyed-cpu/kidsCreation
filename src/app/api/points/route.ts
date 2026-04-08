import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

function getTierInfo(total: number) {
  if (total >= 1000) return { emoji: "💎", nextTier: null, nextTierAt: null };
  if (total >= 500)  return { emoji: "🌟", nextTier: "Master Guardian", nextTierAt: 1000 };
  if (total >= 100)  return { emoji: "🎨", nextTier: "Star Curator", nextTierAt: 500 };
  return { emoji: "🌱", nextTier: "Creative Explorer", nextTierAt: 100 };
}

export async function GET() {
  const user = await prisma.user.findFirst({ orderBy: { created_at: "asc" } });
  if (!user) {
    return NextResponse.json({ total: 0, tier: "Budding Artist", ...getTierInfo(0) });
  }

  const pointsRow = await prisma.points.findUnique({ where: { user_id: user.id } });
  const total = pointsRow?.total_points ?? 0;
  const tier = pointsRow?.tier ?? "Budding Artist";

  return NextResponse.json({
    total,
    tier,
    ...getTierInfo(total),
  });
}
