"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { translateSubject, translateTag } from "@/lib/i18n/contentTranslations";
import type { ThematicFocus } from "@/types/insights";
import type { ArtworkAnalysis } from "@/types/artwork";

const BUBBLE_COLORS = [
  { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe" },
  { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  { bg: "#ffe4e6", text: "#9f1239", border: "#fecdd3" },
  { bg: "#fce7f3", text: "#831843", border: "#f9a8d4" },
  { bg: "#cffafe", text: "#0e7490", border: "#a5f3fc" },
  { bg: "#fed7aa", text: "#9a3412", border: "#fdba74" },
];

interface Props {
  thematicFocus: ThematicFocus;
  artworks: ArtworkAnalysis[];
  delay?: number;
}

function ArtworkModal({
  subject,
  artworks,
  onClose,
}: {
  subject: string;
  artworks: ArtworkAnalysis[];
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const keyword = subject.toLowerCase().split("/")[0].trim();
  const filtered = artworks.filter(
    (a) =>
      a.main_subjects.some((s) => s.toLowerCase().includes(keyword)) ||
      a.ai_tags.some((tag) => tag.toLowerCase().includes(keyword))
  );

  const taggedCount = filtered.length;
  const taggedLabel =
    taggedCount === 1
      ? `1 artwork tagged`
      : `${taggedCount} artworks tagged`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#f5f0eb]">
          <div>
            <h3
              className="text-lg font-bold text-[#2d1f14] capitalize"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {translateSubject(subject, locale)}
            </h3>
            <p className="text-sm text-[#9b8474]">{taggedLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f5f0eb] flex items-center justify-center hover:bg-[#ede8e2] transition-colors"
            aria-label={t("close")}
          >
            <svg className="w-4 h-4 text-[#5c4a38]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4 scrollbar-hide" style={{ maxHeight: "calc(85vh - 92px)" }}>
          {filtered.length === 0 ? (
            <p className="text-sm text-[#9b8474] text-center py-8">
              {t("cards.heatmap.modal.empty")}
            </p>
          ) : (
            filtered.map((artwork) => (
              <div key={artwork.artwork_id} className="flex gap-4 items-start p-3 rounded-2xl bg-[#fdf8f4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artwork.image_url}
                  alt={artwork.main_subjects.join(", ")}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-[#f0ede9]"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2d1f14] capitalize leading-snug">
                    {artwork.main_subjects.join(", ")}
                  </p>
                  {artwork.technique_notes && (
                    <p className="text-xs text-[#9b8474] mt-1 line-clamp-3 leading-relaxed">
                      {artwork.technique_notes}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {artwork.ai_tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-white border border-[#f0ede9] text-[10px] text-[#9b8474]">
                        {translateTag(tag, locale)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function InterestHeatmap({ thematicFocus, artworks, delay = 0 }: Props) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const { t, locale } = useLocale();

  const subjects = Object.entries(thematicFocus?.subjects ?? {}).sort((a, b) => b[1] - a[1]);
  const maxVal = subjects[0]?.[1] ?? 1;

  return (
    <>
      <div className="card animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9b8474] mb-5">
          {t("cards.heatmap.title")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 min-h-[160px] py-2">
          {subjects.map(([subject, value], i) => {
            const color = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
            const baseSize = Math.round(52 + (value / maxVal) * 68);
            const pct = Math.round(value * 100);

            return (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                title={`${translateSubject(subject, locale)} — ${pct}%`}
                aria-label={translateSubject(subject, locale)}
                className="flex flex-col items-center justify-center rounded-full border-2 cursor-pointer
                           transition-transform duration-200 hover:scale-110 active:scale-95
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff7657]/50
                           touch-manipulation"
                style={{
                  animation: [
                    `popIn 0.42s cubic-bezier(0.34,1.56,0.64,1) ${delay + i * 65}ms both`,
                    `breathe 3.5s ease-in-out ${delay + i * 65 + 500}ms infinite`,
                  ].join(", "),
                  width: baseSize,
                  height: baseSize,
                  minWidth: "clamp(64px, 100%, 120px)",
                  maxWidth: baseSize + 8,
                  background: color.bg,
                  color: color.text,
                  borderColor: color.border,
                }}
              >
                <span className="font-bold leading-none" style={{ fontSize: Math.max(10, baseSize * 0.14) }}>
                  {pct}%
                </span>
                <span
                  className="font-semibold text-center leading-tight px-1 mt-0.5 capitalize"
                  style={{ fontSize: Math.max(9, baseSize * 0.12) }}
                >
                  {translateSubject(subject, locale)}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-[#9b8474] mt-4">
          {t("cards.heatmap.tapHint")}
        </p>
      </div>

      {activeSubject && (
        <ArtworkModal
          subject={activeSubject}
          artworks={artworks}
          onClose={() => setActiveSubject(null)}
        />
      )}
    </>
  );
}
