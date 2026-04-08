import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Create a new promo code
export async function POST(req: NextRequest) {
  const { code, max_uses, expires_at } = (await req.json()) as {
    code?: string;
    max_uses?: number;
    expires_at?: string | null;
  };

  if (!code?.trim()) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const existing = await prisma.promoCode.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (existing) {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: code.trim().toUpperCase(),
      discount_percent: 100,
      max_uses: max_uses ?? 50,
      expires_at: expires_at ? new Date(expires_at) : null,
    },
  });

  return NextResponse.json({ ok: true, promo });
}

// Toggle active/disable
export async function PATCH(req: NextRequest) {
  const { id, active } = (await req.json()) as { id?: string; active?: boolean };

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const promo = await prisma.promoCode.update({
    where: { id },
    data: { active: active ?? false },
  });

  return NextResponse.json({ ok: true, promo });
}
