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

interface Props {
  initialInsight: Insight | null;
  childId: string;
  childName: string;
  availablePeriods: string[];
  allArtworks: ArtworkAnalysis[];
}

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

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setError(null);

    startTransition(async () => {
      const encodedPeriod = encodeURIComponent(period);
      const res = await fetch(`/api/insights/${childId}/${encodedPeriod}`);

      if (res.status === 404) {
        setInsight(null);
        setError(`No report available for ${period} yet.`);
        return;
      }
      if (!res.ok) {
        setError("Something went wrong loading this report. Please try again.");
        return;
      }

      const data = await res.json();
      setInsight(data);
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f5f3ff 0%, #faf9f7 35%, #fdf8f0 100%)" }}>
      {/* ── Header ── */}
      <header className="animate-fade-in sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#f3f4f6] px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#1a1a2e] truncate">
              {childName}&rsquo;s Creative Growth Report
            </h1>
            <p className="text-xs text-[#9ca3af] mt-0.5 hidden sm:block">
              AI-powered developmental insights by FamilyVibe Labs
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

      {/* ── Body ── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Empty / error state */}
        {!insight && (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-[#ede9f8] flex items-center justify-center text-5xl mb-6">
              🎨
            </div>
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">
              {error ?? "No report yet"}
            </h2>
            <p className="text-sm text-[#9ca3af] max-w-xs leading-relaxed">
              {error
                ? "Try selecting a different month above."
                : `${childName} needs at least 5 uploaded artworks in a month before a report can be generated.`}
            </p>
          </div>
        )}

        {/* Loading overlay — faint pulse over previous content */}
        {isPending && insight && (
          <div className="pointer-events-none absolute inset-0 bg-white/40 z-10 rounded-2xl animate-pulse" />
        )}

        {/* Dashboard cards */}
        {insight && (
          <div key={selectedPeriod} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Hero — spans full width on mobile, 2 cols on sm+ */}
            <ArtistObsessionCard insight={insight} delay={0} />

            {/* Heatmap */}
            <InterestHeatmap
              thematicFocus={insight.thematic_focus}
              artworks={allArtworks}
              delay={80}
            />

            {/* Creative Evolution */}
            <CreativeEvolution evolution={insight.visual_evolution} delay={160} />

            {/* Milestone — full width */}
            {insight.milestone_detected && (
              <MilestoneBadge milestone={insight.milestone_detected} delay={240} />
            )}

            {/* Encouragement Scripts — full width */}
            {insight.encouragement_scripts.length > 0 && (
              <EncouragementScripts scripts={insight.encouragement_scripts} delay={320} />
            )}

            {/* Growth Tip — full width */}
            {insight.growth_tip && (
              <GrowthTipCard tip={insight.growth_tip} delay={400} />
            )}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-8 text-xs text-[#9ca3af] animate-fade-in">
        Made with ❤️ by FamilyVibe Labs · Powered by Claude 3.5 Sonnet
      </footer>
    </div>
  );
}
