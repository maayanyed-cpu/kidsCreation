"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleContext";

/* ── SVG icon components ──────────────────────────────────────────────────── */

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
      <path d="M12 5v14M5 12h14" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function MedalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
      <circle cx="12" cy="8" r="5" />
      <path d="M7.5 14.5L5 21l7-3 7 3-2.5-6.5" />
    </svg>
  );
}

function LayoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

type NavKey = "gallery" | "upload" | "kids" | "family" | "challenges" | "dashboard" | "points";

const NAV_ITEMS: { key: NavKey; href: string; icon: React.ComponentType }[] = [
  { key: "gallery",    href: "/gallery",    icon: GridIcon },
  { key: "upload",     href: "/upload",     icon: PlusCircleIcon },
  { key: "kids",       href: "/kids",       icon: UsersIcon },
  { key: "family",     href: "/family",     icon: HeartIcon },
];

const NAV_ITEMS_LOWER: { key: NavKey; href: string; icon: React.ComponentType }[] = [
  { key: "challenges", href: "/challenges", icon: MedalIcon },
  { key: "points",     href: "/points",     icon: StarIcon },
  { key: "dashboard",  href: "/dashboard",  icon: LayoutIcon },
];

const ALL_NAV_ITEMS = [...NAV_ITEMS, ...NAV_ITEMS_LOWER];

/* ── Emoji fallback map for bottom bar on mobile ──────────────────────────── */
const EMOJI_MAP: Record<NavKey, string> = {
  gallery: "🎨",
  upload: "➕",
  kids: "👤",
  family: "♡",
  challenges: "🏆",
  points: "⭐",
  dashboard: "📊",
};

function useActiveRoute(): NavKey {
  const pathname = usePathname();
  if (pathname.startsWith("/gallery"))    return "gallery";
  if (pathname.startsWith("/upload"))     return "upload";
  if (pathname === "/kids")               return "kids";
  if (pathname.startsWith("/family"))     return "family";
  if (pathname.startsWith("/challenges")) return "challenges";
  if (pathname.startsWith("/points"))     return "points";
  return "dashboard";
}

/* ── Points data hook for sidebar widget ────────────────────────────────── */
interface PointsData {
  total: number;
  tier: string;
  nextTier: string | null;
  nextTierAt: number | null;
}

function getTierStart(total: number): number {
  if (total >= 1000) return 1000;
  if (total >= 500) return 500;
  if (total >= 100) return 100;
  return 0;
}

