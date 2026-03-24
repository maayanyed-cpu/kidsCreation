"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// ── Constants ─────────────────────────────────────────────────────────────────

const EMOJI_OPTIONS = [
  "🦁", "🐶", "🐱", "🦊", "🐻", "🐼",
  "🐨", "🐯", "🦄", "🦋", "🐸", "🦀",
  "🐙", "🦓", "🐘", "🦒", "🦕", "🦖",
  "🌟", "⭐", "🌈", "🌸", "🎨", "🚀",
];

const CONFETTI_COLORS = [
  "#ff7657", "#fbbf24", "#0f9d8f", "#a78bfa",
  "#34d399", "#f472b6", "#60a5fa", "#fb923c",
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChildDraft {
  name: string;
  name_he: string;
  avatarEmoji: string;
  dateOfBirth: string;
}

type UploadPhase = "idle" | "preview" | "uploading" | "success" | "error";

interface Props {
  userId: string;
  initialName?: string;
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === step ? "28px" : "8px",
            height: "8px",
            background:
              i === step ? "#ff7657" : i < step ? "#fbbf24" : "#e8e0d8",
          }}
        />
      ))}
    </div>
  );
}

function EmojiGrid({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (e: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {EMOJI_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
          style={{
            background:
              selected === emoji ? "rgba(255,118,87,0.15)" : "#fdf8f4",
            outline: selected === emoji ? "2px solid #ff7657" : "none",
            transform: selected === emoji ? "scale(1.12)" : "scale(1)",
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        left: 5 + Math.floor(i * 2.5) % 90,
        delay: (i * 0.05) % 0.8,
        size: 7 + (i % 5),
        round: i % 3 !== 0,
      })),
    []
  );
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

// ── Main wizard ───────────────────────────────────────────────────────────────

export function OnboardingWizard({ userId, initialName = "" }: Props) {
  const router = useRouter();
  const { update } = useSession();

  // ── Wizard meta-state ──────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState<"forward" | "back">("forward");

  // ── Step 1 state ───────────────────────────────────────────────────────────
  const [parentName, setParentName] = useState(initialName);
  const [locale, setLocale] = useState<"en" | "he">("en");

  // ── Step 2 state ───────────────────────────────────────────────────────────
  const [savedChildren, setSavedChildren] = useState<ChildDraft[]>([]);
  const [formOpen, setFormOpen] = useState(true);
  const [childName, setChildName] = useState("");
  const [childNameHe, setChildNameHe] = useState("");
  const [childDob, setChildDob] = useState("");
  const [childEmoji, setChildEmoji] = useState("🦁");

  // ── Step 2→3 transition ────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [firstChildId, setFirstChildId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // ── Step 3 upload state ────────────────────────────────────────────────────
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const he = locale === "he";

  function advance() {
    setDir("forward");
    setStep((s) => s + 1);
    setError("");
  }

  function retreat() {
    setDir("back");
    setStep((s) => s - 1);
    setError("");
  }

  function saveCurrentChild() {
    if (!childName.trim()) return;
    setSavedChildren((prev) => [
      ...prev,
      {
        name: childName.trim(),
        name_he: childNameHe.trim(),
        avatarEmoji: childEmoji,
        dateOfBirth: childDob,
      },
    ]);
    setChildName("");
    setChildNameHe("");
    setChildDob("");
    setChildEmoji("🦁");
    setFormOpen(false);
  }

  // ── Step 2 → Step 3: save everything ──────────────────────────────────────
  async function handleCompleteSetup() {
    // Auto-save open form if it has a name
    let allChildren = [...savedChildren];
    if (formOpen && childName.trim()) {
      allChildren = [
        ...allChildren,
        {
          name: childName.trim(),
          name_he: childNameHe.trim(),
          avatarEmoji: childEmoji,
          dateOfBirth: childDob,
        },
      ];
    }
    if (allChildren.length === 0) {
      setError(
        he ? "הוסיפו לפחות ילד/ה אחת/ד להמשך" : "Add at least one child to continue"
      );
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, parentName, locale, children: allChildren }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Something went wrong");
      }
      const data = await res.json();
      setFirstChildId(data.firstChildId);
      // Refresh JWT so middleware sees onboarding_complete = true
      await update({ onboarding_complete: true, locale });
      advance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // ── Upload helpers ─────────────────────────────────────────────────────────
  function pickFile(file: File) {
    setPreviewUrl(URL.createObjectURL(file));
    setUploadFile(file);
    setUploadPhase("preview");
  }

  function startUpload() {
    if (!uploadFile || !firstChildId) return;
    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("childId", firstChildId);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        setUploadProgress(Math.round((e.loaded / e.total) * 95));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadPhase("success");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      } else {
        setUploadPhase("error");
      }
    };
    xhr.onerror = () => setUploadPhase("error");
    xhr.open("POST", "/api/artworks/upload");
    xhr.send(fd);
    setUploadPhase("uploading");
    setUploadProgress(0);
  }

  function goToDashboard() {
    router.push(`/dashboard${firstChildId ? `?child=${firstChildId}` : ""}`);
  }

  // ── Animation style ────────────────────────────────────────────────────────
  const anim: React.CSSProperties = {
    animation: `${dir === "forward" ? "slideInRight" : "slideInLeft"} 0.28s ease-out both`,
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <ProgressDots step={step} />

      {/* ━━━━━━━━━━━━━━━━━━━ STEP 1: ABOUT YOU ━━━━━━━━━━━━━━━━━━━ */}
      {step === 1 && (
        <div style={anim}>
          <h2
            className="text-lg font-bold text-[#2d1f14] mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {he ? "קצת עליכם" : "About you"}
          </h2>
          <p className="text-sm text-[#9b8474] mb-6">
            {he ? "איך נקרא לכם?" : "How should we greet you?"}
          </p>

          <div className="space-y-5">
            {/* Parent name */}
            <div>
              <label className="block text-xs font-semibold text-[#5c4a38] mb-1.5">
                {he ? "שמכם" : "Your name"}
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder={he ? "איך לפנות אליכם?" : "What should we call you?"}
                autoFocus
                dir={he ? "rtl" : "ltr"}
                className="w-full rounded-2xl border border-[#e8e0d8] bg-[#fdf8f4] px-4 py-3 text-sm text-[#2d1f14] placeholder-[#c4b5a8] focus:border-[#ff7657] focus:outline-none focus:ring-2 focus:ring-[#ff7657]/20"
              />
            </div>

            {/* Language picker */}
            <div>
              <label className="block text-xs font-semibold text-[#5c4a38] mb-2">
                {he ? "שפה מועדפת" : "Preferred language"}
              </label>
              <div className="flex gap-2">
                {(["en", "he"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLocale(lang)}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                    style={{
                      background: locale === lang ? "#ff7657" : "#f5f0eb",
                      color: locale === lang ? "white" : "#5c4a38",
                    }}
                  >
                    {lang === "en" ? "🇺🇸 English" : "🇮🇱 עברית"}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={advance}
              disabled={!parentName.trim()}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #ff7657, #ff9a7b)" }}
            >
              {he ? "המשך ←" : "Continue →"}
            </button>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━ STEP 2: ADD YOUR KIDS ━━━━━━━━━━━━━━━━━━━ */}
      {step === 2 && (
        <div style={anim} dir={he ? "rtl" : "ltr"}>
          <h2
            className="text-lg font-bold text-[#2d1f14] mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {he ? "הוסיפו את הילדים שלכם" : "Add your kids"}
          </h2>
          <p className="text-sm text-[#9b8474] mb-5">
            {he ? "תוכלו להוסיף עוד בכל עת" : "You can always add more later"}
          </p>

          {/* Saved children list */}
          {savedChildren.length > 0 && (
            <div className="space-y-2 mb-4">
              {savedChildren.map((child, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl bg-[#fdf8f4] border border-[#e8e0d8] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{child.avatarEmoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#2d1f14]">
                        {child.name}
                      </p>
                      {child.name_he && (
                        <p className="text-xs text-[#9b8474]" dir="rtl">
                          {child.name_he}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSavedChildren((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="text-[#c4b5a8] hover:text-red-400 transition-colors text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add-child form */}
          {formOpen && (
            <div
              className="rounded-2xl border border-[#e8e0d8] bg-white p-4 space-y-4 mb-4"
              style={{ boxShadow: "0 2px 8px rgba(45,31,20,0.06)" }}
            >
              {/* Emoji grid */}
              <div>
                <p className="text-xs font-semibold text-[#5c4a38] mb-2">
                  {he ? "בחר/י אווטאר" : "Pick an avatar"}
                </p>
                <EmojiGrid selected={childEmoji} onSelect={setChildEmoji} />
              </div>

              {/* Child name */}
              <div>
                <label className="block text-xs font-semibold text-[#5c4a38] mb-1.5">
                  {he ? "שם הילד/ה" : "Child's name"}
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder={
                    he
                      ? "מה שם האמן/ית הקטן/ה שלכם?"
                      : "What's your little artist's name?"
                  }
                  className="w-full rounded-2xl border border-[#e8e0d8] bg-[#fdf8f4] px-4 py-3 text-sm text-[#2d1f14] placeholder-[#c4b5a8] focus:border-[#ff7657] focus:outline-none focus:ring-2 focus:ring-[#ff7657]/20"
                />
              </div>

              {/* Hebrew name */}
              <div>
                <label className="block text-xs font-semibold text-[#5c4a38] mb-1.5">
                  {he ? "שם בעברית" : "Name in Hebrew"}{" "}
                  <span className="font-normal text-[#c4b5a8]">
                    ({he ? "אופציונלי" : "optional"})
                  </span>
                </label>
                <input
                  type="text"
                  value={childNameHe}
                  onChange={(e) => setChildNameHe(e.target.value)}
                  placeholder="זוהר"
                  dir="rtl"
                  className="w-full rounded-2xl border border-[#e8e0d8] bg-[#fdf8f4] px-4 py-3 text-sm text-[#2d1f14] placeholder-[#c4b5a8] focus:border-[#ff7657] focus:outline-none focus:ring-2 focus:ring-[#ff7657]/20"
                />
              </div>

              {/* Date of birth */}
              <div>
                <label className="block text-xs font-semibold text-[#5c4a38] mb-1.5">
                  {he ? "תאריך לידה" : "Date of birth"}{" "}
                  <span className="font-normal text-[#c4b5a8]">
                    ({he ? "אופציונלי" : "optional"})
                  </span>
                </label>
                <input
                  type="date"
                  value={childDob}
                  onChange={(e) => setChildDob(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  suppressHydrationWarning
                  className="w-full rounded-2xl border border-[#e8e0d8] bg-[#fdf8f4] px-4 py-3 text-sm text-[#2d1f14] focus:border-[#ff7657] focus:outline-none focus:ring-2 focus:ring-[#ff7657]/20"
                />
              </div>

              <button
                type="button"
                onClick={saveCurrentChild}
                disabled={!childName.trim()}
                className="w-full py-2.5 rounded-2xl text-sm font-semibold transition-all disabled:opacity-60"
                style={{
                  background: childName.trim() ? "#ff7657" : "#f5f0eb",
                  color: childName.trim() ? "white" : "#9b8474",
                }}
              >
                {he ? `שמור ${childEmoji}` : `Save child ${childEmoji}`}
              </button>
            </div>
          )}

          {/* Add another child */}
          {!formOpen && savedChildren.length < 5 && (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[#e8e0d8] text-sm font-medium text-[#9b8474] hover:border-[#ff7657] hover:text-[#ff7657] transition-all mb-4"
            >
              + {he ? "הוסיפו ילד/ה נוספ/ת" : "Add another child"}
            </button>
          )}

          {error && (
            <p className="text-xs text-red-500 text-center mb-3">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={retreat}
              className="flex-1 py-3 rounded-2xl border border-[#e8e0d8] text-sm font-medium text-[#5c4a38] hover:bg-[#fdf8f4] transition-colors"
            >
              {he ? "← חזרה" : "← Back"}
            </button>
            <button
              type="button"
              onClick={handleCompleteSetup}
              disabled={
                saving ||
                (savedChildren.length === 0 &&
                  (!formOpen || !childName.trim()))
              }
              className="flex-[2] py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #ff7657, #ff9a7b)" }}
            >
              {saving
                ? he
                  ? "שומר…"
                  : "Saving…"
                : he
                ? "המשך ←"
                : "Continue →"}
            </button>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━ STEP 3: FIRST UPLOAD ━━━━━━━━━━━━━━━━━━━ */}
      {step === 3 && (
        <div style={anim} dir={he ? "rtl" : "ltr"}>
          {showConfetti && <Confetti />}

          {/* Success state */}
          {uploadPhase === "success" ? (
            <div
              className="text-center py-4"
              style={{
                animation:
                  "successPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              <div className="text-5xl mb-4">🎉</div>
              <h2
                className="text-lg font-bold text-[#2d1f14] mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {he ? "יצירה ראשונה עלתה!" : "First creation uploaded!"}
              </h2>
              <p className="text-sm text-[#9b8474] mb-2">
                {he
                  ? "עוד 4 ותקבלו דוח גדילה יצירתי ראשון"
                  : "4 more until your first Creative Growth Report"}
              </p>
              <p className="text-lg mb-6">✨</p>
              <button
                onClick={goToDashboard}
                className="w-full py-3 rounded-2xl text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #ff7657, #0f9d8f)",
                }}
              >
                {he ? "לדשבורד ←" : "Go to Dashboard →"}
              </button>
            </div>
          ) : (
            <>
              <h2
                className="text-lg font-bold text-[#2d1f14] mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {he ? "העלו יצירה ראשונה" : "Upload a first creation"}
              </h2>
              <p className="text-sm text-[#9b8474] mb-5">
                {he
                  ? "צלמו משהו שנוצר לאחרונה — ציור, יצירה, כל דבר!"
                  : "Take a photo of something they made recently — a drawing, a craft, anything!"}
              </p>

              {/* Idle / error: drop zone */}
              {(uploadPhase === "idle" || uploadPhase === "error") && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files[0];
                    if (f) pickFile(f);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed cursor-pointer py-12 text-center transition-all mb-4"
                  style={{
                    borderColor: isDragging ? "#ff7657" : "#d4c8bc",
                    background: isDragging ? "#fff8f6" : "white",
                  }}
                >
                  <span className="text-5xl">📸</span>
                  <div>
                    <p className="text-sm font-bold text-[#2d1f14]">
                      {he ? "לחצו לבחירת תמונה" : "Tap to add a photo"}
                    </p>
                    <p className="text-xs text-[#9b8474] mt-1">
                      JPG · PNG · HEIC
                    </p>
                  </div>
                  {uploadPhase === "error" && (
                    <p className="text-xs text-red-500">
                      {he ? "שגיאה, נסו שוב" : "Upload failed — please try again"}
                    </p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) pickFile(f);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}

              {/* Preview */}
              {uploadPhase === "preview" && previewUrl && (
                <div className="mb-4 space-y-3">
                  <div
                    className="relative rounded-2xl overflow-hidden bg-[#f0ede9]"
                    style={{ aspectRatio: "4/3" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setUploadPhase("idle");
                        setUploadFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 end-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <button
                    onClick={startUpload}
                    className="w-full py-3 rounded-2xl text-sm font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #ff7657, #ff9a7b)",
                    }}
                  >
                    {he ? "העלו עכשיו ↑" : "Upload now ↑"}
                  </button>
                </div>
              )}

              {/* Uploading */}
              {uploadPhase === "uploading" && (
                <div className="flex flex-col items-center gap-4 py-10 mb-4">
                  <div className="relative w-14 h-14">
                    <svg
                      className="w-14 h-14 -rotate-90"
                      viewBox="0 0 56 56"
                    >
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        fill="none"
                        stroke="#f0ede9"
                        strokeWidth="5"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        fill="none"
                        stroke="#ff7657"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${(uploadProgress / 100) * 138} 138`}
                        style={{ transition: "stroke-dasharray 0.2s ease" }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#ff7657]">
                      {uploadProgress}%
                    </span>
                  </div>
                  <p className="text-sm text-[#5c4a38]">
                    {he ? "מעלה…" : "Uploading…"}
                  </p>
                </div>
              )}

              {/* Skip */}
              {uploadPhase !== "uploading" && (
                <button
                  onClick={goToDashboard}
                  className="w-full py-2.5 text-sm text-[#9b8474] hover:text-[#5c4a38] transition-colors"
                >
                  {he ? "דלג לעכשיו →" : "Skip for now →"}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
