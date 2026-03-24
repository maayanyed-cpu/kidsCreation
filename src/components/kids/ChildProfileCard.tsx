"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { formatAge } from "@/lib/age";
import type { ArtworkAnalysis } from "@/types/artwork";

interface ChildData {
  id: string;
  name: string;
  name_he: string | null;
  avatar_emoji: string;
  date_of_birth: string | null;
  share_code: string | null;
}

interface Props {
  child: ChildData;
  stats: { artworkCount: number; challengesCompleted: number; streak: number };
  recentArtworks: ArtworkAnalysis[];
}

export function ChildProfileCard({ child, stats, recentArtworks }: Props) {
  const { locale } = useLocale();
  const he = locale === "he";
  const name = he && child.name_he ? child.name_he : child.name;
  const age = formatAge(child.date_of_birth, locale as "en" | "he");

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 40%, #f0faf8 100%)" }}
    >
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-[#f0ede9] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link
            href={`/dashboard?child=${child.id}`}
            className="text-sm font-medium text-[#5c4a38] hover:text-[#ff7657] transition-colors"
          >
            ← {he ? "חזרה" : "Back"}
          </Link>
        </div>
      </header>

      <main
        className="max-w-lg mx-auto px-4 py-8 space-y-6"
        dir={he ? "rtl" : "ltr"}
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        {/* Hero — avatar + name + age */}
        <div className="text-center">
          <div
            className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-5xl mb-4"
            style={{
              background: "linear-gradient(135deg, #fff4f0, #f0faf8)",
              boxShadow: "0 4px 20px rgba(255,118,87,0.15), 0 0 0 3px white",
            }}
          >
            {child.avatar_emoji}
          </div>
          <h1
            className="text-2xl font-bold text-[#2d1f14]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {name}
          </h1>
          <span
            className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: "#fff1ed", color: "#ff7657" }}
          >
            {age}
          </span>
        </div>

        {/* Stats row */}
        <div
          className="rounded-2xl bg-white p-4 flex items-center justify-around"
          style={{ boxShadow: "0 1px 4px rgba(45,31,20,0.06)" }}
        >
          <StatItem emoji="🎨" value={stats.artworkCount} label={he ? "יצירות" : "artworks"} />
          <div className="w-px h-8 bg-[#f0ede9]" />
          <StatItem emoji="🏆" value={stats.challengesCompleted} label={he ? "אתגרים" : "challenges"} />
          <div className="w-px h-8 bg-[#f0ede9]" />
          <StatItem
            emoji="🔥"
            value={stats.streak}
            label={he ? "רצף שבועות" : "week streak"}
          />
        </div>

        {/* Mini gallery */}
        {recentArtworks.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-[#9b8474] uppercase tracking-wider mb-3">
              {he ? "יצירות אחרונות" : "Recent Creations"}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {recentArtworks.map((art) => (
                <Link
                  key={art.artwork_id}
                  href={`/gallery/${art.artwork_id}?child=${child.id}`}
                  className="aspect-square rounded-xl overflow-hidden bg-[#f0ede9]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={art.thumb_url ?? art.image_url}
                    alt={art.title ?? "artwork"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <Link
            href={`/gallery?child=${child.id}`}
            className="block w-full py-3 rounded-2xl text-center text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #ff7657, #ff9a7b)" }}
          >
            🎨 {he ? "הגלריה המלאה" : "View Full Gallery"}
          </Link>
          <Link
            href={`/dashboard?child=${child.id}`}
            className="block w-full py-3 rounded-2xl text-center text-sm font-semibold bg-[#f5f0eb] text-[#5c4a38]"
          >
            📊 {he ? "דוח גדילה יצירתי" : "View Growth Report"}
          </Link>
        </div>
      </main>
    </div>
  );
}

function StatItem({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg">{emoji}</div>
      <div className="text-lg font-bold text-[#2d1f14]">{value}</div>
      <div className="text-[10px] text-[#9b8474] font-medium">{label}</div>
    </div>
  );
}
