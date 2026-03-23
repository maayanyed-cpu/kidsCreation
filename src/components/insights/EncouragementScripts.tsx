"use client";

import { useState } from "react";

interface ScriptCardProps {
  script: string;
  index: number;
  delay: number;
}

function ScriptCard({ script, index, delay }: ScriptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const cardColors = [
    "bg-violet-50 border-violet-100",
    "bg-sky-50    border-sky-100",
    "bg-amber-50  border-amber-100",
  ];

  const numColors = [
    "bg-violet-100 text-violet-700",
    "bg-sky-100    text-sky-700",
    "bg-amber-100  text-amber-700",
  ];

  return (
    <div
      className={`animate-slide-up flex flex-col gap-3 p-4 rounded-2xl border ${cardColors[index % 3]}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${numColors[index % 3]}`}>
          {index + 1}
        </span>
        <p className="text-sm text-[#374151] leading-relaxed flex-1">&ldquo;{script}&rdquo;</p>
      </div>
      <button
        onClick={handleCopy}
        className={`self-end flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 ${
          copied
            ? "bg-emerald-100 text-emerald-700"
            : "bg-white text-[#6b7280] hover:text-[#7c5cbf] hover:bg-[#ede9f8] border border-[#e5e7eb]"
        }`}
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
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
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af]">
            How to Cheer Them On
          </p>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Say these out loud — they&rsquo;re tied to real details in their artwork
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {scripts.map((script, i) => (
          <ScriptCard
            key={i}
            script={script}
            index={i}
            delay={delay + i * 80}
          />
        ))}
      </div>
    </div>
  );
}
