import type { Insight } from "@/types/insights";

// Sentiment → pastel background + accent colour + emoji
const SENTIMENT_STYLE: Record<string, { bg: string; accent: string; ring: string; emoji: string }> = {
  Joyful:     { bg: "bg-amber-50",   accent: "text-amber-500",  ring: "bg-amber-100",  emoji: "✨" },
  Calm:       { bg: "bg-sky-50",     accent: "text-sky-500",    ring: "bg-sky-100",    emoji: "🌊" },
  Energetic:  { bg: "bg-fuchsia-50", accent: "text-fuchsia-500",ring: "bg-fuchsia-100",emoji: "⚡" },
  Expressive: { bg: "bg-emerald-50", accent: "text-emerald-500",ring: "bg-emerald-100",emoji: "🎨" },
  Dreamy:     { bg: "bg-violet-50",  accent: "text-violet-500", ring: "bg-violet-100", emoji: "🌙" },
  Curious:    { bg: "bg-cyan-50",    accent: "text-cyan-500",   ring: "bg-cyan-100",   emoji: "🔭" },
  Bold:       { bg: "bg-rose-50",    accent: "text-rose-500",   ring: "bg-rose-100",   emoji: "🦁" },
  Warm:       { bg: "bg-orange-50",  accent: "text-orange-500", ring: "bg-orange-100", emoji: "🌻" },
  Playful:    { bg: "bg-green-50",   accent: "text-green-500",  ring: "bg-green-100",  emoji: "🐸" },
};
const DEFAULT_STYLE = { bg: "bg-purple-50", accent: "text-purple-500", ring: "bg-purple-100", emoji: "🎭" };

// Top interest → emoji
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
  const style = SENTIMENT_STYLE[insight.sentiment] ?? DEFAULT_STYLE;
  const topEmoji = INTEREST_EMOJI[insight.top_interest] ?? "🌟";

  // Calculate top subject percentage from thematic_focus
  const subjects = insight.thematic_focus?.subjects ?? {};
  const topSubject = Object.entries(subjects).sort((a, b) => b[1] - a[1])[0];
  const topPct = topSubject ? Math.round(topSubject[1] * 100) : null;

  return (
    <div
      className={`card animate-slide-up ${style.bg} col-span-2`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af]">
          Artist&rsquo;s Obsession of the Month
        </p>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${style.ring} ${style.accent}`}>
          {insight.sentiment}
        </span>
      </div>

      {/* Hero content */}
      <div className="flex items-center gap-5">
        <div className={`flex-shrink-0 w-20 h-20 rounded-2xl ${style.ring} flex items-center justify-center text-5xl`}>
          {topEmoji}
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-[#1a1a2e] leading-tight">
            {insight.top_interest}
          </h2>
          {topPct !== null && (
            <p className={`mt-1 text-sm font-semibold ${style.accent}`}>
              {topSubject?.[0]} — {topPct}% of artwork this month
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
              className="px-3 py-1 rounded-full bg-white/70 text-xs font-medium text-[#374151] border border-white/80"
            >
              {tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
