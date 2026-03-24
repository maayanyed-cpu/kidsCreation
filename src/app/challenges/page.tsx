import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChallengeHistory } from "@/components/challenges/ChallengeHistory";
import { getStreak } from "@/lib/challenges";

export default async function ChallengesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const children = await prisma.child.findMany({
    where: { parent_id: session.user.id },
    select: { id: true, name: true, name_he: true, avatar_emoji: true },
    orderBy: { created_at: "asc" },
  });

  // If no children via parent_id (e.g. seeded data), fall back to all children
  const childList = children.length > 0
    ? children
    : await prisma.child.findMany({
        select: { id: true, name: true, name_he: true, avatar_emoji: true },
        orderBy: { created_at: "asc" },
      });

  const challenges = await prisma.challenge.findMany({
    where: { active: true },
    orderBy: { week_start: "desc" },
    include: { submissions: { select: { child_id: true, artwork_id: true } } },
  });

  const now = new Date();
  const currentId = challenges.find(
    (c) => new Date(c.week_start) <= now && new Date(c.week_end) >= now
  )?.id ?? null;

  // Compute streaks per child
  const streaks: Record<string, number> = {};
  for (const child of childList) {
    streaks[child.id] = await getStreak(child.id);
  }

  const mapped = challenges.map((c) => ({
    id: c.id,
    title: c.title,
    title_he: c.title_he,
    emoji: c.emoji,
    difficulty: c.difficulty,
    week_start: c.week_start.toISOString(),
    week_end: c.week_end.toISOString(),
    isCurrent: c.id === currentId,
    submissions: c.submissions.map((s) => ({ child_id: s.child_id, artwork_id: s.artwork_id })),
  }));

  return (
    <ChallengeHistory
      challenges={mapped}
      children={childList}
      streaks={streaks}
    />
  );
}
