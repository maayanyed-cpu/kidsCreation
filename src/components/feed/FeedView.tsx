"use client";

import { useState } from "react";
import { ReactionBar } from "@/components/social/ReactionBar";
import { CommentSection } from "@/components/social/CommentSection";

interface FeedItem {
  artwork_id: string;
  child_id: string;
  image_url: string;
  thumb_url: string | null;
  title: string | null;
  analysis_date: string;
  emotional_tone: string;
  child: { name: string; avatar_emoji: string; share_code: string | null };
  reactionCount: number;
  commentCount: number;
}

interface Props {
  items: FeedItem[];
}

export function FeedView({ items }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((i) => i.artwork_id === selectedId);

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 40%, #f0faf8 100%)" }}
    >
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#f0ede9] px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1
            className="text-lg font-bold text-[#2d1f14]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            🎨 Family Feed
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {items.map((item) => (
          <button
            key={item.artwork_id}
            onClick={() => setSelectedId(item.artwork_id)}
            className="w-full text-left rounded-2xl bg-white overflow-hidden"
            style={{ boxShadow: "0 1px 4px rgba(45,31,20,0.08)" }}
          >
            {/* Child info */}
            <div className="flex items-center gap-2 px-4 pt-3 pb-2">
              <span className="text-lg">{item.child.avatar_emoji}</span>
              <span className="text-sm font-semibold text-[#2d1f14]">{item.child.name}</span>
              <span className="text-xs text-[#c4b5a8] ms-auto">
                {new Date(item.analysis_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Image */}
            <div className="aspect-[4/3] overflow-hidden bg-[#f0ede9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumb_url ?? item.image_url}
                alt={item.title ?? "artwork"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Engagement summary */}
            {(item.reactionCount > 0 || item.commentCount > 0) && (
              <div className="flex items-center gap-3 px-4 py-2.5 text-xs text-[#9b8474]">
                {item.reactionCount > 0 && <span>⭐ {item.reactionCount} reactions</span>}
                {item.commentCount > 0 && <span>💬 {item.commentCount} comments</span>}
              </div>
            )}
          </button>
        ))}

        {items.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm text-[#9b8474]">Nothing new yet — check back soon!</p>
          </div>
        )}
      </main>

      {/* Detail overlay */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg rounded-3xl bg-white overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.image_url}
              alt={selected.title ?? "artwork"}
              className="w-full object-cover"
              style={{ maxHeight: "50vh" }}
            />
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selected.child.avatar_emoji}</span>
                  <span className="text-sm font-semibold text-[#2d1f14]">{selected.child.name}</span>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-[#c4b5a8] hover:text-[#5c4a38] text-lg"
                >
                  ✕
                </button>
              </div>
              <ReactionBar artworkId={selected.artwork_id} />
              <CommentSection artworkId={selected.artwork_id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
