interface Props {
  tip: string;
  delay?: number;
}

export function GrowthTipCard({ tip, delay = 0 }: Props) {
  // Split at the first sentence to style celebrate/stretch differently
  const firstPeriod = tip.indexOf(". ");
  const celebrate = firstPeriod > -1 ? tip.slice(0, firstPeriod + 1) : tip;
  const stretch = firstPeriod > -1 ? tip.slice(firstPeriod + 2) : "";

  return (
    <div
      className="card animate-slide-up bg-emerald-50 col-span-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Lightbulb icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-2">
            Growth Tip — Celebrate &amp; Stretch
          </p>

          <p className="text-[15px] font-semibold text-[#1a1a2e] leading-relaxed">
            {celebrate}
          </p>

          {stretch && (
            <p className="text-[15px] text-[#374151] leading-relaxed mt-2">
              {stretch}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
