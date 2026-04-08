"use client";

import { useState, useCallback } from "react";

interface FollowerData {
  id: string;
  email: string;
  name: string;
}

interface ChildData {
  id: string;
  name: string;
  name_he: string | null;
  avatar_emoji: string;
  is_public: boolean;
  followers: FollowerData[];
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #a855f7, #7c3aed)",
  "linear-gradient(135deg, #ec4899, #db2777)",
  "linear-gradient(135deg, #22c55e, #16a34a)",
  "linear-gradient(135deg, #f97316, #ea580c)",
  "linear-gradient(135deg, #3b82f6, #2563eb)",
];

export function FamilyAccess({
  children: initialChildren,
  allFollowers: initialFollowers,
}: {
  children: ChildData[];
  allFollowers: FollowerData[];
}) {
  const [kids, setKids] = useState<ChildData[]>(initialChildren);
  const [allMembers, setAllMembers] = useState<FollowerData[]>(initialFollowers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteChildId, setInviteChildId] = useState(initialChildren[0]?.id ?? "");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const sendInvite = useCallback(
    async (email: string, childId: string) => {
      if (!email.trim() || !childId) return;
      setInviting(true);
      setInviteError(null);
      setInviteSuccess(null);

      try {
        const res = await fetch("/api/family/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), childId }),
        });

        if (!res.ok) {
          const data = await res.json();
          setInviteError(data.error || "Failed to invite");
          return;
        }

        setInviteSuccess(`Invited ${email.trim()} successfully!`);
        setInviteEmail("");

        // Refresh state: add follower to the child and to allMembers
        const emailNorm = email.trim().toLowerCase();
        const existingFollower = allMembers.find((f) => f.email === emailNorm);
        const followerObj: FollowerData = existingFollower ?? {
          id: "temp-" + Date.now(),
          email: emailNorm,
          name: emailNorm.split("@")[0],
        };

        if (!existingFollower) {
          setAllMembers((prev) => [...prev, followerObj]);
        }

        setKids((prev) =>
          prev.map((k) => {
            if (k.id === childId && !k.followers.find((f) => f.email === emailNorm)) {
              return { ...k, followers: [...k.followers, followerObj] };
            }
            return k;
          })
        );

        setTimeout(() => setInviteSuccess(null), 3000);
      } catch {
        setInviteError("Network error. Please try again.");
      } finally {
        setInviting(false);
      }
    },
    [allMembers]
  );

  return (
    <>
      <style>{`
        .fa-page {
          min-height: 100vh;
          background: var(--cream, #faf8f5);
        }
        .fa-container {
          max-width: 720px;
          margin: 0 auto;
          padding: 40px 16px;
          padding-bottom: calc(5rem + env(safe-area-inset-bottom));
        }
        .fa-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .fa-header-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #ec4899, #db2777);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin-bottom: 12px;
          box-shadow: 0 4px 14px rgba(236, 72, 153, 0.25);
          color: #fff;
        }
        .fa-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: #2a241f;
          margin: 0 0 6px;
          font-family: var(--font-display);
        }
        .fa-header p {
          font-size: 14px;
          color: #9b8474;
          margin: 0;
        }
        .fa-card {
          max-width: 640px;
          margin: 0 auto 16px;
          background: #fffdfb;
          border: 1px solid #e8e0d8;
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(42, 36, 31, 0.04);
        }
        .fa-card-title {
          font-size: 15px;
          font-weight: 700;
          color: #2a241f;
          margin: 0 0 14px;
          font-family: var(--font-display);
        }
        /* Safe & private banner */
        .fa-banner {
          max-width: 640px;
          margin: 0 auto 16px;
          background: linear-gradient(135deg, #e6f7f4, #d0f0ea);
          border: 1px solid #b8e6db;
          border-radius: 18px;
          padding: 18px 20px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .fa-banner-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #3bb09e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          color: #fff;
        }
        .fa-banner-text h3 {
          font-size: 14px;
          font-weight: 700;
          color: #2d7a6e;
          margin: 0 0 4px;
          font-family: var(--font-display);
        }
        .fa-banner-text p {
          font-size: 13px;
          color: #4a9a8b;
          margin: 0;
          line-height: 1.5;
        }
        /* Invite form */
        .fa-invite-form {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        .fa-invite-input {
          flex: 1;
          min-width: 180px;
          padding: 10px 14px;
          border: 1px solid #e8e0d8;
          border-radius: 10px;
          font-size: 14px;
          background: #faf8f5;
          color: #2a241f;
          outline: none;
          font-family: var(--font-body);
        }
        .fa-invite-input:focus {
          border-color: #3bb09e;
          box-shadow: 0 0 0 3px rgba(59, 176, 158, 0.15);
        }
        .fa-invite-select {
          padding: 10px 14px;
          border: 1px solid #e8e0d8;
          border-radius: 10px;
          font-size: 14px;
          background: #faf8f5;
          color: #2a241f;
          outline: none;
          font-family: var(--font-body);
        }
        .fa-invite-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #f06449, #ff8566);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(240, 100, 73, 0.25);
          white-space: nowrap;
          font-family: var(--font-body);
        }
        .fa-invite-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(240, 100, 73, 0.3);
        }
        .fa-invite-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .fa-msg {
          font-size: 13px;
          margin-top: 8px;
        }
        .fa-msg-success { color: #2d7a6e; }
        .fa-msg-error { color: #e53e3e; }
        /* Child viewer cards */
        .fa-child-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #f5f0eb;
        }
        .fa-child-card:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .fa-child-avatar {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 17px;
          font-weight: 700;
          flex-shrink: 0;
          font-family: var(--font-display);
        }
        .fa-child-info {
          flex: 1;
          min-width: 0;
        }
        .fa-child-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }
        .fa-child-name {
          font-size: 14px;
          font-weight: 700;
          color: #2a241f;
          font-family: var(--font-display);
        }
        .fa-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 1px 7px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
        }
        .fa-badge-private {
          background: #f5f0eb;
          color: #7a6e62;
        }
        .fa-badge-public {
          background: #e6f7f4;
          color: #2d7a6e;
        }
        .fa-follower-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }
        .fa-follower-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 20px;
          background: #f5f0eb;
          font-size: 12px;
          color: #7a6e62;
        }
        .fa-follower-chip-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3bb09e;
        }
        .fa-add-viewer-btn {
          padding: 4px 12px;
          border-radius: 8px;
          border: 1px dashed #d4c8bc;
          background: transparent;
          font-size: 12px;
          color: #9b8474;
          cursor: pointer;
          transition: all 0.15s;
          font-family: var(--font-body);
        }
        .fa-add-viewer-btn:hover {
          background: #f9f6f3;
          border-color: #9b8474;
        }
        /* All members */
        .fa-member-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f5f0eb;
        }
        .fa-member-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .fa-member-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          font-family: var(--font-display);
        }
        .fa-member-info {
          flex: 1;
          min-width: 0;
        }
        .fa-member-name {
          font-size: 14px;
          font-weight: 600;
          color: #2a241f;
        }
        .fa-member-email {
          font-size: 12px;
          color: #9b8474;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .fa-role-badge {
          padding: 3px 10px;
          border-radius: 20px;
          background: #f5f0eb;
          font-size: 11px;
          font-weight: 600;
          color: #9b8474;
          flex-shrink: 0;
        }
        .fa-no-followers {
          font-size: 13px;
          color: #9b8474;
          padding: 8px 0;
        }
      `}</style>

      <div className="fa-page">
        <div className="fa-container">
          <div className="fa-header">
            <div className="fa-header-icon">
              <span role="img" aria-label="heart">&#x2661;</span>
            </div>
            <h1>Family &amp; Access</h1>
            <p>Manage who can view your children&apos;s artwork</p>
          </div>

          {/* Safe & Private banner */}
          <div className="fa-banner">
            <div className="fa-banner-icon">
              <span role="img" aria-label="shield">&#x1F6E1;&#xFE0F;</span>
            </div>
            <div className="fa-banner-text">
              <h3>Safe &amp; Private</h3>
              <p>
                Only people you invite can view your children&apos;s artwork.
                Every profile starts as private. You control who sees what.
              </p>
            </div>
          </div>

          {/* Invite card */}
          <div className="fa-card">
            <div className="fa-card-title">Invite a Viewer</div>
            <div className="fa-invite-form">
              <input
                type="email"
                className="fa-invite-input"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <select
                className="fa-invite-select"
                value={inviteChildId}
                onChange={(e) => setInviteChildId(e.target.value)}
              >
                {kids.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>
              <button
                className="fa-invite-btn"
                disabled={inviting || !inviteEmail.trim()}
                onClick={() => sendInvite(inviteEmail, inviteChildId)}
              >
                {inviting ? "Sending..." : "\uD83D\uDCE8 Invite"}
              </button>
            </div>
            {inviteSuccess && (
              <div className="fa-msg fa-msg-success">{inviteSuccess}</div>
            )}
            {inviteError && (
              <div className="fa-msg fa-msg-error">{inviteError}</div>
            )}
          </div>

          {/* Manage Viewers per Profile */}
          <div className="fa-card">
            <div className="fa-card-title">Manage Viewers per Profile</div>
            {kids.map((kid, index) => (
              <div key={kid.id} className="fa-child-card">
                <div
                  className="fa-child-avatar"
                  style={{
                    background: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
                  }}
                >
                  {kid.name.charAt(0).toUpperCase()}
                </div>
                <div className="fa-child-info">
                  <div className="fa-child-name-row">
                    <span className="fa-child-name">{kid.name}</span>
                    <span
                      className={`fa-badge ${kid.is_public ? "fa-badge-public" : "fa-badge-private"}`}
                    >
                      {kid.is_public ? (
                        <><span role="img" aria-label="public">&#x1F30D;</span> Public</>
                      ) : (
                        <><span role="img" aria-label="private">&#x1F512;</span> Private</>
                      )}
                    </span>
                  </div>
                  {kid.followers.length > 0 ? (
                    <div className="fa-follower-list">
                      {kid.followers.map((f) => (
                        <span key={f.id} className="fa-follower-chip">
                          <span className="fa-follower-chip-dot" />
                          {f.email}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="fa-no-followers">No viewers yet</div>
                  )}
                  <button className="fa-add-viewer-btn">&#xFF0B; Add viewer</button>
                </div>
              </div>
            ))}
          </div>

          {/* All Members */}
          <div className="fa-card">
            <div className="fa-card-title">All Members</div>
            {allMembers.length === 0 ? (
              <div className="fa-no-followers">No members yet. Invite someone above!</div>
            ) : (
              allMembers.map((member, index) => (
                <div key={member.id} className="fa-member-row">
                  <div
                    className="fa-member-avatar"
                    style={{
                      background: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
                    }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="fa-member-info">
                    <div className="fa-member-name">{member.name}</div>
                    <div className="fa-member-email">{member.email}</div>
                  </div>
                  <span className="fa-role-badge">User</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
