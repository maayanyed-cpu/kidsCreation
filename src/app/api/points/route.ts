import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

function getTier(total: number) {
  if (total >= 1000) return { tier: "Master Guardian", emoji: "💎", nextTier: null, nextTierAt: null };
  if (total >= 500)  return { tier: "Star Curator", emoji: "🌟", nextTier: "Master Guardian", nextTierAt: 1000 };
  if (total >= 100)  return { tier: "Creative Explorer", emoji: "🎨", nextTier: "Star Curator", nextTierAt: 500 };
  return { tier: "Budding Artist", emoji: "🌱", nextTier: "Creative Explorer", nextTierAt: 100 };
}

export async function GET() {
  const [artworks, followers, submissions, children] = await Promise.all([
    prisma.artworkAnalysis.count({ where: { deleted_at: null } }),
    prisma.follower.count(),
    prisma.challengeSubmission.count(),
    prisma.child.count(),
  ]);

  const total = artworks * 10 + followers * 25 + submissions * 20 + children * 15;
  const tierInfo = getTier(total);

  return NextResponse.json({
    total,
    artworks,
    followers,
    submissions,
    children,
    ...tierInfo,
  });
}
