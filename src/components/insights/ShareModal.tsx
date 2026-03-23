"use client";

import { useState, useEffect } from "react";
import type { Insight } from "@/types/insights";
import { useLocale, type Locale } from "@/lib/i18n/LocaleContext";

// ── Lookup tables ────────────────────────────────────────────────────────────

const INTEREST_EMOJI: Record<string, string> = {
  Animals: "🦁", "Animals & Nature": "🦁",
  "Family & People": "👨‍👩‍👧", Family: "👨‍👩‍👧",
  "Games & Adventure": "🎮",
  "Space & Planets": "🚀",
  "Fantasy & Magic": "🐉",
  "Technology & Robots": "🤖",
  "Ocean & Sea Creatures": "🐋",
  "Nature & Outdoors": "🌿",
  "Creative Exploration": "🎨",
};

const SENTIMENT_PALETTE: Record<string, { accent: string; light: string; emoji: string }> = {
  Joyful:     { accent: "#d97706", light: "#fffbeb", emoji: "☀️" },
  Calm:       { accent: "#3b82f6", light: "#eff6ff", emoji: "🌊" },
  Energetic:  { accent: "#ff7657", light: "#fff7ed", emoji: "⚡" },
  Expressive: { accent: "#16a34a", light: "#f0fdf4", emoji: "🌈" },
  Dreamy:     { accent: "#7c3aed", light: "#faf5ff", emoji: "🌙" },
  Curious:    { accent: "#0891b2", light: "#ecfeff", emoji: "🔭" },
  Bold:       { accent: "#e11d48", light: "#fff1f2", emoji: "🦁" },
  Warm:       { accent: "#ea580c", light: "#fff7ed", emoji: "🌻" },
  Playful:    { accent: "#059669", light: "#f0fdf4", emoji: "🐸" },
};
const DEFAULT_PALETTE = { accent: "#7c5cbf", light: "#faf5ff", emoji: "🎭" };

// ── Canvas utilities ─────────────────────────────────────────────────────────

