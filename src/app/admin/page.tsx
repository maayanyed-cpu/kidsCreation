import { prisma } from "@/lib/db/prisma";
import { PromoAdmin } from "@/components/admin/PromoAdmin";

export const dynamic = "force-dynamic";

function TableSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#2a241f", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        {title} <span style={{ fontSize: 13, fontWeight: 600, color: "#a89888", background: "#f5f0eb", padding: "2px 10px", borderRadius: 9999 }}>{count}</span>
      </h2>
      <div style={{ overflowX: "auto" }}>{children}</div>
    </section>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number | null | undefined)[][] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#fffdfb", border: "1px solid #e8e0d8", borderRadius: 12, overflow: "hidden" }}>
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h} style={{ textAlign: "left", padding: "10px 14px", background: "#f5f0eb", color: "#5c5248", fontWeight: 600, fontSize: 12, borderBottom: "1px solid #e8e0d8", whiteSpace: "nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #f5f0eb" }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: "8px 14px", color: "#3d352e", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {cell ?? <span style={{ color: "#d4c8bc" }}>null</span>}
              </td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={headers.length} style={{ padding: 20, textAlign: "center", color: "#a89888" }}>No records</td></tr>
        )}
      </tbody>
    </table>
  );
}

function fmtDate(d: Date | null | undefined) {
  if (!d) return null;
  return d.toISOString().slice(0, 16).replace("T", " ");
}

function truncate(s: string | null | undefined, max = 60) {
  if (!s) return null;
  return s.length > max ? s.slice(0, max) + "..." : s;
}

