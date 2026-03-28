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

function getBadge(ch: ChallengeItem, he: boolean): { label: string; className: string } {
  const now = new Date();
  const start = new Date(ch.week_start);
  const end = new Date(ch.week_end);

  if (ch.isCurrent) {
    return {
      label: he ? "🔥 פעיל עכשיו" : "🔥 Active Now",
      className: "ch-badge-active",
    };
  }
  if (start > now) {
    const dateStr = start.toLocaleDateString(he ? "he-IL" : "en-US", { month: "short", day: "numeric" });
    return {
      label: he ? `📅 מתחיל ${dateStr}` : `📅 Starts ${dateStr}`,
      className: "ch-badge-upcoming",
    };
  }
  return {
    label: he ? "✓ הושלם" : "✓ Completed",
    className: "ch-badge-completed",
  };
}

function daysLeft(weekEnd: string): number {
  const diff = new Date(weekEnd).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function ChallengeHistory({ challenges, children, streaks }: Props) {
  const { locale } = useLocale();
  const he = locale === "he";

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 40%, #f0faf8 100%)" }}
    >
      <style>{`
        .ch-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .ch-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .ch-grid { grid-template-columns: 1fr; }
        }

        .ch-card {
          background: #fffdfb;
          border: 1px solid #e8e0d8;
          border-radius: 20px;
          padding: 20px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .ch-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(42,36,31,0.08);
        }
        .ch-card.ch-featured {
          background: linear-gradient(135deg, #fff5f2, #fefcf8);
          border-color: #ffe8e0;
        }

        .ch-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }
        .ch-badge-active { background: #d4f1eb; color: #1e7368; }
        .ch-badge-upcoming { background: #f8ead0; color: #5c5248; }
        .ch-badge-completed { background: #f5f0eb; color: #a89888; }

        .ch-card h4 {
          font-size: 16px;
          font-weight: 700;
          color: #2a241f;
          margin-bottom: 4px;
        }
        .ch-card .ch-desc {
          font-size: 13px;
          color: #a89888;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .ch-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: #a89888;
        }
        .ch-reward {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 9999px;
          background: #fdf6eb;
          font-weight: 600;
          color: #5c5248;
        }
        .btn-join {
          padding: 6px 16px;
          background: #f06449;
          color: #fff;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }
        .btn-join:hover {
          background: #d94f36;
          box-shadow: 0 8px 24px rgba(240,100,73,0.15);
        }

        .ch-child-badges {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
        }
      `}</style>

      <main
        className="max-w-5xl mx-auto px-6 sm:px-10 py-8"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
        dir={he ? "rtl" : "ltr"}
      >
        <h2
          className="text-2xl font-bold text-[#2a241f] flex items-center gap-2.5 mb-5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          🏆 {he ? "אתגרים שבועיים" : "Weekly Challenges"}
        </h2>

        {/* Streaks */}
        {children.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-5">
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

        {/* Challenge grid */}
        <div className="ch-grid">
          {challenges.map((ch) => {
            const title = he ? ch.title_he : ch.title;
            const badge = getBadge(ch, he);
            const days = daysLeft(ch.week_end);
            const entryCount = ch.submissions.length;

            return (
              <div
                key={ch.id}
                className={`ch-card${ch.isCurrent ? " ch-featured" : ""}`}
              >
                <span className={`ch-badge ${badge.className}`}>{badge.label}</span>
                <h4>{ch.emoji} {title}</h4>

                {/* Child completion badges */}
                <div className="ch-child-badges">
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

                <div className="ch-meta">
                  {ch.isCurrent ? (
                    <>
                      <span>🕐 {he ? `${days} ימים נותרו` : `${days} days left`} · {entryCount} {he ? "הגשות" : "entries"}</span>
                      <Link href={`/upload?challenge=${ch.id}`} className="btn-join">
                        {he ? "הצטרפו!" : "Join Challenge"}
                      </Link>
                    </>
                  ) : (
                    <span>
                      {entryCount > 0
                        ? `${entryCount} ${he ? "הגשות" : "entries"}`
                        : ""}
                    </span>
                  )}
                </div>
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
