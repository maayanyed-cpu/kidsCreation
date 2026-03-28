"use client";

import { useState } from "react";
import Link from "next/link";

// Real children's artwork from Wikimedia Commons (CC-licensed)
const COLLAGE_IMAGES = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Barnebilde_tegning_med_sol_og_blomster.jpg/400px-Barnebilde_tegning_med_sol_og_blomster.jpg",
    alt: "Child's colorful painting of sun and flowers",
    caption: "Arad, age 6",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Autistic_Child_Drawing_3_Friends.jpg/400px-Autistic_Child_Drawing_3_Friends.jpg",
    alt: "Child's drawing of three friends",
    caption: "Gallery wall",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Art_Gabrielle_6_soon.jpg/400px-Art_Gabrielle_6_soon.jpg",
    alt: "Colorful artwork by a young child",
    caption: "Zohar, age 3",
  },
];

export default function LandingPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");

  return (
    <>
      <style>{landingCSS}</style>
      <div className="landing">
        {/* Top Bar */}
        <header className="top-bar">
          <span className="brand">
            <div className="brand-mark">✦</div>
            <span className="brand-name">
              Arti<em>Steps</em>
            </span>
          </span>
          <nav className="top-links">
            <a href="#features" className="top-link">Features</a>
            <Link href="/dashboard" className="top-link">Dashboard</Link>
          </nav>
        </header>

        {/* Hero Split */}
        <section className="hero-split">
          {/* Left: Value Proposition */}
          <div className="hero-left">
            <span className="hero-tagline">🛡️ Safe, private, and made for families</span>

            <h1 className="hero-heading">
              Every little brushstroke<br />is a <em>memory</em> worth keeping
            </h1>

            <p className="hero-body">
              Your child&apos;s drawings, songs, and dances are more than just art — they&apos;re{" "}
              <strong>windows into their imagination.</strong> Arti Steps helps you
              capture, celebrate, and share these fleeting moments before they disappear
              into the bottom of a drawer.
            </p>

            {/* Photo Collage */}
            <div className="photo-collage">
              {COLLAGE_IMAGES.map((img, i) => (
                <div key={i} className="collage-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} />
                  <div className="caption">{img.caption}</div>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="social-proof">
              <div className="avatar-stack">
                <div className="av av-1">M</div>
                <div className="av av-2">S</div>
                <div className="av av-3">R</div>
                <div className="av av-4">D</div>
              </div>
              <span className="proof-text">
                <strong>2,400+ families</strong> preserving their children&apos;s art
              </span>
            </div>
          </div>

          {/* Right: Auth Card */}
          <div className="hero-right">
            <div className="auth-card">
              {/* Tabs */}
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${tab === "login" ? "active" : ""}`}
                  onClick={() => setTab("login")}
                >
                  Log In
                </button>
                <button
                  className={`auth-tab ${tab === "signup" ? "active" : ""}`}
                  onClick={() => setTab("signup")}
                >
                  Sign Up
                </button>
              </div>

              {/* Login Form */}
              {tab === "login" && (
                <div>
                  <h2 className="auth-welcome">Welcome back 👋</h2>
                  <p className="auth-sub">Continue preserving your child&apos;s creative journey</p>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" placeholder="parent@email.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" placeholder="••••••••" />
                  </div>

                  <div className="form-row">
                    <label className="form-check">
                      <input type="checkbox" defaultChecked /> Remember me
                    </label>
                    <a href="#" className="form-forgot">Forgot password?</a>
                  </div>

                  <button className="btn-auth">Log In</button>
                </div>
              )}

              {/* Sign Up Form */}
              {tab === "signup" && (
                <div>
                  <h2 className="auth-welcome">Start your family&apos;s gallery ✨</h2>
                  <p className="auth-sub">It&apos;s free — preserve your first 50 creations on us</p>

                  <div className="form-group">
                    <label className="form-label">Your name</label>
                    <input type="text" className="form-input" placeholder="Sarah" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" placeholder="parent@email.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" placeholder="At least 8 characters" />
                  </div>

                  <button className="btn-auth">Create My Gallery</button>
                </div>
              )}

              <div className="divider">
                <span>or continue with</span>
              </div>

              <button className="btn-social">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <div className="auth-footer">
                {tab === "login" ? (
                  <>Don&apos;t have an account?{" "}<a href="#" onClick={(e) => { e.preventDefault(); setTab("signup"); }}>Sign up free</a></>
                ) : (
                  <>Already have an account?{" "}<a href="#" onClick={(e) => { e.preventDefault(); setTab("login"); }}>Log in</a></>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Strip */}
        <section className="features-strip" id="features">
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon coral">📸</div>
              <h4>Capture &amp; Preserve</h4>
              <p>Photograph artwork and let AI enhance, tag, and organize it into a beautiful timeline</p>
            </div>
            <div className="feature">
              <div className="feature-icon teal">👨‍👩‍👧</div>
              <h4>Share with Family</h4>
              <p>Invite grandparents, aunties, and loved ones to a private gallery — only kind words allowed</p>
            </div>
            <div className="feature">
              <div className="feature-icon sand">📈</div>
              <h4>Track Growth</h4>
              <p>AI-powered monthly reports showing your child&apos;s creative development and milestones</p>
            </div>
            <div className="feature">
              <div className="feature-icon lav">🏆</div>
              <h4>Weekly Challenges</h4>
              <p>Fun creative prompts that inspire your kids and earn them credits and badges</p>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="testimonial-section">
          <p className="testimonial-quote">
            &ldquo;I used to throw away so many drawings. Now I open Arti Steps and see three years of my daughter&apos;s imagination — it makes me tear up every time.&rdquo;
          </p>
          <p className="testimonial-author">— <strong>Sarah M.</strong>, mom of two</p>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <span>&copy; 2026 Arti Steps &middot; FamilyVibe Labs</span>
          <span>Privacy &middot; Terms &middot; Support</span>
        </footer>
      </div>
    </>
  );
}

const landingCSS = `
  :root {
    --coral-50:#fff5f2;--coral-100:#ffe8e0;--coral-200:#ffc9b8;
    --coral-400:#ff8566;--coral-500:#f06449;--coral-600:#d94f36;
    --teal-50:#f0faf8;--teal-100:#d4f1eb;--teal-400:#3bb09e;--teal-500:#2a9182;--teal-600:#1e7368;
    --sand-50:#fefcf8;--sand-100:#fdf6eb;--sand-200:#f8ead0;
    --warm-white:#fffdfb;--cream:#faf8f5;
    --stone-100:#f5f0eb;--stone-200:#e8e0d8;--stone-300:#d4c8bc;
    --stone-400:#a89888;--stone-500:#7a6e62;--stone-600:#5c5248;
    --stone-700:#3d352e;--stone-800:#2a241f;
    --gradient-brand:linear-gradient(135deg,#f06449,#ff8566);
    --gradient-teal:linear-gradient(135deg,#3bb09e,#6cc9b8);
    --shadow-coral:0 8px 24px rgba(240,100,73,0.18);
    --shadow-lg:0 12px 32px rgba(42,36,31,0.1);
    --ld-font-display:'Fraunces',Georgia,serif;
    --ld-font-body:'DM Sans',system-ui,sans-serif;
    --r-sm:8px;--r-md:12px;--r-lg:16px;--r-xl:20px;--r-2xl:24px;--r-full:9999px;
  }

  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap');

  .landing{min-height:100vh;display:flex;flex-direction:column;font-family:var(--ld-font-body);color:var(--stone-700);background:var(--cream)}
  .landing *{box-sizing:border-box}
  .landing a{text-decoration:none;color:inherit}

  .top-bar{
    display:flex;align-items:center;justify-content:space-between;
    padding:16px 40px;
    background:rgba(255,253,251,0.85);
    backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
    border-bottom:1px solid rgba(232,224,216,0.4);
    position:sticky;top:0;z-index:50;
  }
  .brand{display:flex;align-items:center;gap:10px}
  .brand-mark{
    width:38px;height:38px;border-radius:12px;
    background:var(--gradient-brand);color:#fff;
    display:flex;align-items:center;justify-content:center;
    font-size:20px;position:relative;box-shadow:var(--shadow-coral);
  }
  .brand-mark::after{
    content:'';position:absolute;top:-3px;right:-3px;
    width:10px;height:10px;border-radius:50%;
    background:var(--teal-400);border:2.5px solid var(--warm-white);
  }
  .brand-name{
    font-family:var(--ld-font-display);font-size:22px;font-weight:700;color:var(--stone-800);
  }
  .brand-name em{font-style:normal;color:var(--coral-500)}
  .top-links{display:flex;gap:24px;align-items:center}
  .top-link{font-size:14px;font-weight:500;color:var(--stone-500);transition:color 0.2s}
  .top-link:hover{color:var(--stone-800)}

  .hero-split{
    flex:1;display:grid;grid-template-columns:1fr 420px;
    min-height:calc(100vh - 70px);
  }
  .hero-left{
    padding:64px 60px 48px;
    display:flex;flex-direction:column;justify-content:center;
    position:relative;overflow:hidden;
  }
  .hero-left::before{
    content:'';position:absolute;top:-80px;right:-120px;
    width:400px;height:400px;border-radius:50%;
    background:radial-gradient(circle,rgba(240,100,73,0.06) 0%,transparent 70%);
    pointer-events:none;
  }
  .hero-tagline{
    display:inline-flex;align-items:center;gap:6px;
    padding:6px 14px;background:var(--teal-50);border:1px solid var(--teal-100);
    border-radius:var(--r-full);font-size:12px;font-weight:600;
    color:var(--teal-600);width:fit-content;margin-bottom:24px;
  }
  .hero-heading{
    font-family:var(--ld-font-display);font-size:48px;font-weight:800;
    line-height:1.08;color:var(--stone-800);margin-bottom:20px;max-width:540px;
  }
  .hero-heading em{font-style:italic;color:var(--coral-500);font-weight:700}
  .hero-body{
    font-size:18px;line-height:1.65;color:var(--stone-500);
    max-width:480px;margin-bottom:32px;
  }
  .hero-body strong{color:var(--stone-700);font-weight:600}

  .photo-collage{
    display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;
    max-width:520px;margin-bottom:36px;
  }
  .collage-img{
    border-radius:var(--r-lg);overflow:hidden;
    aspect-ratio:3/4;position:relative;
    box-shadow:0 4px 16px rgba(42,36,31,0.08);
    border:3px solid var(--warm-white);
  }
  .collage-img img{width:100%;height:100%;object-fit:cover;display:block}
  .collage-img:nth-child(2){transform:translateY(16px)}
  .collage-img .caption{
    position:absolute;bottom:0;left:0;right:0;
    padding:8px 10px;
    background:linear-gradient(transparent,rgba(42,36,31,0.6));
    color:#fff;font-size:11px;font-weight:600;letter-spacing:0.3px;
  }

  .social-proof{display:flex;align-items:center;gap:16px}
  .avatar-stack{display:flex}
  .avatar-stack .av{
    width:36px;height:36px;border-radius:50%;
    border:2.5px solid var(--warm-white);margin-left:-10px;
    display:flex;align-items:center;justify-content:center;
    color:#fff;font-size:13px;font-weight:700;
  }
  .avatar-stack .av:first-child{margin-left:0}
  .av-1{background:var(--gradient-brand)}
  .av-2{background:var(--gradient-teal)}
  .av-3{background:linear-gradient(135deg,#a78bfa,#c084fc)}
  .av-4{background:linear-gradient(135deg,#ff8566,#f0a830)}
  .proof-text{font-size:14px;color:var(--stone-500)}
  .proof-text strong{color:var(--stone-700)}

  .hero-right{
    background:var(--warm-white);
    border-left:1px solid var(--stone-200);
    padding:48px 40px;
    display:flex;flex-direction:column;justify-content:center;
  }
  .auth-card{max-width:340px;width:100%;margin:0 auto}
  .auth-tabs{
    display:flex;gap:0;margin-bottom:28px;
    background:var(--stone-100);border-radius:var(--r-md);padding:3px;
  }
  .auth-tab{
    flex:1;padding:10px;text-align:center;
    border-radius:var(--r-sm);font-size:14px;font-weight:600;
    color:var(--stone-400);transition:all 0.2s;
    background:none;border:none;cursor:pointer;font-family:inherit;
  }
  .auth-tab.active{
    background:var(--warm-white);color:var(--stone-800);
    box-shadow:0 1px 4px rgba(42,36,31,0.08);
  }
  .auth-tab:hover:not(.active){color:var(--stone-600)}

  .auth-welcome{
    font-family:var(--ld-font-display);font-size:24px;font-weight:700;
    color:var(--stone-800);margin-bottom:6px;
  }
  .auth-sub{font-size:14px;color:var(--stone-400);margin-bottom:24px}

  .form-group{margin-bottom:16px}
  .form-label{
    display:block;font-size:13px;font-weight:600;
    color:var(--stone-600);margin-bottom:6px;
  }
  .form-input{
    width:100%;padding:11px 14px;
    border:1px solid var(--stone-200);border-radius:var(--r-md);
    font-size:14px;color:var(--stone-800);outline:none;
    background:var(--warm-white);transition:border-color 0.2s;
    font-family:inherit;
  }
  .form-input:focus{
    border-color:var(--coral-400);
    box-shadow:0 0 0 3px rgba(240,100,73,0.08);
  }
  .form-input::placeholder{color:var(--stone-300)}

  .form-row{
    display:flex;align-items:center;justify-content:space-between;
    margin-bottom:20px;
  }
  .form-check{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--stone-500)}
  .form-check input{accent-color:var(--coral-500)}
  .form-forgot{font-size:13px;color:var(--coral-500);font-weight:500}
  .form-forgot:hover{text-decoration:underline}

  .btn-auth{
    width:100%;padding:13px;
    background:var(--coral-500);color:#fff;
    border-radius:var(--r-md);font-size:15px;font-weight:600;
    box-shadow:var(--shadow-coral);
    transition:all 0.25s;margin-bottom:16px;
    border:none;cursor:pointer;font-family:inherit;
  }
  .btn-auth:hover{background:var(--coral-600);transform:translateY(-1px)}

  .divider{display:flex;align-items:center;gap:12px;margin-bottom:16px}
  .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--stone-200)}
  .divider span{font-size:12px;color:var(--stone-400);font-weight:500}

  .btn-social{
    width:100%;padding:11px;
    border:1px solid var(--stone-200);border-radius:var(--r-md);
    font-size:14px;font-weight:500;color:var(--stone-600);
    display:flex;align-items:center;justify-content:center;gap:8px;
    transition:all 0.2s;margin-bottom:10px;
    background:var(--warm-white);cursor:pointer;font-family:inherit;
  }
  .btn-social:hover{background:var(--stone-100);border-color:var(--stone-300)}

  .auth-footer{
    text-align:center;margin-top:20px;font-size:13px;color:var(--stone-400);
  }
  .auth-footer a{color:var(--coral-500);font-weight:600;cursor:pointer}
  .auth-footer a:hover{text-decoration:underline}

  .features-strip{
    background:var(--warm-white);border-top:1px solid var(--stone-200);
    padding:48px 60px;
  }
  .features-grid{
    display:grid;grid-template-columns:repeat(4,1fr);gap:32px;
    max-width:1100px;margin:0 auto;
  }
  .feature{text-align:center}
  .feature-icon{
    width:52px;height:52px;border-radius:16px;
    display:flex;align-items:center;justify-content:center;
    font-size:24px;margin:0 auto 12px;
  }
  .feature-icon.coral{background:var(--coral-50);color:var(--coral-500)}
  .feature-icon.teal{background:var(--teal-50);color:var(--teal-500)}
  .feature-icon.sand{background:var(--sand-100);color:var(--stone-600)}
  .feature-icon.lav{background:#f3f0ff;color:#7c3aed}
  .feature h4{font-size:15px;font-weight:700;color:var(--stone-800);margin-bottom:4px}
  .feature p{font-size:13px;color:var(--stone-400);line-height:1.5}

  .testimonial-section{
    background:linear-gradient(160deg,var(--coral-50),var(--sand-50));
    padding:56px 60px;text-align:center;
  }
  .testimonial-quote{
    font-family:var(--ld-font-display);font-style:italic;
    font-size:24px;line-height:1.5;color:var(--stone-700);
    max-width:640px;margin:0 auto 16px;
  }
  .testimonial-author{font-size:14px;color:var(--stone-400);font-weight:500}
  .testimonial-author strong{color:var(--stone-600)}

  .landing-footer{
    padding:24px 60px;border-top:1px solid var(--stone-200);
    display:flex;justify-content:space-between;align-items:center;
    font-size:12px;color:var(--stone-400);background:var(--warm-white);
  }

  @media(max-width:900px){
    .hero-split{grid-template-columns:1fr;min-height:auto}
    .hero-left{padding:40px 24px 32px}
    .hero-right{padding:32px 24px;border-left:none;border-top:1px solid var(--stone-200)}
    .hero-heading{font-size:34px}
    .photo-collage{max-width:100%}
    .features-grid{grid-template-columns:repeat(2,1fr);gap:20px}
    .features-strip,.testimonial-section{padding:32px 24px}
    .top-bar{padding:12px 20px}
    .top-links{display:none}
  }
`;
