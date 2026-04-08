import { prisma } from "@/lib/db/prisma";
import { PointsPage } from "@/components/points/PointsPage";

const ACTION_EMOJI: Record<string, string> = {
  upload: "🎨",
  invite: "👨‍👩‍👧",
  challenge: "🏆",
  encourage: "💬",
  add_kid: "👶",
  streak: "📅",
};

const ACTION_TYPE: Record<string, "upload" | "invite" | "challenge" | "reaction"> = {
  upload: "upload",
  invite: "invite",
  challenge: "challenge",
  encourage: "reaction",
  add_kid: "upload",
  streak: "upload",
};

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default async function PointsPageServer() {
  // Use the test parent for now (single-user mode)
  const user = await prisma.user.findFirst({ orderBy: { created_at: "asc" } });
  if (!user) {
    return <PointsPage total={0} tier="Budding Artist" recentActivity={[]} />;
  }

  const [pointsRow, history] = await Promise.all([
    prisma.points.findUnique({ where: { user_id: user.id } }),
    prisma.pointsHistory.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
      take: 10,
    }),
  ]);

  const total = pointsRow?.total_points ?? 0;
  const tier = pointsRow?.tier ?? "Budding Artist";

  const recentActivity = history.map((h) => ({
    id: h.id,
    type: ACTION_TYPE[h.action] ?? ("upload" as const),
    emoji: ACTION_EMOJI[h.action] ?? "⭐",
    highlight: h.description.split("—")[0]?.trim() ?? h.action,
    label: h.description.includes("—") ? "—" + h.description.split("—").slice(1).join("—") : h.description,
    time: timeAgo(h.created_at),
    points: h.points_earned,
  }));

  return (
    <PointsPage
      total={total}
      tier={tier}
      recentActivity={recentActivity}
    />
  );
}
