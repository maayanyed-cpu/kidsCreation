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

// ── Progress Ring ────────────────────────────────────────────────────────────
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
type CreationType = "drawing" | "singing" | "dancing";

const TYPE_CONFIG: Record<CreationType, { emoji: string; icon: string; label: string; desc: string; formats: string; accept: string }> = {
  drawing: {
    emoji: "🎨",
    icon: "🖍️🖌️🎨",
    label: "Drawing",
    desc: "Painting, sketch, craft photo",
    formats: "JPG · PNG · HEIC · up to 50 MB",
    accept: "image/jpeg,image/png,image/webp,image/heic,image/heif",
  },
  singing: {
    emoji: "🎤",
    icon: "🎵🎤🎶",
    label: "Singing",
    desc: "Song, melody, audio recording",
    formats: "MP3 · WAV · M4A · MP4 · up to 50 MB",
    accept: "audio/*,video/mp4",
  },
  dancing: {
    emoji: "💃",
    icon: "💃🎬🕺",
    label: "Dancing",
    desc: "Dance, performance, video clip",
    formats: "MP4 · MOV · up to 50 MB",
    accept: "video/mp4,video/quicktime",
  },
};

type Phase =
  | { name: "idle" }
  | { name: "preview"; file: File; previewUrl: string | null }
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
export function UploadForm({ children, defaultChildId, challengeId }: Props) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(defaultChildId);
  const [creationType, setCreationType] = useState<CreationType>("drawing");
  const [title, setTitle] = useState("");
  const [generateState, setGenerateState] = useState<"idle" | "loading" | "done">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedChild = children.find((c) => c.id === selectedChildId) ?? children[0];
  const displayName = locale === "he" && selectedChild?.name_he
    ? selectedChild.name_he
    : selectedChild?.name ?? "";
  const typeCfg = TYPE_CONFIG[creationType];

  // ── File handling ───────────────────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
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

  // ── Upload via XHR ─────────────────────────────────────────────────────────
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
        setPhase({ name: "success", artworksThisMonth: data.artworksThisMonth, hasInsight: data.hasInsightThisMonth });
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
        body: JSON.stringify({ childId: selectedChildId, childName: child?.name, locale }),
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

  const isIdle = phase.name === "idle" || phase.name === "preview";

  return (
    <>
      <style>{uploadCSS}</style>
      <div className="upload-root">
        {/* ── Kid Selector ── */}
        {children.length > 1 && isIdle && (
          <div className="u-section">
            <div className="u-label">Uploading for</div>
            <div className="kid-tabs">
              {children.map((child) => {
                const name = locale === "he" && child.name_he ? child.name_he : child.name;
                const isSelected = child.id === selectedChildId;
                return (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`kid-tab ${isSelected ? "active" : ""}`}
                  >
                    <span className="emoji">{child.avatar_emoji}</span> {name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Type Selector ── */}
        {phase.name === "idle" && (
          <div className="u-section">
            <div className="u-label">What type of creation?</div>
            <div className="type-grid">
              {(Object.keys(TYPE_CONFIG) as CreationType[]).map((type) => {
                const cfg = TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => setCreationType(type)}
                    className={`type-card ${creationType === type ? "selected" : ""}`}
                  >
                    <span className="type-emoji">{cfg.emoji}</span>
                    <h4>{cfg.label}</h4>
                    <p>{cfg.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Drop Zone (idle) ── */}
        {phase.name === "idle" && (
          <>
            <div className="section-divider" />
            <div
              className={`drop-zone ${isDragging ? "drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="dz-icon">{typeCfg.icon}</span>
              <h3>Add {displayName}&apos;s latest {typeCfg.label.toLowerCase()}!</h3>
              <p>Drop a photo or video here</p>
              <span className="formats">{typeCfg.formats}</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={typeCfg.accept}
              className="sr-only"
              onChange={handleFileInput}
            />
          </>
        )}

        {/* ── Preview ── */}
        {phase.name === "preview" && (
          <div className="u-section">
            {/* File preview card */}
            <div className="file-preview visible">
              <div className="fp-thumb">
                {phase.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={phase.previewUrl} alt="Preview" />
                ) : phase.file.type.startsWith("video/") ? (
                  "🎬"
                ) : phase.file.type.startsWith("audio/") ? (
                  "🎵"
                ) : (
                  "📄"
                )}
              </div>
              <div className="fp-info">
                <div className="fp-name">{phase.file.name}</div>
                <div className="fp-size">{(phase.file.size / 1024 / 1024).toFixed(1)} MB</div>
              </div>
              <button className="fp-remove" onClick={reset}>✕</button>
            </div>

            {/* Title field */}
            <div style={{ marginTop: 16 }}>
              <label className="u-label" style={{ marginBottom: 6 }}>
                {t("upload.titleLabel")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("upload.titlePlaceholder")}
                maxLength={80}
                className="form-input"
              />
            </div>

            {/* Actions */}
            <div className="upload-actions visible">
              <button className="btn-cancel" onClick={reset}>Cancel</button>
              <button className="btn-upload" onClick={handleUpload}>Upload Creation →</button>
            </div>
          </div>
        )}

        {/* ── Uploading ── */}
        {phase.name === "uploading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "64px 0" }}>
            <div style={{ position: "relative", width: 64, height: 64 }}>
              <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }} viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#f0ede9" strokeWidth="5" />
                <circle
                  cx="32" cy="32" r="26" fill="none" stroke="#ff7657" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${(phase.progress / 100) * 163} 163`}
                  style={{ transition: "stroke-dasharray 0.2s ease" }}
                />
              </svg>
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#ff7657" }}>
                {phase.progress}%
              </span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#5c4a38" }}>{t("upload.uploading")}</p>
          </div>
        )}

        {/* ── Success ── */}
        {phase.name === "success" && (
          <>
            <Confetti />
            <div style={{ animation: "successPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both" }}>
              <div className="card" style={{ textAlign: "center", padding: "32px 16px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#2d1f14" }}>
                  {t("upload.success.title", { name: displayName })}
                </h2>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <ProgressRing value={phase.artworksThisMonth} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#2d1f14" }}>
                      {t("upload.success.count", { count: String(Math.min(phase.artworksThisMonth, 5)) })}
                    </p>
                    {phase.artworksThisMonth < 5 ? (
                      <p style={{ fontSize: 12, color: "#9b8474", marginTop: 2 }}>
                        {t("upload.success.moreNeeded", { more: String(5 - phase.artworksThisMonth) })}
                      </p>
                    ) : (
                      <p style={{ fontSize: 12, color: "#0f9d8f", marginTop: 2, fontWeight: 500 }}>
                        {t("upload.success.allDone", { count: String(phase.artworksThisMonth) })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {phase.artworksThisMonth >= 5 && !phase.hasInsight && (
                <div className="card" style={{ marginTop: 16, textAlign: "center", padding: 20, background: "linear-gradient(135deg, #fff1ed 0%, #f0faf8 100%)", border: "1.5px solid #fde8e2" }}>
                  {generateState === "done" ? (
                    <>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>✨</div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#0f9d8f" }}>{t("upload.success.reportDone")}</p>
                      <Link href={`/dashboard?child=${selectedChildId}`} style={{ marginTop: 12, display: "inline-block", fontSize: 13, fontWeight: 700, color: "#ff7657" }}>
                        View Dashboard →
                      </Link>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#2d1f14", marginBottom: 12 }}>{t("upload.success.readyPrompt")}</p>
                      <button
                        onClick={handleGenerate}
                        disabled={generateState === "loading"}
                        className="btn-upload"
                        style={{ background: "linear-gradient(135deg, #ff7657 0%, #0f9d8f 100%)" }}
                      >
                        {generateState === "loading" ? t("upload.success.generating") : t("upload.success.generate")}
                      </button>
                    </>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button onClick={reset} className="btn-cancel" style={{ flex: 1 }}>
                  {t("upload.success.addAnother")}
                </button>
                <Link href={`/gallery?child=${selectedChildId}`} className="btn-upload" style={{ flex: 1, textAlign: "center" }}>
                  🎨 {t("nav.gallery")}
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ── Error ── */}
        {phase.name === "error" && (
          <div className="card" style={{ textAlign: "center", padding: 32, background: "#fff5f5", border: "1px solid #fdd" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>😬</div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#2d1f14", marginBottom: 16 }}>{phase.message}</p>
            <button onClick={reset} className="btn-upload">Try again</button>
          </div>
        )}
      </div>
    </>
  );
}

const uploadCSS = `
  .upload-root { max-width: 680px; margin: 0 auto; }
  .u-section { margin-bottom: 24px; }
  .u-label {
    font-size: 11px; font-weight: 700; color: #a89888;
    text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px;
  }

  .kid-tabs { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .kid-tab {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 18px; border-radius: 9999px;
    font-size: 14px; font-weight: 500; color: #7a6e62;
    border: 1px solid #e8e0d8; background: #fffdfb;
    transition: all 0.2s; cursor: pointer; font-family: inherit;
  }
  .kid-tab:hover { background: #f5f0eb; border-color: #d4c8bc; }
  .kid-tab.active {
    background: #f06449; color: #fff;
    border-color: transparent; box-shadow: 0 8px 24px rgba(240,100,73,0.15);
  }
  .kid-tab .emoji { font-size: 16px; }

  .type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .type-card {
    text-align: center; padding: 24px 14px;
    border: 2px solid #e8e0d8; border-radius: 20px;
    background: #fffdfb; cursor: pointer;
    transition: all 0.25s ease; position: relative;
    font-family: inherit;
  }
  .type-card:hover {
    border-color: #ffc9b8; transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(42,36,31,0.06);
  }
  .type-card.selected {
    border-color: #f06449; background: #fff5f2;
    box-shadow: 0 8px 24px rgba(240,100,73,0.15);
  }
  .type-card.selected::after {
    content: '✓'; position: absolute; top: 10px; right: 12px;
    width: 24px; height: 24px; border-radius: 50%;
    background: #f06449; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
  }
  .type-card .type-emoji { font-size: 40px; display: block; margin-bottom: 10px; }
  .type-card h4 { font-size: 16px; font-weight: 700; color: #2a241f; margin-bottom: 3px; }
  .type-card p { font-size: 13px; color: #a89888; line-height: 1.4; }

  .section-divider { height: 1px; background: #f5f0eb; margin: 0 0 24px; }

  .drop-zone {
    border: 2px dashed #d4c8bc; border-radius: 24px;
    padding: 56px 24px; text-align: center;
    background: #fffdfb; transition: all 0.3s ease; cursor: pointer;
  }
  .drop-zone:hover, .drop-zone.drag-over {
    border-color: #ff8566; background: #fff5f2;
    box-shadow: inset 0 0 0 2px rgba(240,100,73,0.05);
  }
  .drop-zone .dz-icon { font-size: 52px; margin-bottom: 16px; display: block; }
  .drop-zone h3 {
    font-family: var(--font-display);
    font-size: 20px; font-weight: 700; color: #2a241f; margin-bottom: 6px;
  }
  .drop-zone p { font-size: 14px; color: #a89888; margin-bottom: 6px; }
  .drop-zone .formats { font-size: 12px; color: #d4c8bc; letter-spacing: 0.3px; }

  .file-preview {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px;
    background: #fefcf8; border: 1px solid #f8ead0;
    border-radius: 16px;
  }
  .fp-thumb {
    width: 56px; height: 56px; border-radius: 12px;
    background: #f5f0eb; display: flex; align-items: center; justify-content: center;
    font-size: 28px; flex-shrink: 0; overflow: hidden;
  }
  .fp-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .fp-info { flex: 1; }
  .fp-name { font-size: 14px; font-weight: 600; color: #3d352e; }
  .fp-size { font-size: 12px; color: #a89888; }
  .fp-remove {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: #a89888; cursor: pointer;
    background: none; border: none; transition: all 0.2s; font-family: inherit;
  }
  .fp-remove:hover { background: #fee2e2; color: #e05252; }

  .upload-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
  .btn-cancel {
    padding: 10px 24px; border-radius: 9999px;
    font-size: 14px; font-weight: 600; color: #7a6e62;
    border: 1px solid #e8e0d8; background: #fffdfb;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
  }
  .btn-cancel:hover { background: #f5f0eb; }
  .btn-upload {
    padding: 10px 28px; border-radius: 9999px;
    font-size: 14px; font-weight: 600; color: #fff;
    background: #f06449; border: none;
    box-shadow: 0 8px 24px rgba(240,100,73,0.15);
    cursor: pointer; transition: all 0.25s; font-family: inherit;
  }
  .btn-upload:hover { background: #d94f36; transform: translateY(-1px); }
  .btn-upload:disabled { opacity: 0.7; }

  .form-input {
    width: 100%; padding: 11px 14px;
    border: 1px solid #e8e0d8; border-radius: 12px;
    font-size: 14px; color: #2a241f; outline: none;
    background: #fffdfb; transition: border-color 0.2s; font-family: inherit;
  }
  .form-input:focus { border-color: #ff8566; box-shadow: 0 0 0 3px rgba(240,100,73,0.08); }
  .form-input::placeholder { color: #d4c8bc; }

  .card {
    background: #fffdfb; border: 1px solid #e8e0d8;
    border-radius: 24px; padding: 24px;
    box-shadow: 0 1px 3px rgba(42,36,31,0.04);
  }

  @media(max-width: 640px) {
    .type-grid { grid-template-columns: 1fr; }
  }
`;
