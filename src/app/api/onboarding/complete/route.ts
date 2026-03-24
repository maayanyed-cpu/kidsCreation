import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

interface ChildInput {
  name: string;
  name_he?: string;
  avatarEmoji?: string;
  dateOfBirth?: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    parentName,
    locale,
    children,
  }: {
    parentName?: string;
    locale?: string;
    children: ChildInput[];
  } = body;

  if (!children?.length) {
    return NextResponse.json(
      { error: "At least one child is required" },
      { status: 400 }
    );
  }

  // Update parent profile and mark onboarding complete
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parentName?.trim() || undefined,
      locale: locale ?? "en",
      onboarding_complete: true,
    },
  });

  // Create children linked to this parent
  const ids: string[] = [];
  for (const child of children.slice(0, 5)) {
    const id = `child_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
    ids.push(id);
    await prisma.child.create({
      data: {
        id,
        parent_id: session.user.id,
        name: child.name.trim(),
        name_he: child.name_he?.trim() || null,
        avatar_emoji: child.avatarEmoji ?? "🦁",
        date_of_birth: child.dateOfBirth ? new Date(child.dateOfBirth) : null,
      },
    });
  }

  return NextResponse.json(
    { ok: true, firstChildId: ids[0] },
    { status: 201 }
  );
}
