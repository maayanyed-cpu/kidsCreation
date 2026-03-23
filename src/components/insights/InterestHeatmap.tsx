"use client";

import { useState } from "react";
import type { ThematicFocus } from "@/types/insights";
import type { ArtworkAnalysis } from "@/types/artwork";

// Distinct pastel colours for bubbles — cycles if more than 8 subjects
const BUBBLE_COLORS = [
  { bg: "bg-violet-100",  text: "text-violet-700",  border: "border-violet-200",  hover: "hover:bg-violet-200"  },
  { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200",   hover: "hover:bg-amber-200"   },
  { bg: "bg-sky-100",     text: "text-sky-700",     border: "border-sky-200",     hover: "hover:bg-sky-200"     },
  { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", hover: "hover:bg-emerald-200" },
  { bg: "bg-rose-100",    text: "text-rose-700",    border: "border-rose-200",    hover: "hover:bg-rose-200"    },
  { bg: "bg-fuchsia-100", text: "text-fuchsia-700", border: "border-fuchsia-200", hover: "hover:bg-fuchsia-200" },
  { bg: "bg-cyan-100",    text: "text-cyan-700",    border: "border-cyan-200",    hover: "hover:bg-cyan-200"    },
  { bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200",  hover: "hover:bg-orange-200"  },
];

interface Props {
  thematicFocus: ThematicFocus;
  artworks: ArtworkAnalysis[];
  delay?: number;
}

interface ArtworkModalProps {
  subject: string;
  artworks: ArtworkAnalysis[];
  onClose: () => void;
}

function ArtworkModal({ subject, artworks, onClose }: ArtworkModalProps) {
  const filtered = artworks.filter(
    (a) =>
      a.main_subjects.some((s) => s.toLowerCase().includes(subject.toLowerCase().split("/")[0].trim())) ||
      a.ai_tags.some((t) => t.toLowerCase().includes(subject.toLowerCase().split("/")[0].trim()))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#f3f4f6]">
          <div>
            <h3 className="text-lg font-bold text-[#1a1a2e] capitalize">
              {subject.replace(/_/g, " ")}
            </h3>
            <p className="text-sm text-[#9ca3af]">
              {filtered.length} artwork{filtered.length !== 1 ? "s" : ""} tagged
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center hover:bg-[#e5e7eb] transition-colors"
          >
            <svg className="w-4 h-4 text-[#374151]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4" style={{ maxHeight: "calc(80vh - 88px)" }}>
          {filtered.length === 0 ? (
            <p className="text-sm text-[#9ca3af] text-center py-8">
              No artwork images available for this subject yet.
            </p>
          ) : (
            filtered.map((artwork) => (
              <div key={artwork.artwork_id} className="flex gap-4 items-start p-3 rounded-2xl bg-[#faf9f7]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artwork.image_url}
                  alt={artwork.main_subjects.join(", ")}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-[#e5e7eb]"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a2e] capitalize leading-snug">
                    {artwork.main_subjects.join(", ")}
                  </p>
                  {artwork.technique_notes && (
                    <p className="text-xs text-[#6b7280] mt-1 line-clamp-3 leading-relaxed">
                      {artwork.technique_notes}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {artwork.ai_tags.slice(0, 3).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-white border border-[#e5e7eb] text-[10px] text-[#6b7280]">
                        {t.replace(/_/g, " ")}
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

  const subjects = Object.entries(thematicFocus?.subjects ?? {}).sort((a, b) => b[1] - a[1]);
  const maxVal = subjects[0]?.[1] ?? 1;

  return (
    <>
      <div
        className="card animate-slide-up"
        style={{ animationDelay: `${delay}ms` }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af] mb-5">
          Interest Heatmap
        </p>

        <div className="flex flex-wrap items-end justify-center gap-3 min-h-[140px] py-2">
          {subjects.map(([subject, value], i) => {
            const color = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
            // Size: 52px minimum, up to 112px for the top subject
            const size = Math.round(52 + (value / maxVal) * 60);
            const pct = Math.round(value * 100);

            return (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                title={`${subject.replace(/_/g, " ")} — ${pct}%`}
                className={`
                  flex flex-col items-center justify-center rounded-full border-2 cursor-pointer
                  transition-all duration-200 hover:scale-110 active:scale-95
                  ${color.bg} ${color.text} ${color.border} ${color.hover}
                  animate-pop-in
                `}
                style={{
                  width: size,
                  height: size,
                  animationDelay: `${delay + i * 60}ms`,
                }}
              >
                <span className="font-bold leading-none" style={{ fontSize: Math.max(9, size * 0.14) }}>
                  {pct}%
                </span>
                <span
                  className="font-medium text-center leading-tight px-1 mt-0.5 capitalize"
                  style={{ fontSize: Math.max(8, size * 0.12) }}
                >
                  {subject.replace(/_/g, " ").replace(/ \/ /g, "/")}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-[#9ca3af] mt-4">
          Tap a bubble to see the artwork
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
