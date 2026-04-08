import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const children = await prisma.child.findMany({
    orderBy: { created_at: "asc" },
  });
  return NextResponse.json(children);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, date_of_birth, avatar_emoji, avatar_color, is_public } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Generate a unique share_code
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let randomSuffix = "";
    for (let i = 0; i < 4; i++) {
      randomSuffix += chars[Math.floor(Math.random() * chars.length)];
    }
    const share_code = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}-${randomSuffix}`;

    // Generate a unique id
    const id = `child_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const child = await prisma.child.create({
      data: {
        id,
        parent_id: "user_test_001",
        name: name.trim(),
        avatar_emoji: avatar_emoji || "⚡",
        avatar_color: avatar_color || "#f06449",
        share_code,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
        is_public: is_public ?? false,
      },
    });

    return NextResponse.json(child, { status: 201 });
  } catch (error) {
    console.error("Error creating child:", error);
    return NextResponse.json(
      { error: "Failed to create child" },
      { status: 500 }
    );
  }
}
