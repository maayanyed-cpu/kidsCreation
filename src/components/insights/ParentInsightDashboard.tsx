"use client";

import { useState, useTransition } from "react";
import type { Insight } from "@/types/insights";
import type { ArtworkAnalysis } from "@/types/artwork";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { Child } from "@/types/child";
import { MonthSelector } from "./MonthSelector";
import { ShareModal } from "./ShareModal";
import { ChildSwitcher } from "./ChildSwitcher";
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
  childNameHe?: string;
  availablePeriods: string[];
  allArtworks: ArtworkAnalysis[];
  allChildren: Child[];
  selectedChildId: string;
}

// ── Locale toggle ──────────────────────────────────────────────────────────
function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex items-center gap-1 rounded-full bg-[#f5f0eb] p-1">
      <button
        onClick={() => setLocale("en")}
        className={`px-2 py-0.5 rounded-full text-sm transition-all duration-150 ${
          locale === "en"
            ? "bg-white shadow-sm font-semibold text-[#2d1f14]"
            : "text-[#9b8474] hover:text-[#2d1f14]"
        }`}
        aria-label="Switch to English"
      >
        🇺🇸
      </button>
      <button
        onClick={() => setLocale("he")}
        className={`px-2 py-0.5 rounded-full text-sm transition-all duration-150 ${
          locale === "he"
            ? "bg-white shadow-sm font-semibold text-[#2d1f14]"
            : "text-[#9b8474] hover:text-[#2d1f14]"
        }`}
        aria-label="Switch to Hebrew"
      >
        🇮🇱
      </button>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState({
  childName,
  artworkCount,
  error,
}: {
  childName: string;
  artworkCount: number;
  error: string | null;
}) {
  const { t } = useLocale();
  const needed = Math.max(0, 5 - artworkCount);
  const pct = Math.min(100, (artworkCount / 5) * 100);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in px-4">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        className="mb-6 drop-shadow-sm"
        aria-hidden="true"
      >
        <circle cx="48" cy="48" r="48" fill="#fff1ed" />
        <rect x="54" y="18" width="10" height="38" rx="5" fill="#fbbf24" transform="rotate(35 54 18)" />
        <rect x="43" y="48" width="12" height="8" rx="2" fill="#9ca3af" transform="rotate(35 43 48)" />
        <ellipse cx="38" cy="62" rx="7" ry="11" fill="#ff7657" transform="rotate(35 38 62)" />
        <circle cx="30" cy="74" r="4" fill="#ff7657" opacity="0.5" />
        <circle cx="72" cy="28" r="3" fill="#fbbf24" />
        <circle cx="20" cy="36" r="2" fill="#0f9d8f" />
        <circle cx="66" cy="66" r="2.5" fill="#a78bfa" />
      </svg>

      {error ? (
        <>
          <h2 className="text-xl font-bold text-[#2d1f14] mb-2">{error}</h2>
          <p className="text-sm text-[#9b8474] max-w-xs leading-relaxed">
            {t("period.label")}
          </p>
        </>
      ) : (
        <>
          <h2
            className="text-xl font-bold text-[#2d1f14] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("empty.title")}
          </h2>
          <p className="text-sm text-[#9b8474] max-w-xs leading-relaxed mb-6">
            {artworkCount === 0
              ? t("empty.noneYet", { name: childName })
              : t("empty.needed", {
                  needed,
                  s: needed !== 1 ? "s" : "",
                  name: childName,
                })}
          </p>

          <div className="w-56">
            <div className="flex justify-between text-xs font-semibold text-[#9b8474] mb-2">
              <span>{artworkCount} {t("empty.uploaded")}</span>
              <span>{t("empty.needed5")}</span>
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
  childNameHe,
  availablePeriods,
  allArtworks,
  allChildren,
  selectedChildId,
}: Props) {
  const { t, locale, dir } = useLocale();
  const [insight, setInsight] = useState<Insight | null>(initialInsight);
  const [selectedPeriod, setSelectedPeriod] = useState(
    initialInsight?.analysis_period ?? availablePeriods[0] ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showShare, setShowShare] = useState(false);

  const displayName = locale === "he" && childNameHe ? childNameHe : childName;

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
      dir={dir}
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="animate-fade-in sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-[#f0ede9] px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto">
          {/* Top row: title + controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1
                className="text-xl font-bold text-[#2d1f14] truncate tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("header.title", { name: displayName })}
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <LocaleToggle />
              {insight && (
                <button
                  onClick={() => setShowShare(true)}
                  className="w-9 h-9 rounded-full bg-[#f5f0eb] flex items-center justify-center hover:bg-[#ede8e2] transition-colors"
                  aria-label="Share report"
                  title="Share report"
                >
                  <svg className="w-4 h-4 text-[#5c4a38]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
                  </svg>
                </button>
              )}
              {availablePeriods.length > 0 && (
                <MonthSelector
                  periods={availablePeriods}
                  selected={selectedPeriod}
                  onChange={handlePeriodChange}
                  loading={isPending}
                />
              )}
            </div>
          </div>

          {/* Child switcher row */}
          {allChildren.length > 1 && (
            <div className="mt-2">
              <ChildSwitcher children={allChildren} selectedChildId={selectedChildId} />
            </div>
          )}
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <main
        className="max-w-3xl mx-auto px-4 sm:px-6 py-8"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
      >
        {isPending ? (
          <SkeletonDashboard />
        ) : !insight ? (
          <EmptyState
            childName={displayName}
            artworkCount={artworksForPeriod.length}
            error={error}
          />
        ) : (
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

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="text-center pb-8 text-xs text-[#c4b5a5] animate-fade-in">
        {t("footer")}
      </footer>

      {/* ── Share modal ──────────────────────────────────────────────────── */}
      {showShare && insight && (
        <ShareModal
          insight={insight}
          childName={displayName}
          artworkCount={artworksForPeriod.length}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
