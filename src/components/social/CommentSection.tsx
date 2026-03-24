"use client";

import { useState, useEffect } from "react";

interface CommentData {
  id: string;
  author_name: string;
  text: string;
  user_type: string;
  created_at: string;
}

interface Props {
  artworkId: string;
  canDelete?: boolean; // true for parent viewing their child's artwork
}

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function CommentSection({ artworkId, canDelete = false }: Props) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "info"; msg: string } | null>(null);

  useEffect(() => {
    fetch(`/api/artworks/${artworkId}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments ?? []))
      .catch(() => {});
  }, [artworkId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/artworks/${artworkId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();

      if (res.status === 422) {
        // Positive-only filter rejection
        setFeedback({ type: "error", msg: data.message });
      } else if (res.status === 202) {
        // Pending review
        setFeedback({ type: "info", msg: data.message });
        setText("");
      } else if (res.ok) {
        setComments((prev) => [...prev, data.comment]);
        setText("");
      } else {
        setFeedback({ type: "error", msg: data.error ?? "Something went wrong" });
      }
    } catch {
      setFeedback({ type: "error", msg: "Failed to post comment" });
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(commentId: string) {
    await fetch(`/api/artworks/${artworkId}/comments/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-[#9b8474] uppercase tracking-wider">
        Comments
      </h3>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: c.user_type === "parent" ? "#ff7657" : "#0f9d8f" }}
              >
                {c.author_name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#2d1f14]">
                    {c.author_name}
                  </span>
                  <span className="text-[10px] text-[#c4b5a8]">{timeAgo(c.created_at)}</span>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-[10px] text-[#c4b5a8] hover:text-red-400 ms-auto"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#2d1f14] leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#c4b5a8]">No comments yet — be the first!</p>
      )}

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); setFeedback(null); }}
          placeholder="Say something encouraging! 💬"
          maxLength={500}
          className="flex-1 rounded-2xl border border-[#e8e0d8] bg-[#fdf8f4] px-4 py-2.5 text-sm text-[#2d1f14] placeholder-[#c4b5a8] focus:border-[#ff7657] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || posting}
          className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
          style={{ background: "#ff7657" }}
        >
          {posting ? "…" : "Send"}
        </button>
      </form>

      {/* Feedback */}
      {feedback && (
        <p
          className="text-xs text-center px-3 py-2 rounded-xl"
          style={{
            background: feedback.type === "error" ? "#fff5f5" : "#f0faf8",
            color: feedback.type === "error" ? "#e55" : "#0f9d8f",
          }}
        >
          {feedback.msg}
        </p>
      )}
    </div>
  );
}
