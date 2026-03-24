import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { mapArtwork } from "@/lib/db/artworkMapper";
import { deserialize } from "@/lib/db/serialization";
import { ArtworkDetail } from "@/components/gallery/ArtworkDetail";
import { ReactionBar } from "@/components/social/ReactionBar";
import { CommentSection } from "@/components/social/CommentSection";
import type { ArtworkAnalysis } from "@/types/artwork";

async function getArtwork(artworkId: string): Promise<ArtworkAnalysis | null> {
  const raw = await prisma.artworkAnalysis.findUnique({
    where: { artwork_id: artworkId, deleted_at: null },
  });
  return raw ? mapArtwork(raw) : null;
}

interface PageProps {
  params: Promise<{ artworkId: string }>;
  searchParams: Promise<{ child?: string }>;
}

export default async function ArtworkDetailPage({ params, searchParams }: PageProps) {
  const { artworkId } = await params;
  const { child: childParam } = await searchParams;

  const artwork = await getArtwork(artworkId);
  if (!artwork) notFound();

  // Fetch child name
  const childRow = await prisma.child.findUnique({ where: { id: artwork.child_id } });
  const childName = childRow?.name ?? "Unknown";

  // Find the insight for this artwork's month to pull encouragement scripts
  const period = new Date(artwork.analysis_date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const insightRow = await prisma.insights.findFirst({
    where: { child_id: artwork.child_id, analysis_period: period },
    select: { encouragement_scripts: true, analysis_period: true },
  });

  const encouragementScripts = insightRow
    ? deserialize(insightRow.encouragement_scripts)
    : [];

  return (
    <ArtworkDetail
      artwork={artwork}
      childName={childName}
      encouragementScripts={encouragementScripts}
      reportPeriod={insightRow?.analysis_period ?? null}
      backChildParam={childParam ?? artwork.child_id}
    >
      {/* Social: reactions + comments */}
      <div className="card space-y-5">
        <ReactionBar artworkId={artwork.artwork_id} />
        <CommentSection artworkId={artwork.artwork_id} canDelete />
      </div>
    </ArtworkDetail>
  );
}
