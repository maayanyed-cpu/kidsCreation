import { prisma } from "@/lib/db/prisma";
import { FamilyAccess } from "@/components/family/FamilyAccess";

export default async function FamilyPage() {
  // Fetch all children with their followers
  const children = await prisma.child.findMany({
    orderBy: { created_at: "asc" },
    include: {
      follows: {
        include: {
          follower: true,
        },
      },
    },
  });

  const childrenData = children.map((child) => ({
    id: child.id,
    name: child.name,
    name_he: child.name_he,
    avatar_emoji: child.avatar_emoji,
    is_public: child.is_public,
    followers: child.follows.map((f) => ({
      id: f.follower.id,
      email: f.follower.email,
      name: f.follower.name,
    })),
  }));

  // Collect all unique followers across all children
  const followerMap = new Map<string, { id: string; email: string; name: string }>();
  for (const child of children) {
    for (const follow of child.follows) {
      if (!followerMap.has(follow.follower.id)) {
        followerMap.set(follow.follower.id, {
          id: follow.follower.id,
          email: follow.follower.email,
          name: follow.follower.name,
        });
      }
    }
  }
  const allFollowers = Array.from(followerMap.values());

  return <FamilyAccess children={childrenData} allFollowers={allFollowers} />;
}
