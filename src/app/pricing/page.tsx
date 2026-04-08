"use client";

import { useState } from "react";
import Link from "next/link";

type BillingCycle = "monthly" | "yearly";

const PLANS = [
  {
    name: "Free",
    emoji: "🌱",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "2 kid profiles",
      "50 uploads / month",
      "3 family members",
      "Basic gallery",
      "Weekly challenges",
    ],
    cta: "Current Plan",
    highlight: false,
    tier: "free",
  },
  {
    name: "Pro",
    emoji: "🌟",
    monthlyPrice: 7.99,
    yearlyPrice: 59.99,
    features: [
      "Unlimited kid profiles",
      "Unlimited uploads",
      "Unlimited family members",
      "AI Growth Reports",
      "Priority support",
      "Advanced insights",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
    tier: "pro",
  },
  {
    name: "Family",
    emoji: "💎",
    monthlyPrice: 12.99,
    yearlyPrice: 99.99,
    features: [
      "Everything in Pro",
      "2 parent accounts",
      "Printable art books",
      "Family timeline",
      "Custom domain gallery",
      "Early access to features",
    ],
    cta: "Upgrade to Family",
    highlight: false,
    tier: "family",
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [promoInput, setPromoInput] = useState("");
  const [promoState, setPromoState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [promoError, setPromoError] = useState("");
  const [redeemedPlan, setRedeemedPlan] = useState("");

  async function handleRedeem() {
    if (!promoInput.trim()) return;
    setPromoState("loading");
    setPromoError("");

    try {
      const res = await fetch("/api/promo/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPromoState("error");
        setPromoError(data.error || "Something went wrong");
        return;
      }

      setPromoState("success");
      setRedeemedPlan(data.plan);
    } catch {
      setPromoState("error");
      setPromoError("Network error. Please try again.");
    }
  }

  return (
    <>
      <style>{pricingCSS}</style>
      <div className="pricing-page">
        <header className="pricing-topbar">
          <Link href="/" className="pricing-brand">
            <div className="pricing-brand-mark">✦</div>
            <span className="pricing-brand-name">Arti<em>Steps</em></span>
          </Link>
          <Link href="/gallery" className="pricing-back">Back to App</Link>
        </header>

        <div className="pricing-hero">
          <h1>Choose Your Plan</h1>
          <p>Preserve every masterpiece. Share with family. Watch your little artists grow.</p>

          <div className="billing-toggle">
            <button
              className={billing === "monthly" ? "active" : ""}
              onClick={() => setBilling("monthly")}
            >Monthly</button>
            <button
              className={billing === "yearly" ? "active" : ""}
              onClick={() => setBilling("yearly")}
            >
              Yearly <span className="save-badge">Save 37%</span>
            </button>
          </div>
        </div>

        <div className="plans-grid">
          {PLANS.map((plan) => {
            const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const isRedeemed = promoState === "success" && redeemedPlan === plan.tier;
            return (
              <div key={plan.name} className={`plan-card${plan.highlight ? " featured" : ""}${isRedeemed ? " redeemed" : ""}`}>
                {plan.highlight && <div className="popular-badge">Most Popular</div>}
                {isRedeemed && <div className="redeemed-badge">Active</div>}
                <div className="plan-emoji">{plan.emoji}</div>
                <h2 className="plan-name">{plan.name}</h2>
                <div className="plan-price">
                  {price === 0 ? (
                    <span className="price-amount">Free</span>
                  ) : (
                    <>
                      <span className="price-currency">$</span>
                      <span className="price-amount">{price}</span>
                      <span className="price-period">/{billing === "monthly" ? "mo" : "yr"}</span>
                    </>
                  )}
                </div>
                <ul className="plan-features">
                  {plan.features.map((f) => (
                    <li key={f}><span className="check">✓</span> {f}</li>
                  ))}
                </ul>
                <button
                  className={`plan-cta${plan.highlight ? " primary" : ""}`}
                  disabled={plan.tier === "free" || isRedeemed}
                >
                  {isRedeemed ? "Unlocked!" : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Promo Code Section */}
        <div className="promo-section">
          {promoState === "success" ? (
            <div className="promo-success">
              <span className="promo-success-emoji">🎉</span>
              <div className="promo-success-title">You&apos;re in! Full access unlocked</div>
              <div className="promo-success-desc">
                Your <strong>Pro</strong> plan is now active. Enjoy unlimited uploads, AI Growth Reports, and more.
              </div>
            </div>
          ) : (
            <>
              <h3>Have a promo code?</h3>
              <div className="promo-row">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoState("idle"); setPromoError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
                  className={promoState === "error" ? "promo-error" : ""}
                />
                <button onClick={handleRedeem} disabled={promoState === "loading" || !promoInput.trim()}>
                  {promoState === "loading" ? "Checking..." : "Apply"}
                </button>
              </div>
              {promoState === "error" && <div className="promo-error-msg">{promoError}</div>}
            </>
          )}
        </div>

        <div className="pricing-footer">
          <p>All plans include end-to-end encryption and family-safe sharing.</p>
          <p>Questions? Contact us at <strong>hello@artisteps.app</strong></p>
        </div>
      </div>
    </>
  );
}

const pricingCSS = `
  .pricing-page {
    min-height: 100vh; background: #faf8f5;
    font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
  }

  /* ── TOP BAR ── */
  .pricing-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px; border-bottom: 1px solid #e8e0d8;
  }
  .pricing-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .pricing-brand-mark {
    width: 32px; height: 32px; border-radius: 9px;
    background: linear-gradient(135deg, #f06449, #ff8566);
    color: #fff; display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700;
  }
  .pricing-brand-name {
    font-family: var(--font-display, 'Fraunces', Georgia, serif);
    font-size: 17px; font-weight: 700; color: #2a241f;
  }
  .pricing-brand-name em { font-style: normal; color: #f06449; }
  .pricing-back {
    font-size: 14px; font-weight: 600; color: #7a6e62;
    text-decoration: none; padding: 6px 16px; border-radius: 8px;
    border: 1px solid #e8e0d8; transition: all 0.2s;
  }
  .pricing-back:hover { background: #f5f0eb; color: #2a241f; }

  /* ── HERO ── */
  .pricing-hero {
    text-align: center; padding: 48px 24px 32px;
  }
  .pricing-hero h1 {
    font-family: var(--font-display, 'Fraunces', Georgia, serif);
    font-size: 36px; font-weight: 800; color: #2a241f; margin-bottom: 8px;
  }
  .pricing-hero p { font-size: 16px; color: #7a6e62; margin-bottom: 28px; }

  /* ── BILLING TOGGLE ── */
  .billing-toggle {
    display: inline-flex; background: #f5f0eb; border-radius: 12px;
    padding: 4px; gap: 4px;
  }
  .billing-toggle button {
    padding: 8px 24px; border-radius: 10px; font-size: 14px; font-weight: 600;
    color: #7a6e62; background: transparent; border: none; cursor: pointer;
    transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .billing-toggle button.active {
    background: #fff; color: #2a241f;
    box-shadow: 0 1px 3px rgba(42,36,31,0.08);
  }
  .save-badge {
    font-size: 11px; font-weight: 700; color: #2a9182;
    background: #d4f1eb; padding: 2px 8px; border-radius: 999px;
  }

  /* ── PLANS GRID ── */
  .plans-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 20px; max-width: 960px; margin: 0 auto; padding: 0 24px 40px;
  }
  .plan-card {
    background: #fffdfb; border: 1px solid #e8e0d8; border-radius: 20px;
    padding: 32px 24px; text-align: center; position: relative;
    transition: all 0.3s ease;
  }
  .plan-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(42,36,31,0.08); }
  .plan-card.featured {
    border-color: #f06449; background: linear-gradient(180deg, #fff5f2 0%, #fffdfb 40%);
    box-shadow: 0 8px 24px rgba(240,100,73,0.12);
  }
  .plan-card.redeemed {
    border-color: #3bb09e; background: linear-gradient(180deg, #f0faf8 0%, #fffdfb 40%);
  }
  .popular-badge {
    position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
    padding: 4px 16px; background: linear-gradient(135deg, #f06449, #ff8566);
    color: #fff; border-radius: 999px; font-size: 12px; font-weight: 700;
    white-space: nowrap;
  }
  .redeemed-badge {
    position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
    padding: 4px 16px; background: linear-gradient(135deg, #3bb09e, #6cc9b8);
    color: #fff; border-radius: 999px; font-size: 12px; font-weight: 700;
  }
  .plan-emoji { font-size: 40px; margin-bottom: 12px; }
  .plan-name {
    font-family: var(--font-display, 'Fraunces', Georgia, serif);
    font-size: 22px; font-weight: 700; color: #2a241f; margin-bottom: 8px;
  }
  .plan-price { margin-bottom: 20px; display: flex; align-items: baseline; justify-content: center; gap: 2px; }
  .price-currency { font-size: 18px; font-weight: 700; color: #5c5248; }
  .price-amount {
    font-family: var(--font-display, 'Fraunces', Georgia, serif);
    font-size: 42px; font-weight: 800; color: #2a241f; line-height: 1;
  }
  .price-period { font-size: 15px; color: #a89888; font-weight: 500; }

  .plan-features {
    list-style: none; padding: 0; margin: 0 0 24px; text-align: left;
  }
  .plan-features li {
    padding: 6px 0; font-size: 14px; color: #5c5248;
    display: flex; align-items: center; gap: 8px;
  }
  .check { color: #3bb09e; font-weight: 700; font-size: 15px; flex-shrink: 0; }

  .plan-cta {
    width: 100%; padding: 12px; border-radius: 12px;
    font-size: 15px; font-weight: 700; cursor: pointer;
    border: 1px solid #e8e0d8; background: #f5f0eb; color: #5c5248;
    transition: all 0.2s;
  }
  .plan-cta:hover:not(:disabled) { background: #e8e0d8; }
  .plan-cta.primary {
    background: linear-gradient(135deg, #f06449, #ff8566); color: #fff;
    border: none; box-shadow: 0 4px 12px rgba(240,100,73,0.2);
  }
  .plan-cta.primary:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(240,100,73,0.3); transform: translateY(-1px); }
  .plan-cta:disabled { opacity: 0.6; cursor: default; transform: none !important; }

  /* ── PROMO SECTION ── */
  .promo-section {
    max-width: 520px; margin: 0 auto 48px; padding: 0 24px; text-align: center;
  }
  .promo-section h3 {
    font-family: var(--font-display, 'Fraunces', Georgia, serif);
    font-size: 18px; font-weight: 700; color: #2a241f; margin-bottom: 12px;
  }
  .promo-row { display: flex; gap: 10px; }
  .promo-row input {
    flex: 1; padding: 12px 16px; border-radius: 12px;
    border: 1px solid #e8e0d8; font-size: 15px; font-weight: 600;
    color: #2a241f; background: #fffdfb; letter-spacing: 1px;
    text-transform: uppercase; outline: none; transition: border-color 0.2s;
  }
  .promo-row input:focus { border-color: #f06449; }
  .promo-row input.promo-error { border-color: #ef4444; }
  .promo-row button {
    padding: 12px 28px; border-radius: 12px;
    background: linear-gradient(135deg, #f06449, #ff8566); color: #fff;
    font-size: 15px; font-weight: 700; border: none; cursor: pointer;
    transition: all 0.2s; white-space: nowrap;
  }
  .promo-row button:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(240,100,73,0.25); }
  .promo-row button:disabled { opacity: 0.5; cursor: default; }
  .promo-error-msg { color: #ef4444; font-size: 13px; font-weight: 600; margin-top: 8px; text-align: left; }

  .promo-success {
    background: linear-gradient(135deg, #f0faf8, #d4f1eb);
    border: 1px solid #a8e3d7; border-radius: 20px; padding: 32px;
  }
  .promo-success-emoji { font-size: 48px; display: block; margin-bottom: 12px; }
  .promo-success-title {
    font-family: var(--font-display, 'Fraunces', Georgia, serif);
    font-size: 22px; font-weight: 700; color: #1e7368; margin-bottom: 8px;
  }
  .promo-success-desc { font-size: 15px; color: #2a9182; line-height: 1.6; }
  .promo-success-desc strong { color: #1e7368; }

  /* ── FOOTER ── */
  .pricing-footer {
    text-align: center; padding: 0 24px 48px;
    font-size: 13px; color: #a89888; line-height: 1.8;
  }
  .pricing-footer strong { color: #7a6e62; }

  @media (max-width: 768px) {
    .plans-grid { grid-template-columns: 1fr; max-width: 400px; }
    .pricing-hero h1 { font-size: 28px; }
    .price-amount { font-size: 36px; }
  }
`;
