"use client";

interface RecentActivity {
  id: string;
  type: "upload" | "invite" | "challenge" | "reaction";
  emoji: string;
  label: string;
  highlight: string;
  time: string;
  points: number;
}

interface PointsPageProps {
  total: number;
  tier: string;
  recentActivity: RecentActivity[];
}

function getTier(total: number) {
  if (total >= 1000) return { tier: "Master Guardian", emoji: "💎", nextTier: null, nextTierAt: null, tierStart: 1000 };
  if (total >= 500)  return { tier: "Star Curator", emoji: "🌟", nextTier: "Master Guardian", nextTierAt: 1000, tierStart: 500 };
  if (total >= 100)  return { tier: "Creative Explorer", emoji: "🎨", nextTier: "Star Curator", nextTierAt: 500, tierStart: 100 };
  return { tier: "Budding Artist", emoji: "🌱", nextTier: "Creative Explorer", nextTierAt: 100, tierStart: 0 };
}

const TIERS = [
  { name: "Budding Artist", emoji: "🌱", range: "0 – 99 pts", perk: "Just getting started!", min: 0, max: 99 },
  { name: "Creative Explorer", emoji: "🎨", range: "100 – 499 pts", perk: "Growing your family's gallery", min: 100, max: 499 },
  { name: "Star Curator", emoji: "🌟", range: "500 – 999 pts", perk: "A dedicated art-loving parent", min: 500, max: 999 },
  { name: "Master Guardian", emoji: "💎", range: "1,000+ pts", perk: "Top-tier memory keeper", min: 1000, max: Infinity },
];

const EARN_CARDS = [
  { emoji: "🎨", color: "coral", title: "Upload a Creation", desc: "Upload a drawing, song, or dance video for any of your kids", pts: 10 },
  { emoji: "👨‍👩‍👧", color: "teal", title: "Invite Family", desc: "Invite a family member who accepts and joins the app", pts: 25 },
  { emoji: "🏆", color: "gold", title: "Complete a Challenge", desc: "Submit an entry for a weekly creative challenge", pts: 20 },
  { emoji: "💬", color: "lav", title: "Encourage Others", desc: "Leave kind comments on other kids' shared creations", pts: 5 },
  { emoji: "👶", color: "coral", title: "Add a Kid Profile", desc: "Create a new profile for one of your children", pts: 15 },
  { emoji: "📅", color: "teal", title: "Daily Upload Streak", desc: "Upload at least one creation 3 days in a row", pts: 30 },
];

const TOASTS = [
  { emoji: "🎨", title: "Creation uploaded!", desc: "Zohar's drawing is now in the gallery", pts: 10, label: "After uploading a creation" },
  { emoji: "🎉", title: "Family member joined!", desc: "Grandma accepted your invitation", pts: 25, label: "When an invite is accepted" },
  { emoji: "🏆", title: "Challenge completed!", desc: "Arad placed 2nd in \"Dream House\"", pts: 20, label: "After completing a challenge" },
];

