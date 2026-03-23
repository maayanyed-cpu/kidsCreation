interface Props {
  milestone: string;
  delay?: number;
}

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
        {/* Trophy icon */}
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94C8.16 14.25 9.53 15.41 11 15.83V18H9v2h6v-2h-2v-2.17c1.47-.42 2.84-1.58 3.61-2.89C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-1">
            Milestone Moment
          </p>
          <p className="text-[15px] font-medium text-[#1a1a2e] leading-relaxed">
            {milestone}
          </p>
        </div>
      </div>
    </div>
  );
}