async function loadFonts() {
  try {
    await Promise.all([
      document.fonts.load("700 72px Nunito"),
      document.fonts.load("400 36px Nunito"),
      document.fonts.load("700 72px Fraunces"),
    ]);
  } catch {
    /* use system font fallback */
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) {
        // last allowed line — absorb remaining words, truncate with ellipsis
        const rest = words.slice(words.indexOf(word)).join(" ");
        let truncated = rest;
        while (ctx.measureText(truncated + "…").width > maxWidth && truncated.length > 1) {
          truncated = truncated.slice(0, -1);
        }
        lines.push(truncated + "…");
        return lines;
      }
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

function shadow(ctx: CanvasRenderingContext2D, blur = 24, alpha = 0.10) {
  ctx.shadowColor = `rgba(45,31,20,${alpha})`;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = 4;
}
function clearShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

// ── Instagram card (1080 × 1350) ─────────────────────────────────────────────

function drawIGCard(
  ctx: CanvasRenderingContext2D,
  insight: Insight,
  childName: string,
  artworkCount: number,
  locale: Locale
) {
  const W = 1080, H = 1350;
  const M = 64; // horizontal margin
  const CW = W - M * 2; // content width = 952
  const CX = W / 2; // center X

  const pal = SENTIMENT_PALETTE[insight.sentiment] ?? DEFAULT_PALETTE;
  const interestEmoji = INTEREST_EMOJI[insight.top_interest] ?? "🎨";
  const subjects = Object.entries(insight.thematic_focus?.subjects ?? {}).sort((a, b) => b[1] - a[1]);
  const topPct = subjects[0] ? Math.round(subjects[0][1] * 100) : 0;

  ctx.direction = locale === "he" ? "rtl" : "ltr";

  // ── Background ──────────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0,   "#fff4f0");
  bg.addColorStop(0.45, "#fdf8f4");
  bg.addColorStop(1,   "#f0faf8");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Top accent bar ──────────────────────────────────────────────────────
  const accentBar = ctx.createLinearGradient(0, 0, W, 0);
  accentBar.addColorStop(0, "#ff7657");
  accentBar.addColorStop(1, "#fbbf24");
  ctx.fillStyle = accentBar;
  ctx.fillRect(0, 0, W, 10);

  // ── Branding header ─────────────────────────────────────────────────────
  ctx.textAlign = "center";
  ctx.fillStyle = "#c4b5a5";
  ctx.font = "600 26px 'Nunito', Arial, sans-serif";
  ctx.fillText("🎨 Kidz Creations", CX, 58);

  // ── Hero: emoji + name + period ─────────────────────────────────────────
  ctx.font = "96px Arial, sans-serif"; // emoji-only line
  ctx.fillStyle = "#2d1f14";
  ctx.fillText(interestEmoji, CX, 185);

  ctx.font = "700 76px 'Fraunces', 'Nunito', Georgia, serif";
  ctx.fillStyle = "#2d1f14";
  // Truncate name + apostrophe if too wide
  const nameText = locale === "he" ? childName : `${childName}'s`;
  ctx.fillText(nameText, CX, 280);

  ctx.font = "600 34px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "#9b8474";
  ctx.fillText(
    locale === "he" ? "דוח צמיחה יצירתית" : "Creative Growth Report",
    CX, 330
  );

  ctx.font = "500 28px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "#c4b5a5";
  ctx.fillText(insight.analysis_period, CX, 368);

  // ── Separator ───────────────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(45,31,20,0.10)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(M + 80, 400);
  ctx.lineTo(W - M - 80, 400);
  ctx.stroke();

  // ── Obsession card ──────────────────────────────────────────────────────
  const OY = 420, OH = 300;
  shadow(ctx);
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.beginPath();
  ctx.roundRect(M, OY, CW, OH, 36);
  ctx.fill();
  clearShadow(ctx);
  ctx.strokeStyle = "rgba(45,31,20,0.06)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "700 20px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "#9b8474";
  ctx.letterSpacing = "2px";
  ctx.fillText(
    locale === "he" ? "האובססיה של החודש" : "ARTIST'S OBSESSION",
    CX, OY + 48
  );
  ctx.letterSpacing = "0px";

  ctx.font = "80px Arial, sans-serif";
  ctx.fillText(interestEmoji, CX, OY + 148);

  ctx.font = "700 54px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = pal.accent;
  const interestLabel = locale === "he"
    ? interestHe(insight.top_interest)
    : insight.top_interest;
  ctx.fillText(interestLabel, CX, OY + 214);

  // Progress bar
  const barX = M + 80, barY = OY + 246, barW = CW - 160, barH = 14;
  ctx.fillStyle = "rgba(45,31,20,0.08)";
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 7);
  ctx.fill();
  const barFill = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  barFill.addColorStop(0, pal.accent);
  barFill.addColorStop(1, "#fbbf24");
  ctx.fillStyle = barFill;
  ctx.beginPath();
  ctx.roundRect(barX, barY, Math.round(barW * topPct / 100), barH, 7);
  ctx.fill();

  ctx.font = "600 28px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "#9b8474";
  ctx.fillText(
    locale === "he" ? `${topPct}% מהיצירות החודש` : `${topPct}% of artwork this month`,
    CX, OY + 290
  );

  // ── Milestone card ──────────────────────────────────────────────────────
  const MY = OY + OH + 40, MH = 280;
  shadow(ctx);
  ctx.fillStyle = pal.light;
  ctx.beginPath();
  ctx.roundRect(M, MY, CW, MH, 36);
  ctx.fill();
  clearShadow(ctx);
  ctx.strokeStyle = "rgba(45,31,20,0.06)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "700 20px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = pal.accent;
  ctx.letterSpacing = "2px";
  ctx.fillText(
    locale === "he" ? `🏆  רגע של הישג` : "🏆  MILESTONE MOMENT",
    CX, MY + 52
  );
  ctx.letterSpacing = "0px";

  ctx.font = "500 32px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "#2d1f14";
  const mLines = wrapText(ctx, insight.milestone_detected, CW - 100, 3);
  const lineH = 48;
  const mStartY = MY + 100;
  mLines.forEach((line, i) => ctx.fillText(line, CX, mStartY + i * lineH));

  // ── Stats row ────────────────────────────────────────────────────────────
  const SY = MY + MH + 40;
  const cardW = (CW - 20) / 2;
  const statH = 130;

  for (let i = 0; i < 2; i++) {
    const sx = M + i * (cardW + 20);
    shadow(ctx, 16, 0.07);
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.beginPath();
    ctx.roundRect(sx, SY, cardW, statH, 28);
    ctx.fill();
    clearShadow(ctx);
    ctx.strokeStyle = "rgba(45,31,20,0.06)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.font = "700 18px 'Nunito', Arial, sans-serif";
    ctx.fillStyle = "#9b8474";
    ctx.letterSpacing = "2px";
    const label = i === 0
      ? (locale === "he" ? "מצב רוח" : "MOOD")
      : (locale === "he" ? "יצירות" : "ARTWORKS");
    ctx.fillText(label, sx + cardW / 2, SY + 38);
    ctx.letterSpacing = "0px";

    ctx.font = "700 40px 'Nunito', Arial, sans-serif";
    ctx.fillStyle = "#2d1f14";
    const val = i === 0
      ? `${pal.emoji} ${locale === "he" ? sentimentHe(insight.sentiment) : insight.sentiment}`
      : `${artworkCount}`;
    ctx.fillText(val, sx + cardW / 2, SY + 98);
  }

  // ── Tags row ─────────────────────────────────────────────────────────────
  const TY = SY + statH + 36;
  const tags = insight.tags.slice(0, 5);
  drawTagPills(ctx, tags, CX, TY, pal.accent);

  // ── Footer ───────────────────────────────────────────────────────────────
  const FY = H - 150;
  ctx.strokeStyle = "rgba(45,31,20,0.10)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(M + 60, FY);
  ctx.lineTo(W - M - 60, FY);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "600 28px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "#9b8474";
  ctx.fillText("Made with ❤️ Kidz Creations", CX, FY + 56);

  ctx.font = "500 24px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "#c4b5a5";
  ctx.fillText("kidzcreations.app", CX, FY + 96);
}

