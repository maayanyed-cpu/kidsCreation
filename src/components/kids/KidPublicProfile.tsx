"use client";

import { useState, useEffect } from "react";
import { FollowerSignupModal } from "@/components/social/FollowerSignupModal";
import { ReactionBar } from "@/components/social/ReactionBar";
import { CommentSection } from "@/components/social/CommentSection";

const SENTIMENT_EMOJI: Record<string, string> = {
  Joyful: "😄", Calm: "😌", Energetic: "⚡", Dreamy: "✨",
  Curious: "🔍", Bold: "🔥", Warm: "🌸", Playful: "🎉",
};

interface ArtworkPreview {
  artwork_id: string;
  image_url: string;
  thumb_url: string | null;
  title: string | null;
  analysis_date: string | Date;
  emotional_tone: string;
}

interface Props {
  child: { id: string; name: string; avatar_emoji: string };
  shareCode: string;
  artworks: ArtworkPreview[];
}

export function KidPublicProfile({ child, shareCode, artworks }: Props) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [followerId, setFollowerId] = useState<string | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkPreview | null>(null);

  useEffect(() => {
    fetch(`/api/follower/session`)
      .then((r) => r.json())
      .then((data) => {
        if (data.follower?.id) {
          setFollowerId(data.follower.id);
          // Check if following this child
          fetch(`/api/kids/${shareCode}`)
            .then((r) => r.json())
            .then((d) => setIsFollowing(d.isFollowing));
        }
      })
      .catch(() => {});
  }, [shareCode]);

  function handleFollowClick() {
    if (isFollowing) {
      // Unfollow
      fetch(`/api/kids/${shareCode}/follow`, { method: "DELETE" });
      setIsFollowing(false);
    } else if (followerId) {
      // Already signed up, just follow
      fetch(`/api/kids/${shareCode}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).then(() => setIsFollowing(true));
    } else {
      // Need to sign up
      setShowSignup(true);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 40%, #f0faf8 100%)" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#f0ede9] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1
            className="text-lg font-bold text-[#2d1f14]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {child.avatar_emoji} {child.name}&apos;s Creations
          </h1>
          <button
            onClick={handleFollowClick}
            className="px-4 py-2 rounded-full text-xs font-bold transition-all"
            style={{
              background: isFollowing ? "#f5f0eb" : "linear-gradient(135deg, #ff7657, #ff9a7b)",
              color: isFollowing ? "#5c4a38" : "white",
            }}
          >
            {isFollowing ? "Following ✓" : `Follow ${child.name}`}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6" style={{ paddingBottom: "2rem" }}>
        {/* Artwork grid */}
        {artworks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🎨</div>
            <p className="text-sm text-[#9b8474]">No artwork shared yet — check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {artworks.map((art) => (
              <button
                key={art.artwork_id}
                onClick={() => setSelectedArtwork(art)}
                className="group relative rounded-2xl overflow-hidden bg-white"
                style={{ boxShadow: "0 1px 4px rgba(45,31,20,0.08)" }}
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#f0ede9]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={art.thumb_url ?? art.image_url}
                    alt={art.title ?? "artwork"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute top-1.5 end-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-xs">
                  {SENTIMENT_EMOJI[art.emotional_tone] ?? "🎨"}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Artwork detail modal */}
        {selectedArtwork && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className="w-full max-w-lg rounded-3xl bg-white overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}
            >
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedArtwork.image_url}
                alt={selectedArtwork.title ?? "artwork"}
                className="w-full object-cover"
                style={{ maxHeight: "50vh" }}
              />

              <div className="p-5 space-y-5">
                {/* Close button + date */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9b8474]">
                    {new Date(selectedArtwork.analysis_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => setSelectedArtwork(null)}
                    className="text-[#c4b5a8] hover:text-[#5c4a38] text-lg"
                  >
                    ✕
                  </button>
                </div>

                {/* Reactions */}
                <ReactionBar artworkId={selectedArtwork.artwork_id} />

                {/* Comments */}
                <CommentSection artworkId={selectedArtwork.artwork_id} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Signup modal */}
      {showSignup && (
        <FollowerSignupModal
          childName={child.name}
          shareCode={shareCode}
          onFollowed={() => {
            setShowSignup(false);
            setIsFollowing(true);
            setFollowerId("new"); // will be refreshed on next load
          }}
        />
      )}
    </div>
  );
}
