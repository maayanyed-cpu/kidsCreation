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

interface PageProps {
  searchParams: Promise<{ child?: string }>;
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.child ?? DEFAULT_CHILD_ID;

  const [allChildren, artworks] = await Promise.all([
    getAllChildren(),
    getArtworksForChild(childId),
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
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-[#f0ede9] px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-xl font-bold text-[#2d1f14] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            🎨 Gallery
          </h1>
        </div>
      </header>

      <main
        className="max-w-3xl mx-auto px-4 sm:px-6 py-6"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        <ArtworkGrid
          artworks={artworks}
          allChildren={allChildren}
          selectedChildId={selectedChild.id}
        />
      </main>
    </div>
  );
}
