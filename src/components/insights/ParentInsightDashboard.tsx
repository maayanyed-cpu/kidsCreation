"use client";

import { useState, useTransition } from "react";
import type { Insight } from "@/types/insights";
import type { ArtworkAnalysis } from "@/types/artwork";
import { MonthSelector } from "./MonthSelector";
import { ArtistObsessionCard } from "./ArtistObsessionCard";
import { InterestHeatmap } from "./InterestHeatmap";
import { CreativeEvolution } from "./CreativeEvolution";
import { MilestoneBadge } from "./MilestoneBadge";
import { EncouragementScripts } from "./EncouragementScripts";
import { GrowthTipCard } from "./GrowthTipCard";
import { SkeletonDashboard } from "./SkeletonCard";

interface Props {
  initialInsight: Insight | null;
  childId: string;
  childName: string;
  availablePeriods: string[];
  allArtworks: ArtworkAnalysis[];
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({
  childName,
  artworkCount,
  error,
}: {
  childName: string;
  artworkCount: number;
  error: string | null;
}) {
  const needed = Math.max(0, 5 - artworkCount);
  const pct = Math.min(100, (artworkCount / 5) * 100);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in px-4">
      {/* Paintbrush SVG illustration */}
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        className="mb-6 drop-shadow-sm"
        aria-hidden="true"
      >
        <circle cx="48" cy="48" r="48" fill="#fff1ed" />
        {/* Brush handle */}
        <rect x="54" y="18" width="10" height="38" rx="5" fill="#fbbf24" transform="rotate(35 54 18)" />
        {/* Brush ferrule */}
        <rect x="43" y="48" width="12" height="8" rx="2" fill="#9ca3af" transform="rotate(35 43 48)" />
        {/* Bristles */}
        <ellipse cx="38" cy="62" rx="7" ry="11" fill="#ff7657" transform="rotate(35 38 62)" />
        {/* Paint drip */}
        <circle cx="30" cy="74" r="4" fill="#ff7657" opacity="0.5" />
        {/* Stars */}
        <circle cx="72" cy="28" r="3" fill="#fbbf24" />
        <circle cx="20" cy="36" r="2" fill="#0f9d8f" />
        <circle cx="66" cy="66" r="2.5" fill="#a78bfa" />
      </svg>

      {error ? (
        <>
          <h2 className="text-xl font-bold text-[#2d1f14] mb-2">{error}</h2>
          <p className="text-sm text-[#9b8474] max-w-xs leading-relaxed">
            Try selecting a different month above.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-[#2d1f14] mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Keep creating! 🎨
          </h2>
          <p className="text-sm text-[#9b8474] max-w-xs leading-relaxed mb-6">
            {artworkCount === 0
              ? `We need 5 artworks from ${childName} to unlock the Creative Growth Report.`
              : `${needed} more artwork${needed !== 1 ? "s" : ""} to unlock ${childName}'s Creative Growth Report.`}
          </p>

          {/* Progress bar */}
          <div className="w-56">
            <div className="flex justify-between text-xs font-semibold text-[#9b8474] mb-2">
              <span>{artworkCount} uploaded</span>
              <span>5 needed</span>
            </div>
            <div className="h-3 bg-[#f0ede9] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #ff7657, #fbbf24)",
                }}
              />
            </div>
            <div className="flex gap-2 justify-center mt-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                    n <= artworkCount
                      ? "bg-[#ff7657] text-white scale-110"
                      : "bg-[#f0ede9] text-[#c4b5a5]"
                  }`}
                >
                  {n <= artworkCount ? "✓" : n}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function ParentInsightDashboard({
  initialInsight,
  childId,
  childName,
  availablePeriods,
  allArtworks,
}: Props) {
  const [insight, setInsight] = useState<Insight | null>(initialInsight);
  const [selectedPeriod, setSelectedPeriod] = useState(
    initialInsight?.analysis_period ?? availablePeriods[0] ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Count artworks for the selected period (client-side filter by month label)
  const artworksForPeriod = allArtworks.filter((a) => {
    const label = new Date(a.analysis_date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    return label === selectedPeriod;
  });

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setError(null);

    startTransition(async () => {
      const res = await fetch(`/api/insights/${childId}/${encodeURIComponent(period)}`);

      if (res.status === 404) {
        setInsight(null);
        setError(`No report available for ${period} yet.`);
        return;
      }
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }

      setInsight(await res.json());
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 40%, #f0faf8 100%)" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="animate-fade-in sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-[#f0ede9] px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1
              className="text-xl font-bold text-[#2d1f14] truncate tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {childName}&rsquo;s Creative Growth Report
            </h1>
            <p className="text-xs text-[#9b8474] mt-0.5 hidden sm:block">
              AI-powered developmental insights · FamilyVibe Labs
            </p>
          </div>

          {availablePeriods.length > 0 && (
            <MonthSelector
              periods={availablePeriods}
              selected={selectedPeriod}
              onChange={handlePeriodChange}
              loading={isPending}
            />
          )}
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <main
        className="max-w-3xl mx-auto px-4 sm:px-6 py-8"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
      >
        {isPending ? (
          /* Skeleton cards exactly match the real card shapes */
          <SkeletonDashboard />
        ) : !insight ? (
          /* Empty / error state */
          <EmptyState
            childName={childName}
            artworkCount={artworksForPeriod.length}
            error={error}
          />
        ) : (
          /* Dashboard cards — key forces re-mount + re-animation on period change */
          <div key={selectedPeriod} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ArtistObsessionCard insight={insight} delay={0} />
            <InterestHeatmap
              thematicFocus={insight.thematic_focus}
              artworks={allArtworks}
              delay={80}
            />
            <CreativeEvolution evolution={insight.visual_evolution} delay={160} />
            {insight.milestone_detected && (
              <MilestoneBadge milestone={insight.milestone_detected} delay={240} />
            )}
            {insight.encouragement_scripts.length > 0 && (
              <EncouragementScripts scripts={insight.encouragement_scripts} delay={320} />
            )}
            {insight.growth_tip && (
              <GrowthTipCard tip={insight.growth_tip} delay={400} />
            )}
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="text-center pb-8 text-xs text-[#c4b5a5] animate-fade-in">
        Made with ❤️ by FamilyVibe Labs · Powered by Claude 3.5 Sonnet
      </footer>
    </div>
  );
}
