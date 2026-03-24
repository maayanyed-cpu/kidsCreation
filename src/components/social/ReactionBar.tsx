"use client";

import { useState, useEffect } from "react";

const REACTIONS = [
  { emoji: "⭐", label: "Amazing!" },
  { emoji: "🌈", label: "So colorful!" },
  { emoji: "❤️", label: "Love it!" },
  { emoji: "👏", label: "Great job!" },
  { emoji: "🎨", label: "True artist!" },
  { emoji: "🔥", label: "On fire!" },
  { emoji: "✨", label: "Magical!" },
  { emoji: "🦄", label: "Unique!" },
];

interface Props {
  artworkId: string;
}

export function ReactionBar({ artworkId }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [animating, setAnimating] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/artworks/${artworkId}/reactions`)
      .then((r) => r.json())
      .then((data) => {
        setCounts(data.counts ?? {});
        setMyReaction(data.myReaction ?? null);
      })
      .catch(() => {});
  }, [artworkId]);

  async function handleReaction(emoji: string) {
    // Optimistic update
    const wasSelected = myReaction === emoji;
    const prevCounts = { ...counts };
    const prevReaction = myReaction;

    if (wasSelected) {
      // Removing
      setMyReaction(null);
      setCounts((c) => ({ ...c, [emoji]: Math.max(0, (c[emoji] || 0) - 1) }));
    } else {
      // Adding/switching
      if (myReaction) {
        setCounts((c) => ({ ...c, [myReaction!]: Math.max(0, (c[myReaction!] || 0) - 1) }));
      }
      setMyReaction(emoji);
      setCounts((c) => ({ ...c, [emoji]: (c[emoji] || 0) + 1 }));
    }

    // Bounce animation
    setAnimating(emoji);
    setTimeout(() => setAnimating(null), 400);

    try {
      await fetch(`/api/artworks/${artworkId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch {
      // Revert on failure
      setCounts(prevCounts);
      setMyReaction(prevReaction);
    }
  }

  const hasAnyReactions = Object.values(counts).some((c) => c > 0);

  return (
    <div className="space-y-3">
      {/* Emoji buttons */}
      <div className="flex flex-wrap gap-1.5">
        {REACTIONS.map(({ emoji, label }) => {
          const isSelected = myReaction === emoji;
          const isBouncing = animating === emoji;
          return (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              title={label}
              className="relative flex items-center gap-0.5 px-2.5 py-1.5 rounded-full text-sm transition-all active:scale-95"
              style={{
                background: isSelected ? "#fff1ed" : "#fdf8f4",
                border: isSelected ? "1.5px solid #ff7657" : "1.5px solid transparent",
                animation: isBouncing ? "reactionPop 0.4s cubic-bezier(0.34,1.56,0.64,1)" : undefined,
              }}
            >
              <span className="text-base">{emoji}</span>
              {(counts[emoji] || 0) > 0 && (
                <span
                  className="text-xs font-semibold"
                  style={{ color: isSelected ? "#ff7657" : "#9b8474" }}
                >
                  {counts[emoji]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary line */}
      {hasAnyReactions && (
        <p className="text-xs text-[#9b8474]">
          {Object.entries(counts)
            .filter(([, c]) => c > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([e, c]) => `${e} ${c}`)
            .join("  ")}
        </p>
      )}
    </div>
  );
}
