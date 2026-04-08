import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface Params {
  params: Promise<{ childId: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { childId } = await params;
  const body = await req.json();

  if (typeof body.is_public !== "boolean") {
    return NextResponse.json(
      { error: "is_public must be a boolean" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.child.update({
      where: { id: childId },
      data: { is_public: body.is_public },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }
}
