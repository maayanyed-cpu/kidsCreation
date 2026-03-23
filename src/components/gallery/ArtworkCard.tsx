"use client";

import Link from "next/link";
import type { ArtworkAnalysis } from "@/types/artwork";

const SENTIMENT_EMOJI: Record<string, string> = {
  Joyful: "😄",
  Calm: "😌",
  Energetic: "⚡",
  Expressive: "🎨",
  Dreamy: "✨",
  Curious: "🔍",
  Bold: "🔥",
  Warm: "🌸",
  Playful: "🎉",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface Props {
  artwork: ArtworkAnalysis;
  childParam?: string;
}

export function ArtworkCard({ artwork, childParam }: Props) {
  const sentimentEmoji = SENTIMENT_EMOJI[artwork.emotional_tone] ?? "🎨";
  const backParam = childParam ? `?child=${childParam}` : "";

  return (
    <Link
      href={`/gallery/${artwork.artwork_id}${backParam}`}
      className="group block rounded-2xl overflow-hidden bg-white"
      style={{
        boxShadow:
          "0 1px 2px rgba(45,31,20,0.06), 0 4px 16px rgba(45,31,20,0.07), 0 0 0 1px rgba(45,31,20,0.03)",
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f0ede9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artwork.thumb_url ?? artwork.image_url}
          alt={artwork.main_subjects.join(", ") || artwork.title || "artwork"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Sentiment or pending badge */}
        <span className="absolute top-2 end-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-base shadow-sm">
          {artwork.status === "pending" ? "⏳" : sentimentEmoji}
        </span>
      </div>

      {/* Card body */}
      <div className="p-3">
        <p className="text-xs text-[#9b8474] mb-2">{formatDate(artwork.analysis_date)}</p>

        {/* Tags */}
        {artwork.ai_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {artwork.ai_tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#f5f0eb] text-[#5c4a38]"
              >
                {tag.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
