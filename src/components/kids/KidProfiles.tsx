"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface KidData {
  id: string;
  name: string;
  name_he: string | null;
  avatar_emoji: string;
  avatar_color: string | null;
  share_code: string | null;
  date_of_birth: string | null;
  is_public: boolean;
  artworkCount: number;
  followerCount: number;
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #a855f7, #7c3aed)", // purple
  "linear-gradient(135deg, #ec4899, #db2777)", // pink
  "linear-gradient(135deg, #22c55e, #16a34a)", // green
  "linear-gradient(135deg, #f97316, #ea580c)", // orange
  "linear-gradient(135deg, #3b82f6, #2563eb)", // blue
];

function computeAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years--;
  }
  return `${years} years old`;
}

export function KidProfiles({ children: initialChildren }: { children: KidData[] }) {
  const [kids, setKids] = useState<KidData[]>(initialChildren);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePublic = useCallback(async (childId: string, currentPublic: boolean) => {
    const newValue = !currentPublic;
    // Optimistic update
    setKids((prev) =>
      prev.map((k) => (k.id === childId ? { ...k, is_public: newValue } : k))
    );
    try {
      const res = await fetch(`/api/children/${childId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: newValue }),
      });
      if (!res.ok) {
        // Revert on failure
        setKids((prev) =>
          prev.map((k) =>
            k.id === childId ? { ...k, is_public: currentPublic } : k
          )
        );
      }
    } catch {
      setKids((prev) =>
        prev.map((k) =>
          k.id === childId ? { ...k, is_public: currentPublic } : k
        )
      );
    }
  }, []);

  const copyInviteLink = useCallback(async (shareCode: string, childId: string) => {
    const url = `${window.location.origin}/kids/${shareCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(childId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  }, []);

  return (
    <>
      <style>{`
        .kp-page {
          min-height: 100vh;
          background: var(--cream, #faf8f5);
        }
        .kp-container {
          max-width: 720px;
          margin: 0 auto;
          padding: 40px 16px;
          padding-bottom: calc(5rem + env(safe-area-inset-bottom));
        }
        .kp-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .kp-header-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #3bb09e, #2d9a8a);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin-bottom: 12px;
          box-shadow: 0 4px 14px rgba(59, 176, 158, 0.25);
        }
        .kp-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: #2a241f;
          margin: 0 0 6px;
          font-family: var(--font-display);
        }
        .kp-header p {
          font-size: 14px;
          color: #9b8474;
          margin: 0;
        }
        .kp-add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          max-width: 640px;
          margin: 0 auto 24px;
          padding: 14px 20px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #f06449, #ff8566);
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 14px rgba(240, 100, 73, 0.3);
          font-family: var(--font-body);
        }
        .kp-add-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(240, 100, 73, 0.35);
        }
        .kp-add-btn:active {
          transform: translateY(0);
        }
        .kp-card {
          max-width: 640px;
          margin: 0 auto 16px;
          background: #fffdfb;
          border: 1px solid #e8e0d8;
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(42, 36, 31, 0.04);
        }
        .kp-card-top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
        }
        .kp-avatar {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 22px;
          font-weight: 700;
          flex-shrink: 0;
          font-family: var(--font-display);
        }
        .kp-info {
          flex: 1;
          min-width: 0;
        }
        .kp-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .kp-name {
          font-size: 17px;
          font-weight: 700;
          color: #2a241f;
          font-family: var(--font-display);
        }
        .kp-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          border: none;
          font-family: var(--font-body);
        }
        .kp-badge:hover {
          transform: scale(1.05);
        }
        .kp-badge-private {
          background: #f5f0eb;
          color: #7a6e62;
        }
        .kp-badge-public {
          background: #e6f7f4;
          color: #2d7a6e;
        }
        .kp-meta {
          font-size: 13px;
          color: #9b8474;
          margin-top: 2px;
        }
        .kp-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .kp-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #e8e0d8;
          background: #fffdfb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #9b8474;
          transition: all 0.15s;
          font-size: 15px;
        }
        .kp-action-btn:hover {
          background: #f5f0eb;
          color: #7a6e62;
        }
        .kp-invite-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 12px;
          background: #f9f6f3;
          border: 1px dashed #e0d8cf;
        }
        .kp-invite-text {
          flex: 1;
          font-size: 13px;
          color: #9b8474;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .kp-copy-btn {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid #e8e0d8;
          background: #fff;
          font-size: 12px;
          font-weight: 600;
          color: #3bb09e;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          font-family: var(--font-body);
        }
        .kp-copy-btn:hover {
          background: #e6f7f4;
        }
        .kp-copy-btn.kp-copied {
          background: #3bb09e;
          color: #fff;
          border-color: #3bb09e;
        }
        .kp-empty {
          text-align: center;
          padding: 40px 20px;
          color: #9b8474;
        }
        .kp-empty p {
          font-size: 14px;
          margin: 8px 0 0;
        }
      `}</style>

      <div className="kp-page">
        <div className="kp-container">
          <div className="kp-header">
            <div className="kp-header-icon">
              <span role="img" aria-label="profiles">&#x1F464;</span>
            </div>
            <h1>Kid Profiles</h1>
            <p>Manage your children&apos;s profiles and privacy settings</p>
          </div>

          <Link href="/kids/add" className="kp-add-btn" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 18 }}>&#xFF0B;</span>
            Add a Kid
          </Link>

          {kids.length === 0 ? (
            <div className="kp-empty">
              <span style={{ fontSize: 48 }}>&#x1F9D2;</span>
              <p>No kids yet. Add your first child to get started!</p>
            </div>
          ) : (
            kids.map((kid) => (
              <div key={kid.id} className="kp-card">
                <div className="kp-card-top">
                  <div
                    className="kp-avatar"
                    style={{ background: kid.avatar_color || "#f06449" }}
                  >
                    {kid.avatar_emoji || kid.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="kp-info">
                    <div className="kp-name-row">
                      <span className="kp-name">{kid.name}</span>
                      <button
                        className={`kp-badge ${kid.is_public ? "kp-badge-public" : "kp-badge-private"}`}
                        onClick={() => togglePublic(kid.id, kid.is_public)}
                        title={`Click to make ${kid.is_public ? "private" : "public"}`}
                      >
                        {kid.is_public ? (
                          <><span role="img" aria-label="public">&#x1F30D;</span> Public</>
                        ) : (
                          <><span role="img" aria-label="private">&#x1F512;</span> Private</>
                        )}
                      </button>
                    </div>
                    <div className="kp-meta">
                      {kid.date_of_birth ? computeAge(kid.date_of_birth) : "Age not set"}
                      {" \u00B7 "}
                      {kid.followerCount} follower{kid.followerCount !== 1 ? "s" : ""}
                      {" \u00B7 "}
                      {kid.artworkCount} artwork{kid.artworkCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="kp-actions">
                    <button className="kp-action-btn" title="Edit">
                      <span role="img" aria-label="edit">&#x270F;&#xFE0F;</span>
                    </button>
                    <button className="kp-action-btn" title="Delete">
                      <span role="img" aria-label="delete">&#x1F5D1;&#xFE0F;</span>
                    </button>
                  </div>
                </div>
                {kid.share_code && (
                  <div className="kp-invite-row">
                    <span className="kp-invite-text">
                      &#x1F517; Share an invite link...
                    </span>
                    <button
                      className={`kp-copy-btn ${copiedId === kid.id ? "kp-copied" : ""}`}
                      onClick={() => copyInviteLink(kid.share_code!, kid.id)}
                    >
                      {copiedId === kid.id ? "Copied!" : "Copy invite link"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
