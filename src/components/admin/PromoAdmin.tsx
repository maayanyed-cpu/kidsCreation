"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number;
  current_uses: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export function PromoAdmin({ promoCodes }: { promoCodes: PromoCode[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [maxUses, setMaxUses] = useState("50");
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  async function handleCreate() {
    if (!code.trim()) return;
    setCreating(true);
    await fetch("/api/admin/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.trim().toUpperCase(),
        max_uses: parseInt(maxUses) || 50,
        expires_at: expiresAt || null,
      }),
    });
    setCode("");
    setMaxUses("50");
    setExpiresAt("");
    setCreating(false);
    router.refresh();
  }

  async function handleToggle(id: string, currentActive: boolean) {
    setToggling(id);
    await fetch("/api/admin/promo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !currentActive }),
    });
    setToggling(null);
    router.refresh();
  }

  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#2a241f", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        Promo Codes <span style={{ fontSize: 13, fontWeight: 600, color: "#a89888", background: "#f5f0eb", padding: "2px 10px", borderRadius: 9999 }}>{promoCodes.length}</span>
      </h2>

      {/* Create form */}
      <div style={{ background: "#fffdfb", border: "1px solid #e8e0d8", borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#2a241f", marginBottom: 12 }}>Create New Promo Code</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#a89888", display: "block", marginBottom: 4 }}>CODE</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. LAUNCH50"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e8e0d8", fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}
            />
          </div>
          <div style={{ width: 100 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#a89888", display: "block", marginBottom: 4 }}>MAX USES</label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e8e0d8", fontSize: 14 }}
            />
          </div>
          <div style={{ width: 160 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#a89888", display: "block", marginBottom: 4 }}>EXPIRES</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e8e0d8", fontSize: 14 }}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !code.trim()}
            style={{
              padding: "8px 24px", borderRadius: 8,
              background: "linear-gradient(135deg, #f06449, #ff8566)", color: "#fff",
              fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
              opacity: creating || !code.trim() ? 0.5 : 1,
            }}
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#fffdfb", border: "1px solid #e8e0d8", borderRadius: 12, overflow: "hidden" }}>
          <thead>
            <tr>
              {["Code", "Discount", "Usage", "Status", "Expires", "Created", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", background: "#f5f0eb", color: "#5c5248", fontWeight: 600, fontSize: 12, borderBottom: "1px solid #e8e0d8", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {promoCodes.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f5f0eb" }}>
                <td style={{ padding: "8px 14px", fontWeight: 700, letterSpacing: 0.5 }}>{p.code}</td>
                <td style={{ padding: "8px 14px" }}>{p.discount_percent}%</td>
                <td style={{ padding: "8px 14px" }}>
                  <span style={{ fontWeight: 700, color: p.current_uses >= p.max_uses ? "#ef4444" : "#2a9182" }}>{p.current_uses}</span>
                  <span style={{ color: "#a89888" }}> / {p.max_uses}</span>
                </td>
                <td style={{ padding: "8px 14px" }}>
                  <span style={{
                    padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                    background: p.active ? "#d4f1eb" : "#fee2e2",
                    color: p.active ? "#1e7368" : "#dc2626",
                  }}>
                    {p.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td style={{ padding: "8px 14px", color: "#5c5248" }}>{p.expires_at ?? "Never"}</td>
                <td style={{ padding: "8px 14px", color: "#5c5248" }}>{p.created_at}</td>
                <td style={{ padding: "8px 14px" }}>
                  <button
                    onClick={() => handleToggle(p.id, p.active)}
                    disabled={toggling === p.id}
                    style={{
                      padding: "4px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                      border: "1px solid #e8e0d8", background: "#f5f0eb", cursor: "pointer",
                      opacity: toggling === p.id ? 0.5 : 1,
                    }}
                  >
                    {p.active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
            {promoCodes.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 20, textAlign: "center", color: "#a89888" }}>No promo codes yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
