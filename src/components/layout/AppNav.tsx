"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleContext";

const NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", emoji: "📊" },
  { key: "gallery",   href: "/gallery",   emoji: "🎨" },
  { key: "upload",    href: "/upload",    emoji: "➕" },
] as const;

function useActiveRoute() {
  const pathname = usePathname();
  if (pathname.startsWith("/gallery")) return "gallery";
  if (pathname.startsWith("/upload"))  return "upload";
  return "dashboard";
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
        {NAV_ITEMS.map(({ key, href, emoji }) => {
          const isActive = active === key;
          // Preserve ?child param for dashboard and gallery links
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
              <span className="text-xl leading-none">{emoji}</span>
              <span>{t(`nav.${key}`)}</span>
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
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const child = searchParams.get("child");

  return (
    <nav className="fixed left-0 top-0 bottom-0 z-40 w-56 hidden md:flex flex-col bg-white border-r border-[#f0ede9]">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 border-b border-[#f0ede9]">
        <span
          className="text-base font-bold text-[#2d1f14] tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {locale === "he" ? "קידז קריאציונס" : "Kidz Creations"}
        </span>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-4 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ key, href, emoji }) => {
          const isActive = active === key;
          const to = (key === "dashboard" || key === "gallery") && child
            ? `${href}?child=${child}`
            : href;
          return (
            <Link
              key={key}
              href={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#fff1ed] text-[#ff7657]"
                  : "text-[#5c4a38] hover:bg-[#f5f0eb]"
              }`}
            >
              <span className="text-xl w-7 text-center">{emoji}</span>
              <span>{t(`nav.${key}`)}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#f0ede9]">
        <p className="text-xs text-[#c4b5a5]">FamilyVibe Labs</p>
      </div>
    </nav>
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