function drawTagPills(
  ctx: CanvasRenderingContext2D,
  tags: string[],
  centerX: number,
  y: number,
  accentColor: string
) {
  ctx.font = "600 22px 'Nunito', Arial, sans-serif";
  const pillH = 46, pillPadX = 24, gap = 12;
  const widths = tags.map((t) => ctx.measureText(t.replace(/_/g, " ")).width + pillPadX * 2);
  const totalW = widths.reduce((a, b) => a + b, 0) + gap * (tags.length - 1);
  let x = centerX - totalW / 2;

  for (let i = 0; i < tags.length; i++) {
    const label = tags[i].replace(/_/g, " ");
    const pw = widths[i];
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.beginPath();
    ctx.roundRect(x, y, pw, pillH, pillH / 2);
    ctx.fill();
    ctx.strokeStyle = accentColor + "44";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = accentColor;
    ctx.textAlign = "left";
    ctx.fillText(label, x + pillPadX, y + 31);
    x += pw + gap;
  }
  ctx.textAlign = "center";
}

// ── WhatsApp OG card (1200 × 630) ────────────────────────────────────────────

function drawOGCard(
  ctx: CanvasRenderingContext2D,
  insight: Insight,
  childName: string,
  artworkCount: number,
  locale: Locale
) {
  const W = 1200, H = 630;
  const pal = SENTIMENT_PALETTE[insight.sentiment] ?? DEFAULT_PALETTE;
  const interestEmoji = INTEREST_EMOJI[insight.top_interest] ?? "🎨";
  const subjects = Object.entries(insight.thematic_focus?.subjects ?? {}).sort((a, b) => b[1] - a[1]);
  const topPct = subjects[0] ? Math.round(subjects[0][1] * 100) : 0;

  ctx.direction = locale === "he" ? "rtl" : "ltr";

  // Left panel — gradient
  const leftW = 440;
  const lgBg = ctx.createLinearGradient(0, 0, leftW, H);
  lgBg.addColorStop(0, pal.accent + "ee");
  lgBg.addColorStop(1, pal.accent + "99");
  ctx.fillStyle = lgBg;
  ctx.fillRect(0, 0, leftW, H);

  // Left panel content — centered
  ctx.textAlign = "center";
  const LCX = leftW / 2;

  ctx.font = "80px Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(interestEmoji, LCX, 200);

  ctx.font = "700 56px 'Fraunces', Georgia, serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(locale === "he" ? childName : `${childName}'s`, LCX, 300);

  ctx.font = "600 28px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.80)";
  ctx.fillText(locale === "he" ? "דוח צמיחה יצירתית" : "Creative Growth Report", LCX, 346);

  ctx.font = "500 24px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText(insight.analysis_period, LCX, 383);

  // Branding at bottom of left panel
  ctx.font = "500 22px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText("kidzcreations.app", LCX, 570);

  // Right panel — cream
  const RX = leftW + 4; // 4px divider
  ctx.fillStyle = "#fdf8f4";
  ctx.fillRect(RX, 0, W - RX, H);

  // Accent divider
  ctx.fillStyle = pal.accent;
  ctx.fillRect(leftW, 0, 4, H);

  const RM = 50;
  const RCX = RX + (W - RX) / 2;
  const RCW = W - RX - RM * 2;

  ctx.textAlign = "center";

  // Interest label
  ctx.font = "700 22px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "#9b8474";
  ctx.letterSpacing = "2px";
  ctx.fillText(
    locale === "he" ? "האובססיה של החודש" : "ARTIST'S OBSESSION",
    RCX, 72
  );
  ctx.letterSpacing = "0px";

  ctx.font = "700 52px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = pal.accent;
  ctx.fillText(
    `${interestEmoji} ${locale === "he" ? interestHe(insight.top_interest) : insight.top_interest}`,
    RCX, 148
  );

  ctx.font = "500 28px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "#9b8474";
  ctx.fillText(
    locale === "he" ? `${topPct}% מהיצירות החודש` : `${topPct}% of artwork this month`,
    RCX, 192
  );

  // Divider
  ctx.strokeStyle = "rgba(45,31,20,0.10)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(RX + RM, 218);
  ctx.lineTo(W - RM, 218);
  ctx.stroke();

  // Milestone text
  ctx.font = "500 29px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "#2d1f14";
  const mLines = wrapText(ctx, insight.milestone_detected, RCW, 3);
  mLines.forEach((line, i) => ctx.fillText(line, RCX, 268 + i * 44));

  // Stats
  ctx.font = "700 26px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "#9b8474";
  ctx.fillText(
    `${pal.emoji} ${locale === "he" ? sentimentHe(insight.sentiment) : insight.sentiment}   🖼️ ${artworkCount} artworks`,
    RCX, 448
  );

  // Footer branding
  ctx.font = "500 22px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "#c4b5a5";
  ctx.fillText("Made with ❤️ Kidz Creations", RCX, 530);

  ctx.font = "500 20px 'Nunito', Arial, sans-serif";
  ctx.fillStyle = "#d6ccc4";
  ctx.fillText("kidzcreations.app", RCX, 566);
}

