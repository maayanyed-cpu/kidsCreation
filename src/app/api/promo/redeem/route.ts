import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const { code } = (await req.json()) as { code?: string };

  if (!code?.trim()) {
    return NextResponse.json({ error: "Promo code is required" }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!promo) {
    return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
  }

  if (!promo.active) {
    return NextResponse.json({ error: "This promo code has been deactivated" }, { status: 410 });
  }

  if (promo.expires_at && promo.expires_at < new Date()) {
    return NextResponse.json({ error: "This promo code has expired" }, { status: 410 });
  }

  if (promo.current_uses >= promo.max_uses) {
    return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 410 });
  }

  // Use test parent for now (single-user mode)
  const user = await prisma.user.findFirst({ orderBy: { created_at: "asc" } });
  if (!user) {
    return NextResponse.json({ error: "No user found" }, { status: 500 });
  }

  // Check if user already has a pro/family subscription
  const existing = await prisma.userSubscription.findUnique({ where: { user_id: user.id } });
  if (existing && existing.plan !== "free") {
    return NextResponse.json({ error: `You already have a ${existing.plan} plan` }, { status: 409 });
  }

  // Upgrade user to pro and increment promo usage
  await prisma.$transaction([
    prisma.userSubscription.upsert({
      where: { user_id: user.id },
      update: { plan: "pro", promo_code_id: promo.id },
      create: { user_id: user.id, plan: "pro", promo_code_id: promo.id },
    }),
    prisma.promoCode.update({
      where: { id: promo.id },
      data: { current_uses: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    plan: "pro",
    discount_percent: promo.discount_percent,
    code: promo.code,
  });
}
