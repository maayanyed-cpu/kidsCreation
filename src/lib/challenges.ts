import { prisma } from "@/lib/db/prisma";

export async function getCurrentChallenge() {
  const now = new Date();
  return prisma.challenge.findFirst({
    where: { active: true, week_start: { lte: now }, week_end: { gte: now } },
    include: { submissions: true },
  });
}

export function daysRemaining(weekEnd: Date | string): number {
  const ms = new Date(weekEnd).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** Count consecutive completed past challenges for a child, starting from most recent */
export async function getStreak(childId: string): Promise<number> {
  const now = new Date();
  const pastChallenges = await prisma.challenge.findMany({
    where: { active: true, week_end: { lt: now } },
    orderBy: { week_start: "desc" },
    select: { id: true },
  });

  if (pastChallenges.length === 0) return 0;

  const submissions = await prisma.challengeSubmission.findMany({
    where: { child_id: childId },
    select: { challenge_id: true },
  });
  const submitted = new Set(submissions.map((s) => s.challenge_id));

  let streak = 0;
  for (const ch of pastChallenges) {
    if (submitted.has(ch.id)) streak++;
    else break;
  }
  return streak;
}

/** Check if current week's challenge is done and optionally include the submission count */
export async function getChallengeStatus(challengeId: string, childId: string) {
  const submission = await prisma.challengeSubmission.findUnique({
    where: { challenge_id_child_id: { challenge_id: challengeId, child_id: childId } },
    select: { artwork_id: true },
  });
  const totalSubmissions = await prisma.challengeSubmission.count({
    where: { challenge_id: challengeId },
  });
  return {
    completed: !!submission,
    artworkId: submission?.artwork_id ?? null,
    totalSubmissions,
  };
}
