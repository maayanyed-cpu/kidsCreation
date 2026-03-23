"use client";

import { useState } from "react";
import type { ArtworkAnalysis } from "@/types/artwork";
import type { Child } from "@/types/child";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { ChildSwitcher } from "@/components/insights/ChildSwitcher";
import { ArtworkCard } from "./ArtworkCard";

interface Props {
  artworks: ArtworkAnalysis[];
  allChildren: Child[];
  selectedChildId: string;
}

function formatMonthHeader(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function ArtworkGrid({ artworks, allChildren, selectedChildId }: Props) {
  const { t } = useLocale();
  const [sortMode, setSortMode] = useState<"newest" | "byMonth">("newest");

  const sorted = [...artworks].sort(
    (a, b) => new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime()
  );

  // Group by month for "by month" view
  const grouped: Map<string, ArtworkAnalysis[]> = new Map();
  if (sortMode === "byMonth") {
    for (const aw of sorted) {
      const key = formatMonthHeader(aw.analysis_date);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(aw);
    }
  }

  return (
    <div>
      {/* Controls row */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        {allChildren.length > 1 && (
          <ChildSwitcher children={allChildren} selectedChildId={selectedChildId} />
        )}

        {/* Sort toggle */}
        <div className="flex items-center gap-1 rounded-full bg-[#f5f0eb] p-1 ms-auto">
          <button
            onClick={() => setSortMode("newest")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              sortMode === "newest"
                ? "bg-white shadow-sm text-[#2d1f14]"
                : "text-[#9b8474] hover:text-[#2d1f14]"
            }`}
          >
            {t("gallery.sort.newest")}
          </button>
          <button
            onClick={() => setSortMode("byMonth")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              sortMode === "byMonth"
                ? "bg-white shadow-sm text-[#2d1f14]"
                : "text-[#9b8474] hover:text-[#2d1f14]"
            }`}
          >
            {t("gallery.sort.byMonth")}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {artworks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🎨</span>
          <p className="text-base font-semibold text-[#2d1f14] mb-1">{t("gallery.empty")}</p>
          <p className="text-sm text-[#9b8474]">{t("gallery.emptyHint")}</p>
        </div>
      )}

      {/* Grid — flat view (newest) */}
      {sortMode === "newest" && artworks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-fade-in">
          {sorted.map((aw) => (
            <ArtworkCard key={aw.artwork_id} artwork={aw} childParam={selectedChildId} />
          ))}
        </div>
      )}

      {/* Grid — grouped by month */}
      {sortMode === "byMonth" && artworks.length > 0 && (
        <div className="space-y-8 animate-fade-in">
          {Array.from(grouped.entries()).map(([month, items]) => (
            <section key={month}>
              <h2
                className="text-sm font-bold text-[#5c4a38] mb-3 uppercase tracking-wider"
              >
                {month}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {items.map((aw) => (
                  <ArtworkCard key={aw.artwork_id} artwork={aw} childParam={selectedChildId} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
