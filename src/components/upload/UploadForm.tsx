"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Child } from "@/types/child";
import { useLocale } from "@/lib/i18n/LocaleContext";

// ── Confetti ─────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = [
  "#ff7657", "#fbbf24", "#0f9d8f", "#a78bfa",
  "#34d399", "#f472b6", "#60a5fa", "#fb923c",
];

function Confetti() {
  const particles = useMemo(() =>
    Array.from({ length: 36 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: 5 + Math.floor(i * 2.5) % 90,
      delay: (i * 0.05) % 0.8,
      size: 7 + (i % 5),
      round: i % 3 !== 0,
    })),
  []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-16px",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? "50%" : "2px",
            animationName: "confettiFall",
            animationDuration: `${1.4 + (p.id % 7) * 0.12}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            animationFillMode: "forwards",
          }}
        />
      ))}
    </div>
  );
}

// ── Drop zone SVG illustration ────────────────────────────────────────────────
function ArtIllustration() {
  return (
    <svg width="96" height="80" viewBox="0 0 96 80" fill="none" aria-hidden>
      {/* Crayon 1 */}
      <rect x="14" y="22" width="10" height="36" rx="3" fill="#fbbf24" />
      <rect x="14" y="22" width="10" height="8"  rx="2" fill="#f59e0b" />
      <polygon points="14,58 24,58 19,68" fill="#fbbf24" />
      {/* Crayon 2 */}
      <rect x="32" y="16" width="10" height="36" rx="3" fill="#ff7657" />
      <rect x="32" y="16" width="10" height="8"  rx="2" fill="#ef4444" />
      <polygon points="32,52 42,52 37,62" fill="#ff7657" />
      {/* Crayon 3 */}
      <rect x="50" y="20" width="10" height="36" rx="3" fill="#0f9d8f" />
      <rect x="50" y="20" width="10" height="8"  rx="2" fill="#0d9488" />
      <polygon points="50,56 60,56 55,66" fill="#0f9d8f" />
      {/* Crayon 4 */}
      <rect x="68" y="26" width="10" height="30" rx="3" fill="#a78bfa" />
      <rect x="68" y="26" width="10" height="7"  rx="2" fill="#7c3aed" />
      <polygon points="68,56 78,56 73,66" fill="#a78bfa" />
      {/* Stars */}
      <circle cx="8"  cy="18" r="3" fill="#fbbf24" opacity="0.7" />
      <circle cx="88" cy="22" r="2" fill="#ff7657" opacity="0.6" />
      <circle cx="80" cy="60" r="2.5" fill="#0f9d8f" opacity="0.5" />
      <circle cx="4"  cy="56" r="2" fill="#a78bfa" opacity="0.6" />
    </svg>
  );
}

// ── Progress arc ──────────────────────────────────────────────────────────────
function ProgressRing({ value, max = 5 }: { value: number; max?: number }) {
  const count = Math.min(value, max);
  const pct = count / max;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <svg width="80" height="80" className="mx-auto">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#f0ede9" strokeWidth="6" />
      <circle
        cx="40" cy="40" r={r}
        fill="none"
        stroke={count >= max ? "#0f9d8f" : "#ff7657"}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 40 40)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="40" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill="#2d1f14">
        {count}
      </text>
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Phase =
  | { name: "idle" }
  | { name: "preview"; file: File; previewUrl: string }
  | { name: "uploading"; progress: number }
  | { name: "success"; artworksThisMonth: number; hasInsight: boolean }
  | { name: "error"; message: string };

interface UploadResponse {
  artworkId: string;
  artworksThisMonth: number;
  hasInsightThisMonth: boolean;
}

interface Props {
  children: Child[];
  defaultChildId: string;
  challengeId?: string;
  challengeTitle?: string;
}

// ── Main component ────────────────────────────────────────────────────────────
export function UploadForm({ children, defaultChildId, challengeId, challengeTitle }: Props) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(defaultChildId);
  const [title, setTitle] = useState("");
  const [generateState, setGenerateState] = useState<"idle" | "loading" | "done">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedChild = children.find((c) => c.id === selectedChildId) ?? children[0];
  const displayName = locale === "he" && selectedChild?.name_he
    ? selectedChild.name_he
    : selectedChild?.name ?? "";

  // ── File handling ───────────────────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setPhase({ name: "preview", file, previewUrl });
    setTitle("");
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // ── Upload via XHR (supports real progress) ─────────────────────────────────
  const handleUpload = () => {
    if (phase.name !== "preview") return;
    const { file } = phase;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("childId", selectedChildId);
    if (title.trim()) fd.append("title", title.trim());
    if (challengeId) fd.append("challengeId", challengeId);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setPhase({ name: "uploading", progress: Math.round((e.loaded / e.total) * 95) });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data: UploadResponse = JSON.parse(xhr.responseText);
        setPhase({
          name: "success",
          artworksThisMonth: data.artworksThisMonth,
          hasInsight: data.hasInsightThisMonth,
        });
      } else {
        let msg = t("upload.error");
        try { msg = JSON.parse(xhr.responseText).error || msg; } catch { /* */ }
        setPhase({ name: "error", message: msg });
      }
    };

    xhr.onerror = () => setPhase({ name: "error", message: t("upload.error") });

    xhr.open("POST", "/api/artworks/upload");
    xhr.send(fd);
    setPhase({ name: "uploading", progress: 0 });
  };

  // ── Generate report ─────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerateState("loading");
    const child = children.find((c) => c.id === selectedChildId);
    try {
      const res = await fetch("/api/insights/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: selectedChildId,
          childName: child?.name,
          locale,
        }),
      });
      if (res.ok || res.status === 422) {
        setGenerateState("done");
      } else {
        setGenerateState("idle");
      }
    } catch {
      setGenerateState("idle");
    }
  };

  const reset = () => {
    setPhase({ name: "idle" });
    setTitle("");
    setGenerateState("idle");
  };

  // ── Idle / Preview ──────────────────────────────────────────────────────────
  const isIdle = phase.name === "idle" || phase.name === "preview";

  return (
    <div className="max-w-md mx-auto">
      {/* Child selector */}
      {children.length > 1 && isIdle && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-[#9b8474] uppercase tracking-wide mb-2">
            {t("upload.chooseChild")}
          </p>
          <div className="flex gap-2 flex-wrap">
            {children.map((child) => {
              const name = locale === "he" && child.name_he ? child.name_he : child.name;
              const isSelected = child.id === selectedChildId;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-[#ff7657] text-white shadow-sm"
                      : "bg-[#f5f0eb] text-[#5c4a38] hover:bg-[#ede8e2]"
                  }`}
                >
                  <span>{child.avatar_emoji}</span>
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Drop zone (idle) ────────────────────────────────────────────────── */}
      {phase.name === "idle" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-200 py-12 px-6 text-center"
          style={{
            borderColor: isDragging ? "#ff7657" : "#d4c8bc",
            background: isDragging ? "#fff8f6" : "white",
            animation: isDragging ? "dropPulse 1s ease-in-out infinite" : undefined,
          }}
        >
          <ArtIllustration />
          <div>
            <p className="text-base font-bold text-[#2d1f14]">
              {locale === "en"
                ? `Add ${displayName}'s latest creation!`
                : `!הוסיפו את היצירה האחרונה של ${displayName}`}
            </p>
            <p className="text-sm text-[#9b8474] mt-1 hidden sm:block">{t("upload.dropHint")}</p>
            <p className="text-sm text-[#9b8474] mt-1 sm:hidden">{t("upload.tapHint")}</p>
            <p className="text-xs text-[#c4b5a5] mt-2">{t("upload.accept")}</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      )}

      {/* ── Preview ─────────────────────────────────────────────────────────── */}
      {phase.name === "preview" && (
        <div className="space-y-4">
          {/* Image preview */}
          <div className="relative rounded-2xl overflow-hidden bg-[#f0ede9]"
            style={{ aspectRatio: "4/3" }}>
            {phase.file.type.startsWith("video/") ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={phase.previewUrl}
                className="w-full h-full object-cover"
                controls={false}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={phase.previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
            <button
              onClick={reset}
              className="absolute top-2 end-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              aria-label="Remove"
            >
              ✕
            </button>
          </div>

          {/* Title field */}
          <div>
            <label className="block text-xs font-semibold text-[#9b8474] mb-1.5">
              {t("upload.titleLabel")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("upload.titlePlaceholder")}
              maxLength={80}
              className="w-full px-4 py-3 rounded-2xl border border-[#e0d8d0] bg-white text-sm text-[#2d1f14] placeholder-[#c4b5a5] focus:outline-none focus:border-[#ff7657] transition-colors"
            />
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #ff7657 0%, #ff9a7b 100%)" }}
          >
            {t("upload.submit")}
          </button>

          {/* Cancel */}
          <button
            onClick={reset}
            className="w-full py-2.5 text-sm text-[#9b8474] hover:text-[#5c4a38] transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Uploading ────────────────────────────────────────────────────────── */}
      {phase.name === "uploading" && (
        <div className="flex flex-col items-center gap-5 py-16">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#f0ede9" strokeWidth="5" />
              <circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke="#ff7657"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(phase.progress / 100) * 163} 163`}
                style={{ transition: "stroke-dasharray 0.2s ease" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#ff7657]">
              {phase.progress}%
            </span>
          </div>
          <p className="text-sm font-medium text-[#5c4a38]">{t("upload.uploading")}</p>
        </div>
      )}

      {/* ── Success ──────────────────────────────────────────────────────────── */}
      {phase.name === "success" && (
        <>
          <Confetti />
          <div
            className="space-y-4"
            style={{ animation: "successPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both" }}
          >
            {/* Hero message */}
            <div className="card text-center py-8">
              <div className="text-4xl mb-3">🎉</div>
              <h2
                className="text-lg font-bold text-[#2d1f14]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("upload.success.title", { name: displayName })}
              </h2>
            </div>

            {/* Progress toward report card */}
            <div className="card">
              <div className="flex items-center gap-4">
                <ProgressRing value={phase.artworksThisMonth} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#2d1f14]">
                    {t("upload.success.count", {
                      count: String(Math.min(phase.artworksThisMonth, 5)),
                    })}
                  </p>
                  {phase.artworksThisMonth < 5 ? (
                    <p className="text-xs text-[#9b8474] mt-0.5">
                      {t("upload.success.moreNeeded", {
                        more: String(5 - phase.artworksThisMonth),
                      })}
                    </p>
                  ) : (
                    <p className="text-xs text-[#0f9d8f] mt-0.5 font-medium">
                      {t("upload.success.allDone", {
                        count: String(phase.artworksThisMonth),
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Generate report CTA */}
            {phase.artworksThisMonth >= 5 && !phase.hasInsight && (
              <div
                className="card text-center py-5"
                style={{
                  background: "linear-gradient(135deg, #fff1ed 0%, #f0faf8 100%)",
                  border: "1.5px solid #fde8e2",
                }}
              >
                {generateState === "done" ? (
                  <>
                    <div className="text-2xl mb-2">✨</div>
                    <p className="text-sm font-medium text-[#0f9d8f]">
                      {t("upload.success.reportDone")}
                    </p>
                    <Link
                      href={`/dashboard?child=${selectedChildId}`}
                      className="mt-3 inline-block text-xs font-bold text-[#ff7657] hover:underline"
                    >
                      View Dashboard →
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-[#2d1f14] mb-3">
                      {t("upload.success.readyPrompt")}
                    </p>
                    <button
                      onClick={handleGenerate}
                      disabled={generateState === "loading"}
                      className="px-6 py-2.5 rounded-2xl text-sm font-bold text-white disabled:opacity-70 transition-all active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, #ff7657 0%, #0f9d8f 100%)",
                      }}
                    >
                      {generateState === "loading"
                        ? t("upload.success.generating")
                        : t("upload.success.generate")}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-[#f5f0eb] text-[#5c4a38] hover:bg-[#ede8e2] transition-colors"
              >
                {t("upload.success.addAnother")}
              </button>
              <Link
                href={`/gallery?child=${selectedChildId}`}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-center text-white"
                style={{ background: "linear-gradient(135deg, #ff7657, #ff9a7b)" }}
              >
                🎨 {t("nav.gallery")}
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {phase.name === "error" && (
        <div className="card text-center py-8 border border-[#fdd]" style={{ background: "#fff5f5" }}>
          <div className="text-3xl mb-3">😬</div>
          <p className="text-sm font-medium text-[#2d1f14] mb-4">{phase.message}</p>
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{ background: "#ff7657" }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
