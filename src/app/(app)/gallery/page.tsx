import { prisma } from "@/lib/db/prisma";
import { mapArtwork } from "@/lib/db/artworkMapper";
import { ArtworkGrid } from "@/components/gallery/ArtworkGrid";
import type { ArtworkAnalysis } from "@/types/artwork";
import type { Child } from "@/types/child";

const DEFAULT_CHILD_ID = "child_003";

async function getAllChildren(): Promise<Child[]> {
  const rows = await prisma.child.findMany({ orderBy: { created_at: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    name_he: r.name_he,
    avatar_emoji: r.avatar_emoji,
    share_code: r.share_code,
    date_of_birth: r.date_of_birth,
    created_at: r.created_at,
  }));
}

async function getArtworksForChild(childId: string): Promise<ArtworkAnalysis[]> {
  const rows = await prisma.artworkAnalysis.findMany({
    where: { child_id: childId, deleted_at: null },
    orderBy: { analysis_date: "desc" },
  });
  return rows.map(mapArtwork);
}

async function getArtworkCounts(): Promise<Record<string, number>> {
  const rows = await prisma.artworkAnalysis.groupBy({
    by: ["child_id"],
    where: { deleted_at: null },
    _count: { artwork_id: true },
  });
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.child_id] = row._count.artwork_id;
  }
  return counts;
}

interface PageProps {
  searchParams: Promise<{ child?: string }>;
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.child ?? DEFAULT_CHILD_ID;

  const [allChildren, artworks, artworkCounts] = await Promise.all([
    getAllChildren(),
    getArtworksForChild(childId),
    getArtworkCounts(),
  ]);

  const selectedChild =
    allChildren.find((c) => c.id === childId) ??
    allChildren.find((c) => c.id === DEFAULT_CHILD_ID) ??
    allChildren[0];

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 40%, #f0faf8 100%)" }}
    >
      <main
        className="max-w-5xl mx-auto px-6 sm:px-10 py-8"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        <ArtworkGrid
          artworks={artworks}
          allChildren={allChildren}
          selectedChildId={selectedChild.id}
          artworkCounts={artworkCounts}
        />
      </main>
    </div>
  );
}
