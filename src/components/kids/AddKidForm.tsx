"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EMOJIS = ["⚡", "🌸", "🎨", "🦁", "🌈", "🚀", "🎵", "💃", "🌟", "🎮", "🦋", "🌺"];
const COLORS = ["#f06449", "#3bb09e", "#f0a830", "#a78bfa", "#60a5fa", "#f472b6"];

export function AddKidForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [emoji, setEmoji] = useState("⚡");
  const [color, setColor] = useState("#f06449");
  const [privacy, setPrivacy] = useState<"private" | "public">("private");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleDobChange = useCallback((value: string) => {
    setDob(value);
    if (value) {
      const birth = new Date(value);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        years--;
      }
      if (years >= 0) {
        setAge(String(years));
      }
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          date_of_birth: dob || null,
          avatar_emoji: emoji,
          avatar_color: color,
          is_public: privacy === "public",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setSubmitting(false);
        return;
      }
      router.push("/kids");
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [name, dob, emoji, color, privacy, router]);

  const previewName = name.trim() || "New kid";
  const previewMeta = `${privacy === "private" ? "🔒 Private" : "🌍 Public"}${age ? ` \u00B7 ${age} years old` : ""}`;

  return (
    <>
      <style>{`
        .akf-page {
          min-height: 100vh;
          background: var(--cream, #faf8f5);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 40px 60px;
        }
        .akf-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--stone-400, #a89888);
          font-weight: 500;
          margin-bottom: 24px;
          align-self: flex-start;
          max-width: 560px;
          width: 100%;
          transition: color 0.2s;
          text-decoration: none;
        }
        .akf-back:hover {
          color: var(--coral-500, #f06449);
        }
        .akf-back svg {
          width: 16px;
          height: 16px;
        }
        .akf-card {
          width: 100%;
          max-width: 560px;
          background: var(--warm-white, #fffdfb);
          border: 1px solid var(--stone-200, #e8e0d8);
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 1px 3px rgba(42, 36, 31, 0.04);
        }
        .akf-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .akf-header-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: linear-gradient(135deg, #3bb09e, #6cc9b8);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin: 0 auto 14px;
        }
        .akf-header h1 {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 700;
          color: var(--stone-800, #2a241f);
          margin: 0 0 4px;
        }
        .akf-header p {
          font-size: 14px;
          color: var(--stone-400, #a89888);
          margin: 0;
        }
        .akf-field {
          margin-bottom: 24px;
        }
        .akf-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--stone-600, #5c5248);
          margin-bottom: 8px;
          letter-spacing: 0.2px;
        }
        .akf-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--stone-200, #e8e0d8);
          border-radius: 12px;
          font-size: 15px;
          color: var(--stone-800, #2a241f);
          outline: none;
          background: var(--warm-white, #fffdfb);
          transition: border-color 0.2s;
          font-family: var(--font-body);
        }
        .akf-input:focus {
          border-color: var(--coral-400, #ff8566);
          box-shadow: 0 0 0 3px rgba(240, 100, 73, 0.08);
        }
        .akf-input::placeholder {
          color: var(--stone-300, #d4c8bc);
        }
        .akf-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .akf-emoji-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }
        .akf-emoji-btn {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 12px;
          border: 2px solid var(--stone-200, #e8e0d8);
          background: var(--warm-white, #fffdfb);
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
        }
        .akf-emoji-btn:hover {
          border-color: var(--coral-200, #ffc9b8);
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(42, 36, 31, 0.06);
        }
        .akf-emoji-btn.akf-selected {
          border-color: var(--coral-500, #f06449);
          background: var(--coral-50, #fff5f2);
          box-shadow: 0 8px 24px rgba(240, 100, 73, 0.15);
          transform: scale(1.05);
        }
        .akf-color-grid {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .akf-color-dot {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          padding: 0;
          font-family: inherit;
        }
        .akf-color-dot:hover {
          transform: scale(1.15);
        }
        .akf-color-dot.akf-selected {
          border-color: var(--stone-800, #2a241f);
          box-shadow: 0 0 0 3px var(--warm-white, #fffdfb), 0 0 0 5px var(--stone-300, #d4c8bc);
        }
        .akf-color-check {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        .akf-privacy-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .akf-privacy-option {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 16px;
          border: 2px solid var(--stone-200, #e8e0d8);
          background: var(--warm-white, #fffdfb);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .akf-privacy-option:hover {
          border-color: var(--stone-300, #d4c8bc);
        }
        .akf-privacy-option.akf-selected {
          border-color: var(--coral-500, #f06449);
          background: var(--coral-50, #fff5f2);
        }
        .akf-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid var(--stone-300, #d4c8bc);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
          transition: all 0.2s;
        }
        .akf-privacy-option.akf-selected .akf-radio {
          border-color: var(--coral-500, #f06449);
        }
        .akf-radio-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--coral-500, #f06449);
        }
        .akf-privacy-icon {
          font-size: 20px;
          margin-top: 1px;
        }
        .akf-privacy-text h4 {
          font-size: 15px;
          font-weight: 600;
          color: var(--stone-800, #2a241f);
          margin: 0 0 2px;
        }
        .akf-privacy-text p {
          font-size: 13px;
          color: var(--stone-400, #a89888);
          line-height: 1.5;
          margin: 0;
        }
        .akf-preview {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid var(--stone-100, #f5f0eb);
        }
        .akf-preview-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--stone-400, #a89888);
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 14px;
        }
        .akf-preview-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          border-radius: 16px;
          background: var(--stone-100, #f5f0eb);
          border: 1px solid var(--stone-200, #e8e0d8);
        }
        .akf-preview-avatar {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 22px;
          font-weight: 700;
          flex-shrink: 0;
          transition: background 0.3s;
        }
        .akf-preview-info {
          flex: 1;
        }
        .akf-preview-name {
          font-size: 16px;
          font-weight: 700;
          color: var(--stone-800, #2a241f);
        }
        .akf-preview-meta {
          font-size: 13px;
          color: var(--stone-400, #a89888);
        }
        .akf-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 32px;
          gap: 12px;
        }
        .akf-btn-cancel {
          padding: 12px 24px;
          border-radius: 9999px;
          font-size: 15px;
          font-weight: 600;
          color: var(--stone-500, #7a6e62);
          border: 1px solid var(--stone-200, #e8e0d8);
          background: var(--warm-white, #fffdfb);
          transition: all 0.2s;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          font-family: var(--font-body);
        }
        .akf-btn-cancel:hover {
          background: var(--stone-100, #f5f0eb);
        }
        .akf-btn-create {
          padding: 12px 32px;
          border-radius: 9999px;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          background: var(--coral-500, #f06449);
          box-shadow: 0 8px 24px rgba(240, 100, 73, 0.15);
          transition: all 0.25s;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          border: none;
          font-family: var(--font-body);
        }
        .akf-btn-create:hover:not(:disabled) {
          background: var(--coral-600, #d94f36);
          transform: translateY(-1px);
        }
        .akf-btn-create:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .akf-error {
          color: #dc2626;
          font-size: 13px;
          margin-top: 8px;
          text-align: center;
        }
        @media (max-width: 768px) {
          .akf-page {
            padding: 24px 16px;
          }
          .akf-card {
            padding: 24px;
          }
          .akf-emoji-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .akf-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="akf-page">
        <Link href="/kids" className="akf-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to My Kids
        </Link>

        <div className="akf-card">
          <div className="akf-header">
            <div className="akf-header-icon">
              <span role="img" aria-label="baby">&#x1F476;</span>
            </div>
            <h1>Add a Kid</h1>
            <p>Create a profile for your little artist</p>
          </div>

          {/* Name */}
          <div className="akf-field">
            <label className="akf-label">Kid&apos;s name</label>
            <input
              type="text"
              className="akf-input"
              placeholder="e.g. Zohar"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Age + DOB */}
          <div className="akf-row">
            <div className="akf-field">
              <label className="akf-label">Age</label>
              <input
                type="number"
                className="akf-input"
                placeholder="3"
                min="1"
                max="18"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="akf-field">
              <label className="akf-label">Date of birth (optional)</label>
              <input
                type="date"
                className="akf-input"
                value={dob}
                onChange={(e) => handleDobChange(e.target.value)}
              />
            </div>
          </div>

          {/* Emoji Picker */}
          <div className="akf-field">
            <label className="akf-label">Choose an avatar emoji</label>
            <div className="akf-emoji-grid">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`akf-emoji-btn${emoji === e ? " akf-selected" : ""}`}
                  onClick={() => setEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="akf-field">
            <label className="akf-label">Avatar color</label>
            <div className="akf-color-grid">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`akf-color-dot${color === c ? " akf-selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                >
                  {color === c && <span className="akf-color-check">&#x2713;</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className="akf-field">
            <label className="akf-label">Privacy setting</label>
            <div className="akf-privacy-options">
              <div
                className={`akf-privacy-option${privacy === "private" ? " akf-selected" : ""}`}
                onClick={() => setPrivacy("private")}
              >
                <div className="akf-radio">
                  {privacy === "private" && <div className="akf-radio-dot" />}
                </div>
                <span className="akf-privacy-icon">
                  <span role="img" aria-label="lock">&#x1F512;</span>
                </span>
                <div className="akf-privacy-text">
                  <h4>Private</h4>
                  <p>Only invited family members can see this kid&apos;s creations</p>
                </div>
              </div>
              <div
                className={`akf-privacy-option${privacy === "public" ? " akf-selected" : ""}`}
                onClick={() => setPrivacy("public")}
              >
                <div className="akf-radio">
                  {privacy === "public" && <div className="akf-radio-dot" />}
                </div>
                <span className="akf-privacy-icon">
                  <span role="img" aria-label="globe">&#x1F30D;</span>
                </span>
                <div className="akf-privacy-text">
                  <h4>Public</h4>
                  <p>Anyone with the gallery link can view</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="akf-preview">
            <div className="akf-preview-label">Preview</div>
            <div className="akf-preview-card">
              <div className="akf-preview-avatar" style={{ background: color }}>
                {emoji}
              </div>
              <div className="akf-preview-info">
                <div className="akf-preview-name">{previewName}</div>
                <div className="akf-preview-meta">{previewMeta}</div>
              </div>
            </div>
          </div>

          {error && <div className="akf-error">{error}</div>}

          {/* Actions */}
          <div className="akf-actions">
            <Link href="/kids" className="akf-btn-cancel">Cancel</Link>
            <button
              type="button"
              className="akf-btn-create"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Creating..." : "Create Profile \u2728"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
