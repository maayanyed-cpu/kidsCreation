"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";
import { translateTag, translateInterest, translateSubject } from "@/lib/i18n/contentTranslations";
import type { Insight } from "@/types/insights";

// Warmer, more contextually accurate sentiment palette
const SENTIMENT_STYLE: Record<string, {
  bg: string;
  pill: string;
  pillText: string;
  accent: string;
  icon: string;
  emoji: string;
}> = {
  Joyful:     { bg: "#fffbeb", pill: "#fef3c7", pillText: "#b45309", accent: "#d97706", icon: "#fde68a", emoji: "✨" },
  Calm:       { bg: "#eff6ff", pill: "#dbeafe", pillText: "#1d4ed8", accent: "#3b82f6", icon: "#bfdbfe", emoji: "🌊" },
  Energetic:  { bg: "#fff7ed", pill: "#fed7aa", pillText: "#c2410c", accent: "#ff7657", icon: "#fdba74", emoji: "⚡" },
  Expressive: { bg: "#f0fdf4", pill: "#bbf7d0", pillText: "#15803d", accent: "#16a34a", icon: "#86efac", emoji: "🎨" },
  Dreamy:     { bg: "#faf5ff", pill: "#ede9fe", pillText: "#6d28d9", accent: "#7c3aed", icon: "#ddd6fe", emoji: "🌙" },
  Curious:    { bg: "#ecfeff", pill: "#cffafe", pillText: "#0e7490", accent: "#0891b2", icon: "#a5f3fc", emoji: "🔭" },
  Bold:       { bg: "#fff1f2", pill: "#ffe4e6", pillText: "#be123c", accent: "#e11d48", icon: "#fecdd3", emoji: "🦁" },
  Warm:       { bg: "#fff7ed", pill: "#fed7aa", pillText: "#c2410c", accent: "#ea580c", icon: "#fdba74", emoji: "🌻" },
  Playful:    { bg: "#f0fdf4", pill: "#d1fae5", pillText: "#065f46", accent: "#059669", icon: "#6ee7b7", emoji: "🐸" },
};
const DEFAULT_STYLE = {
  bg: "#faf5ff", pill: "#ede9fe", pillText: "#6d28d9",
  accent: "#7c5cbf", icon: "#ddd6fe", emoji: "🎭",
};

const INTEREST_EMOJI: Record<string, string> = {
  Animals: "🦁", "Animals & Nature": "🦁",
  "Family & People": "👨‍👩‍👧", Family: "👨‍👩‍👧",
  "Games & Adventure": "🎮", Gaming: "🎮",
  "Space & Planets": "🚀", Space: "🚀",
  "Fantasy & Magic": "🐉", Fantasy: "🐉",
  "Technology & Robots": "🤖",
  "Ocean & Sea Creatures": "🐋",
  "Nature & Outdoors": "🌿",
  "Creative Exploration": "🎨",
};

interface Props {
  insight: Insight;
  delay?: number;
}

export function ArtistObsessionCard({ insight, delay = 0 }: Props) {
  const { t, locale } = useLocale();
  const s = SENTIMENT_STYLE[insight.sentiment] ?? DEFAULT_STYLE;
  const topEmoji = INTEREST_EMOJI[insight.top_interest] ?? "🌟";

  const subjects = insight.thematic_focus?.subjects ?? {};
  const topSubject = Object.entries(subjects).sort((a, b) => b[1] - a[1])[0];
  const topPct = topSubject ? Math.round(topSubject[1] * 100) : null;

  const interestLabel = translateInterest(insight.top_interest, locale);

  return (
    <div
      className="card animate-slide-up col-span-2"
      style={{ animationDelay: `${delay}ms`, background: s.bg }}
    >
      {/* Label + sentiment pill */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9b8474]">
          {t("cards.obsession.title")}
        </p>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: s.pill, color: s.pillText }}
        >
          {t(`sentiment.${insight.sentiment}`)}
        </span>
      </div>

      {/* Hero */}
      <div className="flex items-center gap-5">
        <div
          className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-5xl"
          style={{ background: s.icon }}
        >
          {topEmoji}
        </div>
        <div className="min-w-0">
          <h2
            className="text-2xl font-bold leading-tight text-[#2d1f14]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {interestLabel}
          </h2>
          {topPct !== null && (
            <p className="mt-1 text-sm font-semibold" style={{ color: s.accent }}>
              {translateSubject(topSubject?.[0] ?? "", locale)} — {topPct}%{" "}
              {locale === "he" ? "מהיצירות החודש" : "of artwork this month"}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      {insight.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {insight.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-white/70 text-xs font-medium text-[#5c4a38] border border-white/80"
            >
              {translateTag(tag, locale)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
