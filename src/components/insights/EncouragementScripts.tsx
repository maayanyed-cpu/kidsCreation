"use client";

import { useState } from "react";

const CARD_STYLES = [
  { bg: "#faf5ff", border: "#ede9fe", numBg: "#ede9fe", numText: "#6d28d9" },
  { bg: "#eff6ff", border: "#dbeafe", numBg: "#dbeafe", numText: "#1d4ed8" },
  { bg: "#fffbeb", border: "#fef3c7", numBg: "#fef3c7", numText: "#b45309" },
];

interface ScriptCardProps {
  script: string;
  index: number;
}

function ScriptCard({ script, index }: ScriptCardProps) {
  const [copied, setCopied] = useState(false);
  const style = CARD_STYLES[index % 3];

  const handleCopy = () => {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-2xl border snap-start flex-shrink-0 w-[78vw] sm:w-auto"
      style={{ background: style.bg, borderColor: style.border }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: style.numBg, color: style.numText }}
        >
          {index + 1}
        </span>
        <p className="text-sm text-[#374151] leading-relaxed flex-1">
          &ldquo;{script}&rdquo;
        </p>
      </div>

      <button
        onClick={handleCopy}
        className="self-end flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200"
        style={
          copied
            ? { background: "#d1fae5", color: "#065f46" }
            : { background: "white", color: "#6b7280", border: "1px solid #e5e7eb" }
        }
      >
        {copied ? (
          <>
            {/* Animated draw-on checkmark */}
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m5 13 4 4L19 7"
                style={{
                  strokeDasharray: 22,
                  strokeDashoffset: 0,
                  animation: "checkDraw 0.3s ease-out forwards",
                }}
              />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
            </svg>
            Copy
          </>
        )}
      </button>
    </div>
  );
}

interface Props {
  scripts: string[];
  delay?: number;
}

export function EncouragementScripts({ scripts, delay = 0 }: Props) {
  return (
    <div
      className="card animate-slide-up col-span-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">💬</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9b8474]">
            How to Cheer Them On
          </p>
          <p className="text-sm text-[#9b8474] mt-0.5">
            Say these out loud — they&rsquo;re tied to real details in their artwork
          </p>
        </div>
      </div>

      {/* Mobile: swipeable horizontal scroll · Desktop: 3-col grid */}
      <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
        {scripts.map((script, i) => (
          <ScriptCard key={i} script={script} index={i} />
        ))}
      </div>
    </div>
  );
}
