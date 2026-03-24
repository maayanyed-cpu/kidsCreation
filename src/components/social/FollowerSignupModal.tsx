"use client";

import { useState } from "react";

interface Props {
  childName: string;
  shareCode: string;
  onFollowed: () => void;
}

export function FollowerSignupModal({ childName, shareCode, onFollowed }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/kids/${shareCode}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed to follow");
      }
      onFollowed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-white p-6 space-y-4"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">🎨</div>
          <h2 className="text-lg font-bold text-[#2d1f14]">
            Follow {childName}&apos;s Creations
          </h2>
          <p className="text-sm text-[#9b8474] mt-1">
            Get notified when new artwork is shared!
          </p>
        </div>

        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full rounded-2xl border border-[#e8e0d8] bg-[#fdf8f4] px-4 py-3 text-sm text-[#2d1f14] placeholder-[#c4b5a8] focus:border-[#ff7657] focus:outline-none"
          />
        </div>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="w-full rounded-2xl border border-[#e8e0d8] bg-[#fdf8f4] px-4 py-3 text-sm text-[#2d1f14] placeholder-[#c4b5a8] focus:border-[#ff7657] focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading || !name.trim() || !email.trim()}
          className="w-full py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-60 transition-all"
          style={{ background: "linear-gradient(135deg, #ff7657, #ff9a7b)" }}
        >
          {loading ? "Following…" : `Follow ${childName} 🎨`}
        </button>
      </form>
    </div>
  );
}
