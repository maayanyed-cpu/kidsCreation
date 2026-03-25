"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

// ── Background collage — scattered children's artwork at low opacity ──────────
function ArtCollageBackground() {
  // Positioned artwork "elements" rendered as colorful abstract shapes + emoji
  // to evoke a wall of children's drawings without loading external images
  const items = [
    { emoji: "🌈", x: "5%",  y: "8%",  rotate: -12, size: 48, opacity: 0.12 },
    { emoji: "🏠", x: "82%", y: "5%",  rotate: 8,   size: 40, opacity: 0.10 },
    { emoji: "🌻", x: "15%", y: "75%", rotate: -5,  size: 44, opacity: 0.11 },
    { emoji: "🦋", x: "90%", y: "70%", rotate: 15,  size: 36, opacity: 0.13 },
    { emoji: "⭐", x: "70%", y: "20%", rotate: -20, size: 32, opacity: 0.09 },
    { emoji: "🐱", x: "8%",  y: "40%", rotate: 10,  size: 42, opacity: 0.10 },
    { emoji: "🌸", x: "45%", y: "85%", rotate: -8,  size: 38, opacity: 0.12 },
    { emoji: "🚀", x: "75%", y: "45%", rotate: 22,  size: 34, opacity: 0.08 },
    { emoji: "🎨", x: "30%", y: "12%", rotate: -15, size: 46, opacity: 0.11 },
    { emoji: "🐶", x: "55%", y: "92%", rotate: 5,   size: 40, opacity: 0.10 },
    { emoji: "☀️", x: "92%", y: "35%", rotate: -10, size: 50, opacity: 0.09 },
    { emoji: "🌊", x: "20%", y: "55%", rotate: 12,  size: 36, opacity: 0.08 },
    { emoji: "🦁", x: "60%", y: "15%", rotate: -18, size: 38, opacity: 0.10 },
    { emoji: "❤️", x: "40%", y: "60%", rotate: 8,   size: 30, opacity: 0.11 },
    { emoji: "🎵", x: "85%", y: "85%", rotate: -6,  size: 34, opacity: 0.09 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {/* Soft colored crayon-like strokes */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 300px 200px at 10% 20%, rgba(255,182,193,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 250px 250px at 85% 15%, rgba(173,216,230,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 350px 180px at 20% 80%, rgba(255,218,185,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 200px 300px at 80% 75%, rgba(221,160,221,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 280px 220px at 50% 50%, rgba(144,238,144,0.05) 0%, transparent 70%)
          `,
        }}
      />
      {/* Scattered artwork emoji */}
      {items.map((item, i) => (
        <span
          key={i}
          className="absolute select-none"
          style={{
            left: item.x,
            top: item.y,
            fontSize: item.size,
            opacity: item.opacity,
            transform: `rotate(${item.rotate}deg)`,
            filter: "blur(0.5px)",
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [locale, setLocale] = useState<"en" | "he">("en");

  const t = TRANSLATIONS[locale];
  const isDev = process.env.NODE_ENV !== "production";

  async function handleProvider(provider: string) {
    setLoading(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading("email");
    await signIn("resend", { email, redirect: false, callbackUrl: "/dashboard" });
    setEmailSent(true);
    setLoading(null);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 50%, #f0faf8 100%)" }}
    >
      <ArtCollageBackground />

      {/* Language toggle */}
      <button
        onClick={() => setLocale(locale === "en" ? "he" : "en")}
        className="fixed top-4 end-4 text-xs font-medium text-[#9b8474] hover:text-[#5c4a38] transition-colors z-10"
      >
        {locale === "en" ? "עברית" : "English"}
      </button>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo / wordmark */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎨</div>
          <h1
            className="text-2xl font-bold text-[#2d1f14]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-[#9b8474] leading-relaxed max-w-xs mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl bg-white/95 backdrop-blur-sm p-6 relative"
          style={{
            boxShadow:
              "0 2px 4px rgba(45,31,20,0.06), 0 8px 32px rgba(45,31,20,0.08)",
          }}
          dir={locale === "he" ? "rtl" : "ltr"}
        >
          {/* Security badge */}
          <div
            className="absolute -top-3 inset-x-0 flex justify-center"
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: "linear-gradient(135deg, #f0fdf4, #ecfeff)",
                color: "#15803d",
                border: "1px solid #bbf7d0",
                boxShadow: "0 2px 8px rgba(34,197,94,0.12)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              {t.badge}
            </span>
          </div>

          {emailSent ? (
            <div className="text-center py-4 mt-2">
              <div className="text-3xl mb-3">✉️</div>
              <p className="font-semibold text-[#2d1f14]">{t.checkEmail}</p>
              <p className="text-sm text-[#9b8474] mt-1">{t.checkEmailSub}</p>
            </div>
          ) : (
            <div className="mt-3">
              {/* Google */}
              <button
                onClick={() => handleProvider("google")}
                disabled={!!loading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#e8e0d8] bg-white py-3 px-4 text-sm font-medium text-[#2d1f14] hover:bg-[#fdf8f4] transition-colors disabled:opacity-60"
              >
                {loading === "google" ? <span className="text-base">⏳</span> : <GoogleIcon />}
                {t.continueGoogle}
              </button>

              {/* Apple */}
              <button
                onClick={() => handleProvider("apple")}
                disabled={!!loading}
                className="mt-3 w-full flex items-center justify-center gap-3 rounded-2xl bg-[#1c1c1e] py-3 px-4 text-sm font-medium text-white hover:bg-[#2c2c2e] transition-colors disabled:opacity-60"
              >
                {loading === "apple" ? <span className="text-base">⏳</span> : <AppleIcon />}
                {t.continueApple}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#f0ede9]" />
                <span className="text-xs text-[#c4b5a8]">{t.or}</span>
                <div className="flex-1 h-px bg-[#f0ede9]" />
              </div>

              {/* Email magic link */}
              <form onSubmit={handleEmail} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  className="w-full rounded-2xl border border-[#e8e0d8] bg-[#fdf8f4] px-4 py-3 text-sm text-[#2d1f14] placeholder-[#c4b5a8] focus:border-[#e07b4a] focus:outline-none focus:ring-2 focus:ring-[#e07b4a]/20"
                />
                <button
                  type="submit"
                  disabled={!!loading || !email}
                  className="w-full rounded-2xl bg-[#e07b4a] py-3 text-sm font-semibold text-white hover:bg-[#c96b3a] transition-colors disabled:opacity-60"
                >
                  {loading === "email" ? t.sending : t.sendMagicLink}
                </button>
              </form>

              {/* Dev Login — only shown in development */}
              {isDev && (
                <>
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-[#f0ede9]" />
                    <span className="text-xs text-[#c4b5a8]">dev only</span>
                    <div className="flex-1 h-px bg-[#f0ede9]" />
                  </div>
                  <button
                    onClick={() => handleProvider("dev-login")}
                    disabled={!!loading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#e8e0d8] py-2.5 px-4 text-sm font-medium text-[#9b8474] hover:border-[#ff7657] hover:text-[#ff7657] transition-all disabled:opacity-60"
                  >
                    {loading === "dev-login" ? "⏳" : "🛠️"} Dev Login (Test Parent + 3 seeded kids)
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-[#c4b5a8] mt-6">{t.terms}</p>
      </div>
    </div>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="17" height="20" viewBox="0 0 17 20" fill="white">
      <path d="M13.948 10.506c-.022-2.246 1.839-3.332 1.924-3.386-1.052-1.533-2.684-1.743-3.263-1.764-1.386-.14-2.714.818-3.417.818-.712 0-1.796-.8-2.957-.778-1.508.022-2.909.877-3.686 2.226-1.577 2.732-.403 6.762 1.128 8.976.749 1.082 1.638 2.294 2.802 2.25 1.13-.045 1.556-.727 2.923-.727 1.358 0 1.751.727 2.94.703 1.213-.022 1.98-1.096 2.716-2.185a10.2 10.2 0 0 0 1.232-2.527c-.029-.013-2.36-.907-2.342-3.606zM11.7 3.47C12.31 2.727 12.72 1.69 12.607.63 11.713.672 10.62 1.24 9.985 1.965c-.57.644-1.069 1.708-.934 2.717.999.076 2.013-.508 2.649-1.212z" />
    </svg>
  );
}

// ── Translations ──────────────────────────────────────────────────────────────

const TRANSLATIONS = {
  en: {
    title: "Kidz Creations",
    subtitle: "Turn the pile of drawings into lifelong memories.",
    badge: "Protected Family Sanctuary",
    continueGoogle: "Continue with Google",
    continueApple: "Continue with Apple",
    or: "or",
    emailPlaceholder: "Enter your email",
    sendMagicLink: "Send magic link",
    sending: "Sending…",
    checkEmail: "Check your inbox",
    checkEmailSub: "We sent a sign-in link to your email.",
    terms: "By continuing you agree to our Terms & Privacy Policy.",
  },
  he: {
    title: "Kidz Creations",
    subtitle: "הפכו את ערימת הציורים לזיכרונות לכל החיים.",
    badge: "מרחב משפחתי מוגן",
    continueGoogle: "המשך עם Google",
    continueApple: "המשך עם Apple",
    or: "או",
    emailPlaceholder: "הכניסו את כתובת המייל",
    sendMagicLink: "שלח קישור כניסה",
    sending: "שולח…",
    checkEmail: "בדקו את תיבת הדואר",
    checkEmailSub: "שלחנו לכם קישור כניסה למייל.",
    terms: "בהמשך אתם מסכימים לתנאי השימוש ומדיניות הפרטיות.",
  },
};