function usePointsData(): PointsData | null {
  const [data, setData] = useState<PointsData | null>(null);
  useEffect(() => {
    fetch("/api/points")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);
  return data;
}

function useShowNav() {
  const pathname = usePathname();
  return (
    !pathname.startsWith("/auth/") &&
    !pathname.startsWith("/onboarding")
  );
}

// ── Bottom bar (mobile) ──────────────────────────────────────────────────────
function BottomBar() {
  const active = useActiveRoute();
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const child = searchParams.get("child");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-md border-t border-[#f0ede9]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {ALL_NAV_ITEMS.map(({ key, href }) => {
          const isActive = active === key;
          const to = (key === "dashboard" || key === "gallery") && child
            ? `${href}?child=${child}`
            : href;
          return (
            <Link
              key={key}
              href={to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                isActive ? "text-[#ff7657]" : "text-[#9b8474]"
              }`}
            >
              <span className="text-xl leading-none">{EMOJI_MAP[key]}</span>
              <span suppressHydrationWarning>{t(`nav.${key}`)}</span>
              {isActive && (
                <span
                  className="absolute bottom-0 h-0.5 w-8 rounded-full bg-[#ff7657]"
                  style={{ marginBottom: "env(safe-area-inset-bottom)" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ── Sidebar (desktop) ────────────────────────────────────────────────────────
function Sidebar() {
  const active = useActiveRoute();
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const child = searchParams.get("child");
  const pointsData = usePointsData();

  return (
    <>
      <style>{`
        .sb-points-widget {
          margin: 0 4px 20px;
          padding: 14px;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 16px;
        }
        .sb-points-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .sb-points-icon { font-size: 20px; }
        .sb-points-count {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 800;
          color: #d97706;
        }
        .sb-points-label {
          font-size: 11px;
          font-weight: 600;
          color: #f59e0b;
          margin-left: 2px;
        }
        .sb-points-bar-w {
          height: 6px;
          background: #fef3c7;
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 6px;
        }
        .sb-points-fill-w {
          height: 100%;
          border-radius: 9999px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          transition: width 0.6s ease;
        }
        .sb-points-next {
          font-size: 11px;
          color: #a89888;
        }
        .sb-points-next strong {
          color: #d97706;
        }
        .sb-link {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #7a6e62;
          transition: all 0.2s ease;
          position: relative;
          text-decoration: none;
        }
        .sb-link:hover {
          background: #f5f0eb;
          color: #3d352e;
        }
        .sb-link:hover .sb-icon-wrap {
          opacity: 0.8;
        }
        .sb-link.sb-active {
          background: #fff5f2;
          color: #f06449;
          font-weight: 600;
        }
        .sb-link.sb-active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: #f06449;
        }
        .sb-icon-wrap {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.55;
          flex-shrink: 0;
        }
        .sb-link.sb-active .sb-icon-wrap {
          opacity: 1;
        }
        .sb-brand-logo {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          background: linear-gradient(135deg, #f06449, #ff8566);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          position: relative;
          box-shadow: 0 4px 12px rgba(240,100,73,0.2);
        }
        .sb-brand-logo::after {
          content: '';
          position: absolute;
          top: -2px;
          right: -2px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #3bb09e;
          border: 2px solid #fffdfb;
        }
      `}</style>

      <nav className="fixed left-0 top-0 bottom-0 z-40 w-[220px] hidden md:flex flex-col bg-[#fffdfb] border-r border-[#e8e0d8]"
        style={{ padding: "20px 14px" }}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 px-2 pt-1 no-underline">
          <div className="sb-brand-logo">✦</div>
          <span
            className="text-[17px] font-bold text-[#2a241f]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Arti <span className="text-[#f06449]">Steps</span>
          </span>
        </Link>

        {/* Points widget */}
        {pointsData && (
          <Link href="/points" className="no-underline" style={{ textDecoration: "none" }}>
            <div className="sb-points-widget">
              <div className="sb-points-row">
                <span className="sb-points-icon">⭐</span>
                <span className="sb-points-count">{pointsData.total}</span>
                <span className="sb-points-label">pts</span>
              </div>
              <div className="sb-points-bar-w">
                <div
                  className="sb-points-fill-w"
                  style={{
                    width: pointsData.nextTierAt
                      ? `${Math.min(100, Math.round(((pointsData.total - getTierStart(pointsData.total)) / (pointsData.nextTierAt - getTierStart(pointsData.total))) * 100))}%`
                      : "100%",
                  }}
                />
              </div>
              <div className="sb-points-next">
                {pointsData.nextTierAt
                  ? <>{pointsData.nextTierAt - pointsData.total} pts to <strong>{pointsData.nextTier}</strong></>
                  : <strong>Max tier reached!</strong>
                }
              </div>
            </div>
          </Link>
        )}

        {/* Nav items — upper group */}
        <div className="flex flex-col gap-0.5 flex-1 mt-1">
          {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
            const isActive = active === key;
            const to = (key === "dashboard" || key === "gallery") && child
              ? `${href}?child=${child}`
              : href;
            return (
              <Link
                key={key}
                href={to}
                className={`sb-link${isActive ? " sb-active" : ""}`}
              >
                <span className="sb-icon-wrap"><Icon /></span>
                <span suppressHydrationWarning>{t(`nav.${key}`)}</span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="h-px bg-[#f5f0eb] my-3 mx-2" />

          {/* Nav items — lower group */}
          {NAV_ITEMS_LOWER.map(({ key, href, icon: Icon }) => {
            const isActive = active === key;
            const to = (key === "dashboard" || key === "gallery") && child
              ? `${href}?child=${child}`
              : href;
            return (
              <Link
                key={key}
                href={to}
                className={`sb-link${isActive ? " sb-active" : ""}`}
              >
                <span className="sb-icon-wrap"><Icon /></span>
                <span suppressHydrationWarning>{t(`nav.${key}`)}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3.5 border-t border-[#f5f0eb] text-[11px] text-[#d4c8bc] ps-2" style={{ letterSpacing: "0.3px" }}>
          FamilyVibe Labs
        </div>
      </nav>
    </>
  );
}

// ── Export: renders both, CSS controls which is visible ──────────────────────
export function AppNav() {
  const show = useShowNav();
  if (!show) return null;
  return (
    <>
      <Sidebar />
      <BottomBar />
    </>
  );
}