export default async function AdminPage() {
  const [users, children, artworks, reactions, comments, challenges, submissions, insights, followers, follows, familyInvites, points, pointsHistory, promoCodes, subscriptions] = await Promise.all([
    prisma.user.findMany({ orderBy: { created_at: "desc" } }),
    prisma.child.findMany({ orderBy: { created_at: "desc" } }),
    prisma.artworkAnalysis.findMany({ orderBy: { analysis_date: "desc" } }),
    prisma.reaction.findMany({ orderBy: { created_at: "desc" } }),
    prisma.comment.findMany({ orderBy: { created_at: "desc" } }),
    prisma.challenge.findMany({ orderBy: { week_start: "desc" } }),
    prisma.challengeSubmission.findMany({ orderBy: { created_at: "desc" } }),
    prisma.insights.findMany({ orderBy: { created_at: "desc" } }),
    prisma.follower.findMany({ orderBy: { created_at: "desc" } }),
    prisma.follow.findMany({ orderBy: { created_at: "desc" } }),
    prisma.familyInvite.findMany({ orderBy: { created_at: "desc" } }),
    prisma.points.findMany(),
    prisma.pointsHistory.findMany({ orderBy: { created_at: "desc" } }),
    prisma.promoCode.findMany({ orderBy: { created_at: "desc" } }),
    prisma.userSubscription.findMany({ orderBy: { created_at: "desc" } }),
  ]);

  return (
    <>
      <style>{`
        .admin-page { max-width: 1100px; margin: 0 auto; padding: 36px 24px 80px; }
        .admin-header { margin-bottom: 32px; }
        .admin-header h1 { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: #2a241f; }
        .admin-header p { font-size: 14px; color: #a89888; margin-top: 4px; }
        .admin-stats { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 32px; }
        .admin-stat { background: #fffdfb; border: 1px solid #e8e0d8; border-radius: 12px; padding: 14px 20px; text-align: center; min-width: 110px; }
        .admin-stat-num { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: #f06449; }
        .admin-stat-label { font-size: 11px; font-weight: 600; color: #a89888; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
      `}</style>
      <div className="admin-page">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>View all data across all database tables</p>
        </div>

        <div className="admin-stats">
          {[
            { label: "Users", count: users.length },
            { label: "Kids", count: children.length },
            { label: "Creations", count: artworks.length },
            { label: "Reactions", count: reactions.length },
            { label: "Comments", count: comments.length },
            { label: "Challenges", count: challenges.length },
            { label: "Submissions", count: submissions.length },
            { label: "Insights", count: insights.length },
            { label: "Invites", count: familyInvites.length },
            { label: "Followers", count: followers.length },
            { label: "Points Logs", count: pointsHistory.length },
            { label: "Promo Codes", count: promoCodes.length },
            { label: "Subscriptions", count: subscriptions.length },
          ].map((s) => (
            <div key={s.label} className="admin-stat">
              <div className="admin-stat-num">{s.count}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <TableSection title="Users" count={users.length}>
          <Table
            headers={["ID", "Name", "Email", "Locale", "Onboarded", "Created"]}
            rows={users.map((u) => [u.id, u.name, u.email, u.locale, u.onboarding_complete ? "Yes" : "No", fmtDate(u.created_at)])}
          />
        </TableSection>

        <TableSection title="Kids (Children)" count={children.length}>
          <Table
            headers={["ID", "Name", "Name (HE)", "Emoji", "Color", "Share Code", "DOB", "Public", "Parent ID"]}
            rows={children.map((c) => [c.id, c.name, c.name_he, c.avatar_emoji, c.avatar_color, c.share_code, fmtDate(c.date_of_birth), c.is_public ? "Yes" : "No", c.parent_id])}
          />
        </TableSection>

        <TableSection title="Creations (Artworks)" count={artworks.length}>
          <Table
            headers={["Artwork ID", "Child ID", "Title", "Tone", "Subjects", "Colors", "Status", "Date"]}
            rows={artworks.map((a) => [a.artwork_id, a.child_id, a.title, a.emotional_tone, truncate(a.main_subjects), truncate(a.predominant_colors), a.status, fmtDate(a.analysis_date)])}
          />
        </TableSection>

        <TableSection title="Reactions" count={reactions.length}>
          <Table
            headers={["ID", "Artwork ID", "User Type", "User ID", "Emoji", "Created"]}
            rows={reactions.map((r) => [r.id, r.artwork_id, r.user_type, r.user_id, r.emoji, fmtDate(r.created_at)])}
          />
        </TableSection>

        <TableSection title="Comments" count={comments.length}>
          <Table
            headers={["ID", "Artwork ID", "Author", "Text", "Approved", "Created"]}
            rows={comments.map((c) => [c.id, c.artwork_id, c.author_name, truncate(c.text), c.approved ? "Yes" : "No", fmtDate(c.created_at)])}
          />
        </TableSection>

        <TableSection title="Challenges" count={challenges.length}>
          <Table
            headers={["ID", "Title", "Emoji", "Category", "Difficulty", "Active", "Week Start", "Week End"]}
            rows={challenges.map((c) => [c.id, c.title, c.emoji, c.category, c.difficulty, c.active ? "Yes" : "No", fmtDate(c.week_start), fmtDate(c.week_end)])}
          />
        </TableSection>

        <TableSection title="Challenge Submissions" count={submissions.length}>
          <Table
            headers={["ID", "Challenge ID", "Child ID", "Artwork ID", "Created"]}
            rows={submissions.map((s) => [s.id, s.challenge_id, s.child_id, s.artwork_id, fmtDate(s.created_at)])}
          />
        </TableSection>

        <TableSection title="Insights" count={insights.length}>
          <Table
            headers={["ID", "Child ID", "Period", "Sentiment", "Top Interest", "Milestone", "Created"]}
            rows={insights.map((i) => [i.id, i.child_id, i.analysis_period, i.sentiment, i.top_interest, truncate(i.milestone_detected, 50), fmtDate(i.created_at)])}
          />
        </TableSection>

        <TableSection title="Family Invites" count={familyInvites.length}>
          <Table
            headers={["ID", "Email", "Kid ID", "Invited By", "Status", "Created"]}
            rows={familyInvites.map((fi) => [fi.id, fi.email, fi.kid_id, fi.invited_by, fi.status, fmtDate(fi.created_at)])}
          />
        </TableSection>

        <TableSection title="Followers" count={followers.length}>
          <Table
            headers={["ID", "Email", "Name", "Created"]}
            rows={followers.map((f) => [f.id, f.email, f.name, fmtDate(f.created_at)])}
          />
        </TableSection>

        <TableSection title="Follows" count={follows.length}>
          <Table
            headers={["ID", "Follower ID", "Child ID", "Created", "Last Notified"]}
            rows={follows.map((f) => [f.id, f.follower_id, f.child_id, fmtDate(f.created_at), fmtDate(f.last_notified_at)])}
          />
        </TableSection>

        <TableSection title="Points" count={points.length}>
          <Table
            headers={["ID", "User ID", "Total Points", "Tier", "Created"]}
            rows={points.map((p) => [p.id, p.user_id, p.total_points, p.tier, fmtDate(p.created_at)])}
          />
        </TableSection>

        <TableSection title="Points History" count={pointsHistory.length}>
          <Table
            headers={["ID", "User ID", "Action", "Points", "Description", "Created"]}
            rows={pointsHistory.map((ph) => [ph.id, ph.user_id, ph.action, ph.points_earned, truncate(ph.description), fmtDate(ph.created_at)])}
          />
        </TableSection>

        <PromoAdmin
          promoCodes={promoCodes.map((p) => ({
            id: p.id,
            code: p.code,
            discount_percent: p.discount_percent,
            max_uses: p.max_uses,
            current_uses: p.current_uses,
            active: p.active,
            expires_at: p.expires_at ? fmtDate(p.expires_at) : null,
            created_at: fmtDate(p.created_at) ?? "",
          }))}
        />

        <TableSection title="Subscriptions" count={subscriptions.length}>
          <Table
            headers={["ID", "User ID", "Plan", "Promo Code ID", "Created"]}
            rows={subscriptions.map((s) => [s.id, s.user_id, s.plan, s.promo_code_id, fmtDate(s.created_at)])}
          />
        </TableSection>
      </div>
    </>
  );
}
