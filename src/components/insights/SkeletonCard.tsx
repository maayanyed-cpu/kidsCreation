// Skeleton loading cards — shapes match the real card layouts exactly.
// Shimmer animation is driven by globals.css animate-skeleton utility.

function SkeletonLine({ w = "w-full", h = "h-4" }: { w?: string; h?: string }) {
  return <div className={`animate-skeleton rounded-full ${w} ${h}`} />;
}

function SkeletonBlock({ h = "h-20", className = "" }: { h?: string; className?: string }) {
  return <div className={`animate-skeleton rounded-2xl ${h} ${className}`} />;
}

// Hero card (col-span-2) — matches ArtistObsessionCard
export function SkeletonHero() {
  return (
    <div className="card col-span-2 space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <SkeletonLine w="w-40" h="h-3" />
        <SkeletonLine w="w-20" h="h-6" />
      </div>
      <div className="flex items-center gap-5">
        <div className="animate-skeleton flex-shrink-0 w-20 h-20 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <SkeletonLine w="w-48" h="h-7" />
          <SkeletonLine w="w-32" h="h-4" />
        </div>
      </div>
      <div className="flex gap-2">
        {[72, 56, 80, 64].map((w, i) => (
          <div key={i} className={`animate-skeleton h-6 rounded-full`} style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

// Heatmap card — matches InterestHeatmap
export function SkeletonHeatmap() {
  return (
    <div className="card space-y-4 animate-fade-in" style={{ animationDelay: "60ms" }}>
      <SkeletonLine w="w-32" h="h-3" />
      <div className="flex flex-wrap items-end justify-center gap-3 min-h-[140px] py-2">
        {[88, 64, 76, 52, 70, 56].map((size, i) => (
          <div
            key={i}
            className="animate-skeleton rounded-full"
            style={{ width: size, height: size }}
          />
        ))}
      </div>
    </div>
  );
}

// Evolution card — matches CreativeEvolution
export function SkeletonEvolution() {
  return (
    <div className="card space-y-6 animate-fade-in" style={{ animationDelay: "120ms" }}>
      <SkeletonLine w="w-36" h="h-3" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <SkeletonLine w="w-28" h="h-4" />
          <SkeletonLine w="w-10" h="h-4" />
        </div>
        <SkeletonBlock h="h-2.5" className="w-full" />
      </div>
      <div className="space-y-2">
        <SkeletonLine w="w-32" h="h-4" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 animate-skeleton h-2 rounded-full" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonLine w="w-36" h="h-4" />
        <SkeletonBlock h="h-12" />
      </div>
    </div>
  );
}

// Milestone card (col-span-2) — matches MilestoneBadge
export function SkeletonMilestone() {
  return (
    <div className="card col-span-2 animate-fade-in" style={{ animationDelay: "180ms" }}>
      <div className="flex items-start gap-4">
        <div className="animate-skeleton flex-shrink-0 w-14 h-14 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <SkeletonLine w="w-28" h="h-3" />
          <SkeletonLine w="w-full" h="h-4" />
          <SkeletonLine w="w-5/6" h="h-4" />
        </div>
      </div>
    </div>
  );
}

// Scripts card (col-span-2) — matches EncouragementScripts
export function SkeletonScripts() {
  return (
    <div className="card col-span-2 space-y-5 animate-fade-in" style={{ animationDelay: "240ms" }}>
      <div className="flex items-center gap-3">
        <div className="animate-skeleton w-8 h-8 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <SkeletonLine w="w-40" h="h-3" />
          <SkeletonLine w="w-56" h="h-3" />
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-skeleton rounded-2xl h-28" />
        ))}
      </div>
    </div>
  );
}

// Growth tip card (col-span-2) — matches GrowthTipCard
export function SkeletonGrowthTip() {
  return (
    <div className="card col-span-2 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-start gap-4">
        <div className="animate-skeleton flex-shrink-0 w-12 h-12 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <SkeletonLine w="w-44" h="h-3" />
          <SkeletonLine w="w-full" h="h-4" />
          <SkeletonLine w="w-4/5" h="h-4" />
          <SkeletonLine w="w-full" h="h-4" />
          <SkeletonLine w="w-3/5" h="h-4" />
        </div>
      </div>
    </div>
  );
}

// Full skeleton dashboard — drop-in replacement during month switching
export function SkeletonDashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <SkeletonHero />
      <SkeletonHeatmap />
      <SkeletonEvolution />
      <SkeletonMilestone />
      <SkeletonScripts />
      <SkeletonGrowthTip />
    </div>
  );
}