// ── Simple Hebrew lookup helpers (avoid importing all of he.json) ─────────────

function interestHe(en: string): string {
  const map: Record<string, string> = {
    "Animals & Nature": "בעלי חיים וטבע",
    "Animals": "בעלי חיים",
    "Family & People": "משפחה ואנשים",
    "Games & Adventure": "משחקים והרפתקאות",
    "Space & Planets": "חלל וכוכבי לכת",
    "Fantasy & Magic": "פנטזיה וקסם",
    "Technology & Robots": "טכנולוגיה ורובוטים",
    "Ocean & Sea Creatures": "ים ויצורים ימיים",
    "Nature & Outdoors": "טבע וחוץ",
    "Creative Exploration": "חקר יצירתי",
  };
  return map[en] ?? en;
}

function sentimentHe(en: string): string {
  const map: Record<string, string> = {
    Joyful: "שמח", Calm: "רגוע", Energetic: "אנרגטי",
    Expressive: "ביטויי", Dreamy: "חלומי", Curious: "סקרן",
    Bold: "נועז", Warm: "חמים", Playful: "שובבני",
  };
  return map[en] ?? en;
}

// ── Card generation ──────────────────────────────────────────────────────────

async function generateCard(
  format: "instagram" | "og",
  insight: Insight,
  childName: string,
  artworkCount: number,
  locale: Locale
): Promise<{ blob: Blob; url: string }> {
  const W = format === "instagram" ? 1080 : 1200;
  const H = format === "instagram" ? 1350 : 630;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  await loadFonts();

  if (format === "instagram") {
    drawIGCard(ctx, insight, childName, artworkCount, locale);
  } else {
    drawOGCard(ctx, insight, childName, artworkCount, locale);
  }

  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png")
  );
  return { blob, url: URL.createObjectURL(blob) };
}

// ── ShareModal component ──────────────────────────────────────────────────────

interface ShareModalProps {
  insight: Insight;
  childName: string;
  artworkCount: number;
  onClose: () => void;
}

