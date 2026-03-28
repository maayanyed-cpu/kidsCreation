"use client";

import { useState } from "react";
import type { ArtworkAnalysis } from "@/types/artwork";
import type { Child } from "@/types/child";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useRouter, usePathname } from "next/navigation";
import { ShareButton } from "@/components/social/ShareButton";
import { ArtworkCard } from "./ArtworkCard";

interface Props {
  artworks: ArtworkAnalysis[];
  allChildren: Child[];
  selectedChildId: string;
  /** Map of childId → artwork count for tab badges */
  artworkCounts?: Record<string, number>;
}

function formatMonthHeader(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function ArtworkGrid({ artworks, allChildren, selectedChildId, artworkCounts }: Props) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [sortMode, setSortMode] = useState<"newest" | "byMonth">("newest");
  const selectedChild = allChildren.find((c) => c.id === selectedChildId);

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
      <style>{`
        .kid-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 500;
          color: #7a6e62;
          border: 1px solid #e8e0d8;
          background: #fffdfb;
          transition: all 0.2s;
          cursor: pointer;
        }
        .kid-tab-btn:hover {
          background: #f5f0eb;
          border-color: #d4c8bc;
        }
        .kid-tab-btn.kid-tab-active {
          background: #f06449;
          color: #fff;
          border-color: transparent;
          box-shadow: 0 8px 24px rgba(240,100,73,0.15);
        }
        .kid-tab-emoji { font-size: 16px; }
        .kid-tab-count { font-weight: 700; opacity: 0.8; font-size: 13px; }

        .sort-toggle-btn {
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 500;
          color: #7a6e62;
          border: 1px solid #e8e0d8;
          background: #fffdfb;
          transition: all 0.2s;
          cursor: pointer;
        }
        .sort-toggle-btn:hover { background: #f5f0eb; }
        .sort-toggle-btn.sort-active {
          background: #3d352e;
          color: #fff;
          border-color: #3d352e;
        }

        .share-row-link {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 24px;
          font-size: 13px;
          color: #a89888;
        }

        .art-grid-new {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .art-grid-new { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .art-grid-new { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Gallery header with sort toggles */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2
          className="text-2xl font-bold text-[#2a241f] flex items-center gap-2.5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          🎨 {locale === "he" ? "גלריה" : "Gallery"}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setSortMode("newest")}
            className={`sort-toggle-btn${sortMode === "newest" ? " sort-active" : ""}`}
          >
            {t("gallery.sort.newest")}
          </button>
          <button
            onClick={() => setSortMode("byMonth")}
            className={`sort-toggle-btn${sortMode === "byMonth" ? " sort-active" : ""}`}
          >
            {t("gallery.sort.byMonth")}
          </button>
        </div>
      </div>

      {/* Kid tabs with counts */}
      {allChildren.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          {allChildren.map((child) => {
            const isSelected = child.id === selectedChildId;
            const name = locale === "he" && child.name_he ? child.name_he : child.name;
            const count = artworkCounts?.[child.id];
            return (
              <button
                key={child.id}
                onClick={() => router.push(`${pathname}?child=${child.id}`)}
                className={`kid-tab-btn${isSelected ? " kid-tab-active" : ""}`}
              >
                <span className="kid-tab-emoji">{child.avatar_emoji}</span>
                {name}
                {count !== undefined && (
                  <span className="kid-tab-count">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Share button */}
      {selectedChild?.share_code && (
        <div className="share-row-link">
          <ShareButton
            childName={selectedChild.name}
            childNameHe={selectedChild.name_he}
            shareCode={selectedChild.share_code}
          />
        </div>
      )}

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
        <div className="art-grid-new animate-fade-in">
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
                suppressHydrationWarning
              >
                {month}
              </h2>
              <div className="art-grid-new">
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
