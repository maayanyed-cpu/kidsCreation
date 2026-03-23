"use client";

interface MonthSelectorProps {
  periods: string[];
  selected: string;
  onChange: (period: string) => void;
  loading?: boolean;
}

export function MonthSelector({ periods, selected, onChange, loading }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-[#6b7280]">Period</span>
      <div className="relative">
        <select
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className="appearance-none bg-white border border-[#e5e7eb] rounded-full px-4 py-2 pr-9 text-sm font-semibold text-[#1a1a2e] shadow-sm cursor-pointer hover:border-[#7c5cbf] focus:outline-none focus:ring-2 focus:ring-[#7c5cbf]/30 transition-all disabled:opacity-50"
        >
          {periods.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <svg className="animate-spin w-4 h-4 text-[#7c5cbf]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-[#7c5cbf]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
