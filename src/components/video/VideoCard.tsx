"use client";

import { useState } from "react";
import { HighlightVideoModal } from "./HighlightVideoModal";
import type { VideoConfig, VideoStats } from "@/lib/video/generateVideo";
import type { ArtworkAnalysis } from "@/types/artwork";
import type { Insight } from "@/types/insights";
import { formatAge } from "@/lib/age";

interface Props {
  childName: string;
  childEmoji: string;
  childDob?: string | Date | null;
  artworks: ArtworkAnalysis[];
  insight: Insight | null;
  period: string;
  locale: "en" | "he";
}

export function VideoCard({
  childName,
  childEmoji,
  childDob,
  artworks,
  insight,
  period,
  locale,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  // Filter artworks to the selected period's month
  const periodArtworks = artworks.filter((a) => {
    const artDate = new Date(a.analysis_date);
    const label = artDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    return label === period;
  });

  if (periodArtworks.length < 3) return null; // need 3+ artworks

  const thumbnail = periodArtworks[0]?.thumb_url ?? periodArtworks[0]?.image_url;
  const he = locale === "he";

  const stats: VideoStats = {
    totalArtworks: periodArtworks.length,
    topInterest: insight?.top_interest ?? "Creative Exploration",
    sentiment: insight?.sentiment ?? "Joyful",
    totalReactions: 0,
    challengesCompleted: 0,
  };

  const config: VideoConfig = {
    type: "monthly",
    childName,
    childEmoji,
    childAge: formatAge(childDob, locale),
    period,
    artworks: periodArtworks.map((a) => ({
      imageUrl: a.image_url,
      title: a.title ?? undefined,
      date: new Date(a.analysis_date).toLocaleDateString(
        he ? "he-IL" : "en-US",
        { month: "short", day: "numeric" }
      ),
    })),
    stats,
    milestone: insight?.milestone_detected ?? undefined,
    locale,
  };

  return (
    <>
      <div
        className="card cursor-pointer group"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center gap-4">
          {/* Thumbnail with play overlay */}
          <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-[#f0ede9] flex-shrink-0">
            {thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div
                className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
                style={{ animation: "breathe 2.5s ease-in-out infinite" }}
              >
                <svg width="12" height="14" viewBox="0 0 12 14" fill={CORAL}>
                  <path d="M0 0L12 7L0 14V0Z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#2d1f14]">
              {he ? "🎬 סרטון סיכום החודש" : "🎬 Monthly Highlight Reel"}
            </h3>
            <p className="text-xs text-[#9b8474] mt-0.5">
              {he
                ? `${periodArtworks.length} יצירות · לחצו לצפייה`
                : `${periodArtworks.length} artworks · Tap to watch`}
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <HighlightVideoModal config={config} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

const CORAL = "#ff7657";
