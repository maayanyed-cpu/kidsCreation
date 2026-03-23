import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { deserialize } from "@/lib/db/serialization";
import { ArtworkDetail } from "@/components/gallery/ArtworkDetail";
import type { ArtworkAnalysis } from "@/types/artwork";

async function getArtwork(artworkId: string): Promise<ArtworkAnalysis | null> {
  const raw = await prisma.artworkAnalysis.findUnique({
    where: { artwork_id: artworkId },
  });
  if (!raw) return null;
  return {
    id: raw.id,
    artwork_id: raw.artwork_id,
    child_id: raw.child_id,
    image_url: raw.image_url,
    analysis_date: raw.analysis_date,
    predominant_colors: deserialize(raw.predominant_colors),
    main_subjects: deserialize(raw.main_subjects),
    technique_notes: raw.technique_notes,
    ai_tags: deserialize(raw.ai_tags),
    emotional_tone: raw.emotional_tone,
  };
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
    />
  );
}
