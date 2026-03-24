"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleContext";

const DIFF_COLOR: Record<string, string> = {
  easy: "#0f9d8f",
  medium: "#e07b4a",
  adventure: "#7c5cbf",
};

interface ChallengeItem {
  id: string;
  title: string;
  title_he: string;
  emoji: string;
  difficulty: string;
  week_start: string;
  week_end: string;
  isCurrent: boolean;
  submissions: { child_id: string; artwork_id: string }[];
}

interface ChildInfo {
  id: string;
  name: string;
  name_he: string | null;
  avatar_emoji: string;
}

interface Props {
  challenges: ChallengeItem[];
  children: ChildInfo[];
  streaks: Record<string, number>;
}

export function ChallengeHistory({ challenges, children, streaks }: Props) {
  const { locale } = useLocale();
  const he = locale === "he";

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 40%, #f0faf8 100%)" }}
    >
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-[#f0ede9] px-4 sm:px-6 py-4">
        <div className="max-w-lg mx-auto">
          <h1
            className="text-xl font-bold text-[#2d1f14] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            🏆 {he ? "אתגרים" : "Challenges"}
          </h1>
        </div>
      </header>

      <main
        className="max-w-lg mx-auto px-4 sm:px-6 py-6 space-y-6"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
        dir={he ? "rtl" : "ltr"}
      >
        {/* Streaks */}
        {children.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {children.map((child) => {
              const s = streaks[child.id] ?? 0;
              if (s === 0) return null;
              return (
                <div
                  key={child.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fff6ed] text-sm"
                >
                  <span>{child.avatar_emoji}</span>
                  <span className="font-bold text-[#e07b4a]">
                    {he ? `${s} שבועות ברצף 🔥` : `${s}-week streak 🔥`}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Challenge list */}
        <div className="space-y-3">
          {challenges.map((ch) => {
            const title = he ? ch.title_he : ch.title;
            const weekLabel = new Date(ch.week_start).toLocaleDateString(
              he ? "he-IL" : "en-US",
              { month: "short", day: "numeric" }
            );

            return (
              <div
                key={ch.id}
                className="rounded-2xl bg-white p-4"
                style={{
                  boxShadow: "0 1px 4px rgba(45,31,20,0.06)",
                  border: ch.isCurrent ? "2px solid #ff7657" : "1px solid transparent",
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{ch.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-[#2d1f14] truncate">{title}</h3>
                      {ch.isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fff1ed] text-[#ff7657] flex-shrink-0">
                          {he ? "עכשיו" : "NOW"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9b8474] mb-2">{weekLabel}</p>

                    {/* Child completion badges */}
                    <div className="flex items-center gap-2">
                      {children.map((child) => {
                        const submitted = ch.submissions.some(
                          (s) => s.child_id === child.id
                        );
                        return (
                          <div
                            key={child.id}
                            className="flex items-center gap-0.5"
                            title={`${child.name}: ${submitted ? "completed" : "not yet"}`}
                          >
                            <span className="text-sm">{child.avatar_emoji}</span>
                            <span className="text-xs">
                              {submitted ? "✅" : "⬜"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Difficulty dot */}
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                    style={{ background: DIFF_COLOR[ch.difficulty] ?? "#ccc" }}
                  />
                </div>

                {/* Current challenge CTA */}
                {ch.isCurrent && (
                  <Link
                    href={`/upload?challenge=${ch.id}`}
                    className="mt-3 block w-full py-2 rounded-xl text-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #ff7657, #ff9a7b)" }}
                  >
                    {he ? "השתתפו באתגר! 🎨" : "Join this challenge! 🎨"}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {challenges.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-sm text-[#9b8474]">
              {he ? "אין אתגרים עדיין" : "No challenges yet — check back soon!"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