export function PointsPage({ total, tier, recentActivity }: PointsPageProps) {
  const tierInfo = getTier(total);
  const progressPct = tierInfo.nextTierAt
    ? Math.min(100, Math.round(((total - tierInfo.tierStart) / (tierInfo.nextTierAt - tierInfo.tierStart)) * 100))
    : 100;

  return (
    <>
      <style>{`
        /* ── POINTS PAGE ── */
        .points-page { padding: 36px 40px 60px; max-width: 900px; }

        .page-header-pts { margin-bottom: 32px; }
        .page-header-pts h1 {
          font-family: var(--font-display);
          font-size: 28px; font-weight: 700; color: #2a241f;
          display: flex; align-items: center; gap: 10px;
        }
        .page-header-pts p { font-size: 15px; color: #a89888; margin-top: 4px; }

        /* ── POINTS HERO CARD ── */
        .points-hero {
          background: linear-gradient(135deg, #fffbeb 0%, #fff5f2 50%, #f0faf8 100%);
          border: 1px solid #fef3c7;
          border-radius: 24px; padding: 32px; margin-bottom: 28px;
          display: flex; align-items: center; gap: 32px;
          position: relative; overflow: hidden;
        }
        .points-hero::before {
          content: ''; position: absolute; top: -40px; right: -40px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%);
        }
        .points-circle {
          width: 120px; height: 120px; border-radius: 50%; flex-shrink: 0;
          background: #fffdfb; border: 4px solid #fbbf24;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(251,191,36,0.2); position: relative;
        }
        .points-circle-num {
          font-family: var(--font-display); font-size: 36px; font-weight: 800;
          color: #d97706; line-height: 1;
        }
        .points-circle-label {
          font-size: 11px; font-weight: 600; color: #f59e0b;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .points-info { flex: 1; position: relative; z-index: 1; }
        .points-tier-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 14px; background: #fef3c7;
          border-radius: 9999px; font-size: 13px; font-weight: 700;
          color: #d97706; margin-bottom: 10px;
        }
        .points-info h2 {
          font-family: var(--font-display); font-size: 22px; font-weight: 700;
          color: #2a241f; margin-bottom: 4px;
        }
        .points-info p {
          font-size: 14px; color: #7a6e62; margin-bottom: 14px; line-height: 1.5;
        }
        .points-progress { display: flex; align-items: center; gap: 12px; }
        .points-bar {
          flex: 1; height: 10px; background: #f5f0eb;
          border-radius: 9999px; overflow: hidden;
        }
        .points-bar-fill {
          height: 100%; border-radius: 9999px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          transition: width 0.8s ease;
        }
        .points-next-tier {
          font-size: 12px; font-weight: 600; color: #a89888; white-space: nowrap;
        }

        /* ── HOW TO EARN ── */
        .earn-section { margin-bottom: 28px; }
        .section-title-pts {
          font-family: var(--font-display); font-size: 20px; font-weight: 700;
          color: #2a241f; margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .earn-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .earn-card {
          background: #fffdfb; border: 1px solid #e8e0d8;
          border-radius: 20px; padding: 18px;
          display: flex; align-items: flex-start; gap: 14px;
          transition: all 0.25s ease;
        }
        .earn-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(42,36,31,0.06); }
        .earn-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .earn-icon.coral { background: #fff5f2; }
        .earn-icon.teal { background: #f0faf8; }
        .earn-icon.gold { background: #fffbeb; }
        .earn-icon.lav { background: #f8f5ff; }
        .earn-info h4 { font-size: 14px; font-weight: 700; color: #2a241f; margin-bottom: 2px; }
        .earn-info p { font-size: 13px; color: #a89888; line-height: 1.4; margin-bottom: 6px; }
        .earn-pts {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 13px; font-weight: 700; color: #d97706;
          background: #fffbeb; padding: 2px 10px; border-radius: 9999px;
        }

        /* ── TIERS ── */
        .tiers-section { margin-bottom: 28px; }
        .tiers-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .tier-card {
          text-align: center; padding: 20px 14px;
          background: #fffdfb; border: 1px solid #e8e0d8;
          border-radius: 20px; transition: all 0.25s; position: relative;
        }
        .tier-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(42,36,31,0.06); }
        .tier-card.current {
          border-color: #fbbf24; background: #fffbeb;
          box-shadow: 0 8px 24px rgba(251,191,36,0.2);
        }
        .tier-card.current::after {
          content: 'You are here'; position: absolute; top: -10px; left: 50%;
          transform: translateX(-50%);
          padding: 2px 10px; background: #fbbf24; color: #fff;
          border-radius: 9999px; font-size: 10px; font-weight: 700; white-space: nowrap;
        }
        .tier-card.locked { opacity: 0.5; }
        .tier-emoji { font-size: 32px; margin-bottom: 8px; display: block; }
        .tier-name { font-size: 14px; font-weight: 700; color: #2a241f; margin-bottom: 2px; }
        .tier-range { font-size: 12px; color: #a89888; margin-bottom: 8px; }
        .tier-perk { font-size: 12px; color: #1e7368; font-weight: 500; line-height: 1.4; }

        /* ── RECENT POINTS ACTIVITY ── */
        .activity-section { margin-bottom: 28px; }
        .activity-list {
          background: #fffdfb; border: 1px solid #e8e0d8;
          border-radius: 20px; overflow: hidden;
        }
        .activity-item {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 18px; border-bottom: 1px solid #f5f0eb;
        }
        .activity-item:last-child { border-bottom: none; }
        .activity-icon-a {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .activity-icon-a.upload { background: #fff5f2; }
        .activity-icon-a.invite { background: #f0faf8; }
        .activity-icon-a.challenge { background: #fffbeb; }
        .activity-icon-a.reaction { background: #f8f5ff; }
        .activity-text { flex: 1; font-size: 14px; color: #5c5248; }
        .activity-text strong { color: #2a241f; }
        .activity-time { font-size: 12px; color: #d4c8bc; white-space: nowrap; }
        .activity-pts {
          font-size: 14px; font-weight: 700; color: #2a9182; white-space: nowrap;
        }

        /* ── SUCCESS TOASTS (mockups) ── */
        .toast-section { margin-bottom: 28px; }
        .toast-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .toast-mockup {
          border-radius: 20px; overflow: hidden;
          border: 1px solid #e8e0d8;
        }
        .toast-screen {
          background: #f5f0eb; padding: 20px; min-height: 160px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .toast-popup {
          background: #fffdfb; border-radius: 16px;
          padding: 16px 20px; box-shadow: 0 12px 24px rgba(42,36,31,0.08);
          text-align: center; max-width: 240px; width: 100%;
          border: 1px solid #e8e0d8;
        }
        .toast-popup .tp-emoji { font-size: 32px; margin-bottom: 8px; display: block; }
        .toast-popup .tp-title { font-size: 15px; font-weight: 700; color: #2a241f; margin-bottom: 4px; }
        .toast-popup .tp-desc { font-size: 13px; color: #7a6e62; margin-bottom: 8px; }
        .toast-popup .tp-points {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 14px; background: #fffbeb; border: 1px solid #fef3c7;
          border-radius: 9999px; font-size: 14px; font-weight: 700; color: #d97706;
        }
        .toast-label {
          padding: 10px 14px; font-size: 12px; font-weight: 600;
          color: #a89888; background: #fffdfb; text-align: center;
        }

        @media (max-width: 768px) {
          .points-page { padding: 24px 16px; }
          .earn-grid, .tiers-row, .toast-grid { grid-template-columns: 1fr; }
          .points-hero { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="points-page">
        <div className="page-header-pts">
          <h1>⭐ My Points</h1>
          <p>Earn points by uploading creations, inviting family, and completing challenges</p>
        </div>

        {/* ═══ POINTS HERO ═══ */}
        <div className="points-hero">
          <div className="points-circle">
            <div className="points-circle-num">{total}</div>
            <div className="points-circle-label">Points</div>
          </div>
          <div className="points-info">
            <div className="points-tier-badge">{tierInfo.emoji} {tierInfo.tier}</div>
            <h2>You&apos;re doing great!</h2>
            <p>
              {tierInfo.nextTier
                ? <>Keep uploading your kids&apos; art and inviting family to reach <strong>{tierInfo.nextTier}</strong> tier</>
                : <>You&apos;ve reached the highest tier! You&apos;re a true memory keeper.</>
              }
            </p>
            <div className="points-progress">
              <div className="points-bar">
                <div className="points-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="points-next-tier">
                {tierInfo.nextTierAt ? `${total} / ${tierInfo.nextTierAt}` : `${total} pts`}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ HOW TO EARN POINTS ═══ */}
        <div className="earn-section">
          <h3 className="section-title-pts">💡 How to Earn Points</h3>
          <div className="earn-grid">
            {EARN_CARDS.map((card) => (
              <div key={card.title} className="earn-card">
                <div className={`earn-icon ${card.color}`}>{card.emoji}</div>
                <div className="earn-info">
                  <h4>{card.title}</h4>
                  <p>{card.desc}</p>
                  <span className="earn-pts">⭐ +{card.pts} {card.pts === 30 ? "bonus" : "pts"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ REWARD TIERS ═══ */}
        <div className="tiers-section">
          <h3 className="section-title-pts">🏅 Reward Tiers</h3>
          <div className="tiers-row">
            {TIERS.map((t) => {
              const isCurrent = total >= t.min && total <= t.max;
              const isLocked = total < t.min;
              return (
                <div
                  key={t.name}
                  className={`tier-card${isCurrent ? " current" : ""}${isLocked ? " locked" : ""}`}
                >
                  <span className="tier-emoji">{t.emoji}</span>
                  <div className="tier-name">{t.name}</div>
                  <div className="tier-range">{t.range}</div>
                  <div className="tier-perk">{t.perk}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ RECENT POINTS ACTIVITY ═══ */}
        <div className="activity-section">
          <h3 className="section-title-pts">📋 Recent Points Activity</h3>
          <div className="activity-list">
            {recentActivity.map((item) => (
              <div key={item.id} className="activity-item">
                <div className={`activity-icon-a ${item.type}`}>{item.emoji}</div>
                <div className="activity-text">
                  <strong>{item.highlight}</strong> {item.label}
                </div>
                <span className="activity-time">{item.time}</span>
                <span className="activity-pts">+{item.points}</span>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="activity-item">
                <div className="activity-text" style={{ textAlign: "center", color: "#a89888" }}>
                  No activity yet. Upload a creation to earn your first points!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ SUCCESS TOAST MOCKUPS ═══ */}
        <div className="toast-section">
          <h3 className="section-title-pts">🎉 Points Pop-ups (how they appear in-app)</h3>
          <div className="toast-grid">
            {TOASTS.map((toast) => (
              <div key={toast.label} className="toast-mockup">
                <div className="toast-screen">
                  <div className="toast-popup">
                    <span className="tp-emoji">{toast.emoji}</span>
                    <div className="tp-title">{toast.title}</div>
                    <div className="tp-desc">{toast.desc}</div>
                    <span className="tp-points">⭐ +{toast.pts} points</span>
                  </div>
                </div>
                <div className="toast-label">{toast.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
