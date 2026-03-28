import { prisma } from "@/lib/db/prisma";
import { getFollowerId } from "@/lib/followerSession";
import { FeedView } from "@/components/feed/FeedView";

export default async function FeedPage() {
  const followerId = await getFollowerId();

  if (!followerId) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 50%, #f0faf8 100%)" }}
      >
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-3">🎨</div>
          <h1 className="text-lg font-bold text-[#2d1f14] mb-2">Family Feed</h1>
          <p className="text-sm text-[#9b8474]">
            Follow a kid&apos;s gallery to see their latest creations here!
          </p>
        </div>
      </div>
    );
  }

  // Get all followed children
  const follows = await prisma.follow.findMany({
    where: { follower_id: followerId },
    select: { child_id: true },
  });
  const childIds = follows.map((f) => f.child_id);

  if (childIds.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 50%, #f0faf8 100%)" }}
      >
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-3">👀</div>
          <h1 className="text-lg font-bold text-[#2d1f14] mb-2">No kids followed yet</h1>
          <p className="text-sm text-[#9b8474]">
            Ask a parent for a share link to follow their kid&apos;s gallery!
          </p>
        </div>
      </div>
    );
  }

  // Fetch artworks + children data
  const artworks = await prisma.artworkAnalysis.findMany({
    where: { child_id: { in: childIds }, deleted_at: null },
    orderBy: { analysis_date: "desc" },
    take: 50,
    select: {
      artwork_id: true,
      child_id: true,
      image_url: true,
      thumb_url: true,
      title: true,
      analysis_date: true,
      emotional_tone: true,
    },
  });

  const children = await prisma.child.findMany({
    where: { id: { in: childIds } },
    select: { id: true, name: true, avatar_emoji: true, share_code: true },
  });
  const childMap = Object.fromEntries(children.map((c) => [c.id, c]));

  // Get reaction counts per artwork
  const artworkIds = artworks.map((a) => a.artwork_id);
  const reactions = await prisma.reaction.findMany({
    where: { artwork_id: { in: artworkIds } },
  });
  const reactionCounts: Record<string, number> = {};
  for (const r of reactions) {
    reactionCounts[r.artwork_id] = (reactionCounts[r.artwork_id] || 0) + 1;
  }

  const commentCounts = await prisma.comment.groupBy({
    by: ["artwork_id"],
    where: { artwork_id: { in: artworkIds }, approved: true, deleted_at: null },
    _count: { id: true },
  });
  const commentMap: Record<string, number> = {};
  for (const c of commentCounts) commentMap[c.artwork_id] = c._count.id;

  const feedItems = artworks.map((a) => ({
    ...a,
    analysis_date: a.analysis_date.toISOString(),
    child: childMap[a.child_id] ?? { name: "?", avatar_emoji: "🎨", share_code: null },
    reactionCount: reactionCounts[a.artwork_id] ?? 0,
    commentCount: commentMap[a.artwork_id] ?? 0,
  }));

  return <FeedView items={feedItems} />;
}
