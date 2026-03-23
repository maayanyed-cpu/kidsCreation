"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";
import type { VisualEvolution } from "@/types/insights";

const CONFIDENCE_STEPS = ["Tentative", "Developing", "Confident", "Expressive"];

const CONFIDENCE_COLOR: Record<string, string> = {
  Tentative:  "bg-slate-300 text-slate-700",
  Developing: "bg-amber-300 text-amber-800",
  Confident:  "bg-violet-400 text-white",
  Expressive: "bg-emerald-400 text-white",
};

interface Props {
  evolution: VisualEvolution;
  delay?: number;
}

export function CreativeEvolution({ evolution, delay = 0 }: Props) {
  const { t } = useLocale();
  const diversityPct = Math.min(100, Math.max(0, evolution.color_diversity));
  const confidenceIndex = CONFIDENCE_STEPS.indexOf(evolution.line_confidence);

  return (
    <div
      className="card animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-[#9b8474] mb-5">
        {t("cards.evolution.title")}
      </p>

      <div className="space-y-6">
        {/* Color Diversity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎨</span>
              <span className="text-sm font-semibold text-[#374151]">
                {t("cards.evolution.palette")}
              </span>
            </div>
            <span className="text-sm font-bold text-[#7c5cbf]">{diversityPct}%</span>
          </div>
          <div className="h-2.5 bg-[#f3f4f6] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${diversityPct}%`,
                background: "linear-gradient(90deg, #a78bfa, #7c5cbf)",
              }}
            />
          </div>
          <p className="text-xs text-[#9ca3af] mt-1">
            {diversityPct < 40
              ? t("cards.evolution.palette.low")
              : diversityPct < 70
              ? t("cards.evolution.palette.mid")
              : t("cards.evolution.palette.high")}
          </p>
        </div>

        {/* Line Confidence */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✏️</span>
            <span className="text-sm font-semibold text-[#374151]">
              {t("cards.evolution.lineConf")}
            </span>
          </div>
          <div className="flex gap-2">
            {CONFIDENCE_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-full h-2 rounded-full transition-all duration-500 ${
                    i <= confidenceIndex ? "bg-[#7c5cbf]" : "bg-[#f3f4f6]"
                  }`}
                />
                {i === confidenceIndex && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full animate-pop-in ${
                      CONFIDENCE_COLOR[step] ?? "bg-violet-400 text-white"
                    }`}
                  >
                    {t(`lineConf.${step}`)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Subject Complexity */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🌟</span>
            <span className="text-sm font-semibold text-[#374151]">
              {t("cards.evolution.complexity")}
            </span>
          </div>
          <div className="bg-[#faf9f7] rounded-2xl px-4 py-3 border border-[#f3f4f6]">
            <p className="text-sm font-medium text-[#374151]">
              {evolution.subject_complexity}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
