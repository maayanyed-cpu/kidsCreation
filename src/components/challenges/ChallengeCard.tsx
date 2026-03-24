"use client";

import Link from "next/link";

const DIFFICULTY_STYLE: Record<string, { bg: string; color: string; label: string; label_he: string }> = {
  easy:      { bg: "#e6faf8", color: "#0f9d8f", label: "Easy",      label_he: "קל" },
  medium:    { bg: "#fff6ed", color: "#e07b4a", label: "Medium",    label_he: "בינוני" },
  adventure: { bg: "#f0e9f8", color: "#7c5cbf", label: "Adventure", label_he: "הרפתקה" },
};

export interface ChallengeData {
  id: string;
  title: string;
  title_he: string;
  description: string;
  description_he: string;
  emoji: string;
  category: string;
  difficulty: string;
  week_end: string;
}

interface Props {
  challenge: ChallengeData;
  childId: string;
  childName: string;
  completed: boolean;
  submissionThumb?: string | null;
  daysLeft: number;
  locale?: "en" | "he";
}

export function ChallengeCard({
  challenge,
  childId,
  childName,
  completed,
  submissionThumb,
  daysLeft,
  locale = "en",
}: Props) {
  const he = locale === "he";
  const diff = DIFFICULTY_STYLE[challenge.difficulty] ?? DIFFICULTY_STYLE.easy;
  const title = he ? challenge.title_he : challenge.title;
  const desc = he ? challenge.description_he : challenge.description;

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #fff8f5 0%, #f0faf8 100%)",
        boxShadow: "0 2px 8px rgba(45,31,20,0.08), 0 0 0 1px rgba(45,31,20,0.03)",
      }}
      dir={he ? "rtl" : "ltr"}
    >
      <div className="px-5 pt-5 pb-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{challenge.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-[#9b8474] uppercase tracking-wider">
                {he ? "אתגר השבוע" : "This Week's Challenge"}
              </p>
              <h2
                className="text-base font-bold text-[#2d1f14]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {title}
              </h2>
            </div>
          </div>
          {/* Difficulty badge */}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: diff.bg, color: diff.color }}
          >
            {he ? diff.label_he : diff.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-[#5c4a38] leading-relaxed mb-4">{desc}</p>

        {/* Status */}
        {completed ? (
          <div className="flex items-center gap-3">
            {submissionThumb && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={submissionThumb}
                alt=""
                className="w-12 h-12 rounded-xl object-cover"
              />
            )}
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0f9d8f]">
              <span>✅</span>
              <span>{he ? "האתגר הושלם!" : "Challenge Complete!"} 🎉</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href={`/upload?child=${childId}&challenge=${challenge.id}`}
              className="flex-1 py-2.5 rounded-2xl text-center text-sm font-bold text-white transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #ff7657, #ff9a7b)" }}
            >
              {he ? "קבלו את האתגר! 🎨" : "Accept Challenge! 🎨"}
            </Link>
            <span className="text-xs text-[#9b8474] flex-shrink-0">
              {daysLeft === 0
                ? he ? "יום אחרון!" : "Last day!"
                : he
                ? `${daysLeft} ימים נותרו`
                : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
