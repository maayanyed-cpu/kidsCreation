import { prisma } from "@/lib/db/prisma";
import { KidProfiles } from "@/components/kids/KidProfiles";

export default async function KidsPage() {
  const children = await prisma.child.findMany({
    orderBy: { created_at: "asc" },
  });

  // For each child, count artworks and followers
  const childrenWithCounts = await Promise.all(
    children.map(async (child) => {
      const [artworkCount, followerCount] = await Promise.all([
        prisma.artworkAnalysis.count({
          where: { child_id: child.id, deleted_at: null },
        }),
        prisma.follow.count({
          where: { child_id: child.id },
        }),
      ]);

      return {
        id: child.id,
        name: child.name,
        name_he: child.name_he,
        avatar_emoji: child.avatar_emoji,
        share_code: child.share_code,
        date_of_birth: child.date_of_birth?.toISOString() ?? null,
        is_public: child.is_public,
        artworkCount,
        followerCount,
      };
    })
  );

  return <KidProfiles children={childrenWithCounts} />;
}
