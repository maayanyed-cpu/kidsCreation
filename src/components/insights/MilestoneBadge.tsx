interface Props {
  milestone: string;
  delay?: number;
}

const SPARKLES = [
  { top: -6, left: 8,  size: 7,  color: "#fbbf24", delay: 0 },
  { top: 2,  left: -8, size: 5,  color: "#ff7657", delay: 0.6 },
  { top: -4, left: 44, size: 6,  color: "#a78bfa", delay: 1.1 },
  { top: 36, left: -6, size: 5,  color: "#fbbf24", delay: 1.7 },
];

export function MilestoneBadge({ milestone, delay = 0 }: Props) {
  if (!milestone) return null;

  return (
    <div
      className="card animate-slide-up col-span-2 relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Shimmer background strip */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none rounded-[20px]"
        style={{
          background:
            "linear-gradient(105deg, transparent 20%, #fbbf24 50%, transparent 80%)",
          backgroundSize: "200% 100%",
          animation: "shimmerGold 3s linear infinite",
        }}
      />

      <div className="relative flex items-start gap-4">
        {/* Trophy icon + sparkles */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94C8.16 14.25 9.53 15.41 11 15.83V18H9v2h6v-2h-2v-2.17c1.47-.42 2.84-1.58 3.61-2.89C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
            </svg>
          </div>

          {/* CSS sparkle stars */}
          {SPARKLES.map((s, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                position: "absolute",
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                borderRadius: "50%",
                background: s.color,
                animation: `sparkle 2.4s ease-in-out ${s.delay}s infinite`,
                pointerEvents: "none",
              }}
            />
          ))}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-1">
            Milestone Moment
          </p>
          <p
            className="text-[15px] font-medium text-[#2d1f14] leading-relaxed"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {milestone}
          </p>
        </div>
      </div>
    </div>
  );
}
