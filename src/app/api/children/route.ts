import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const children = await prisma.child.findMany({
    orderBy: { created_at: "asc" },
  });
  return NextResponse.json(children);
}