export function ShareModal({ insight, childName, artworkCount, onClose }: ShareModalProps) {
  const { locale } = useLocale();
  const [igCard, setIgCard] = useState<{ blob: Blob; url: string } | null>(null);
  const [ogCard, setOgCard] = useState<{ blob: Blob; url: string } | null>(null);
  const [generating, setGenerating] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"instagram" | "og">("instagram");

  useEffect(() => {
    Promise.all([
      generateCard("instagram", insight, childName, artworkCount, locale),
      generateCard("og", insight, childName, artworkCount, locale),
    ]).then(([ig, og]) => {
      setIgCard(ig);
      setOgCard(og);
      setGenerating(false);
    });
    return () => {
      igCard && URL.revokeObjectURL(igCard.url);
      ogCard && URL.revokeObjectURL(ogCard.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCard = activeTab === "instagram" ? igCard : ogCard;
  const filename = `kidz-creations-${childName.toLowerCase()}-${insight.analysis_period.replace(" ", "-").toLowerCase()}.png`;

  const shareText =
    locale === "he"
      ? `${childName} היה/ה אובססיבי/ת ל${interestHe(insight.top_interest)} החודש! 🎨 ראו את דוח הצמיחה היצירתית שלהם ב-Kidz Creations: kidzcreations.app`
      : `${childName} has been obsessed with ${insight.top_interest} this month! 🎨 See their Creative Growth Report on Kidz Creations: kidzcreations.app`;

  const handleNativeShare = async () => {
    if (!activeCard) return;
    const file = new File([activeCard.blob], filename, { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
      } else {
        await navigator.share({ text: shareText });
      }
    } catch {
      /* user cancelled */
    }
  };

  const handleDownload = () => {
    if (!activeCard) return;
    const a = document.createElement("a");
    a.href = activeCard.url;
    a.download = filename;
    a.click();
  };

  const handleCopy = async () => {
    if (!activeCard) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": activeCard.blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ClipboardItem not supported — fall back to copying text
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#f5f0eb]">
          <div>
            <h3 className="text-lg font-bold text-[#2d1f14]" style={{ fontFamily: "var(--font-display)" }}>
              Share Report
            </h3>
            <p className="text-xs text-[#9b8474] mt-0.5">
              {locale === "he" ? "שתפו עם גאווה" : "Share with pride ✨"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f5f0eb] flex items-center justify-center hover:bg-[#ede8e2] transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4 text-[#5c4a38]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Format tabs */}
        <div className="flex gap-1 mx-6 mt-4 p-1 bg-[#f5f0eb] rounded-xl">
          {(["instagram", "og"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === tab
                  ? "bg-white text-[#2d1f14] shadow-sm"
                  : "text-[#9b8474]"
              }`}
            >
              {tab === "instagram" ? "Instagram (4:5)" : "WhatsApp (OG)"}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="mx-6 mt-4 rounded-2xl overflow-hidden bg-[#f5f0eb] flex items-center justify-center"
          style={{ aspectRatio: activeTab === "instagram" ? "4/5" : "1.91/1" }}
        >
          {generating || !activeCard ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <svg className="animate-spin w-8 h-8 text-[#ff7657]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-xs text-[#9b8474]">
                {locale === "he" ? "מייצר כרטיס..." : "Generating card…"}
              </p>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeCard.url}
              alt="Share card preview"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 pt-4 space-y-3">
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              disabled={generating}
              className="w-full py-3 rounded-2xl text-white font-bold text-sm transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(90deg, #ff7657, #fbbf24)" }}
            >
              {locale === "he" ? "שתף" : "Share"} ↗
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={generating}
              className="flex-1 py-2.5 rounded-xl border border-[#f0ede9] text-[#5c4a38] text-sm font-semibold hover:bg-[#fdf8f4] transition-colors disabled:opacity-50"
            >
              ⬇ {locale === "he" ? "הורד" : "Download"}
            </button>
            <button
              onClick={handleCopy}
              disabled={generating}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all disabled:opacity-50 ${
                copied
                  ? "border-[#d1fae5] bg-[#d1fae5] text-[#065f46]"
                  : "border-[#f0ede9] text-[#5c4a38] hover:bg-[#fdf8f4]"
              }`}
            >
              {copied
                ? `✓ ${locale === "he" ? "הועתק" : "Copied!"}`
                : `⧉ ${locale === "he" ? "העתק" : "Copy"}`}
            </button>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#dcfce7] bg-[#f0fdf4] text-[#15803d] text-sm font-semibold hover:bg-[#dcfce7] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>

          {!canNativeShare && (
            <p className="text-center text-xs text-[#9b8474]">
              {locale === "he"
                ? "הורידו את התמונה ושתפו בסטורי של אינסטגרם ✨"
                : "Download and share to Instagram Stories ✨"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
