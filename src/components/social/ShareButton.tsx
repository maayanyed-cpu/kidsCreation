"use client";

import { useState } from "react";

interface Props {
  childName: string;
  childNameHe?: string | null;
  shareCode: string;
}

export function ShareButton({ childName, childNameHe, shareCode }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const shareUrl = `${baseUrl}/kids/${shareCode}`;

  const enText = `Come see ${childName}'s latest artwork! 🎨 ${shareUrl}`;
  const heText = childNameHe
    ? `בואו לראות את היצירות של ${childNameHe}! 🎨 ${shareUrl}`
    : enText;

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#f5f0eb] text-[#5c4a38] hover:bg-[#ede8e2] transition-colors"
      >
        🔗 Share {childName}&apos;s Gallery
      </button>
    );
  }

  return (
    <div
      className="rounded-2xl bg-white p-4 space-y-3"
      style={{ boxShadow: "0 4px 24px rgba(45,31,20,0.12)" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#2d1f14]">
          Share {childName}&apos;s Gallery
        </h3>
        <button
          onClick={() => setOpen(false)}
          className="text-[#c4b5a8] hover:text-[#5c4a38] text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* URL display */}
      <div className="flex items-center gap-2 rounded-xl bg-[#fdf8f4] border border-[#e8e0d8] px-3 py-2">
        <p className="flex-1 text-xs text-[#5c4a38] truncate">{shareUrl}</p>
        <button
          onClick={handleCopy}
          className="text-xs font-semibold text-[#ff7657] hover:underline flex-shrink-0"
        >
          {copied ? "Copied! ✓" : "Copy"}
        </button>
      </div>

      {/* Share targets */}
      <div className="flex gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(enText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] text-xs font-semibold hover:bg-[#25D366]/20 transition-colors"
        >
          WhatsApp (EN)
        </a>
        {childNameHe && (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(heText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] text-xs font-semibold hover:bg-[#25D366]/20 transition-colors"
            dir="rtl"
          >
            WhatsApp (HE)
          </a>
        )}
      </div>
    </div>
  );
}
