"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem("pwa-dismissed")) {
      setDismissed(true);
      return;
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem("pwa-dismissed", "1");
  }

  if (installed || dismissed || !deferredPrompt) return null;

  return (
    <>
      <style>{`
        .pwa-banner {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
          background: linear-gradient(135deg, #f06449, #ff8566);
          color: #fff; padding: 14px 20px;
          display: flex; align-items: center; gap: 14px;
          box-shadow: 0 -4px 20px rgba(240,100,73,0.3);
          animation: pwa-slide-up 0.4s ease-out;
        }
        @keyframes pwa-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .pwa-banner-icon { font-size: 28px; flex-shrink: 0; }
        .pwa-banner-text { flex: 1; }
        .pwa-banner-title { font-weight: 700; font-size: 15px; margin-bottom: 2px; }
        .pwa-banner-desc { font-size: 13px; opacity: 0.9; }
        .pwa-banner-install {
          padding: 8px 20px; border-radius: 10px;
          background: #fff; color: #f06449;
          font-size: 14px; font-weight: 700;
          border: none; cursor: pointer; white-space: nowrap;
          transition: transform 0.2s;
        }
        .pwa-banner-install:hover { transform: scale(1.05); }
        .pwa-banner-close {
          background: none; border: none; color: rgba(255,255,255,0.7);
          font-size: 20px; cursor: pointer; padding: 4px; line-height: 1;
        }
        .pwa-banner-close:hover { color: #fff; }
        @media (max-width: 480px) {
          .pwa-banner { flex-wrap: wrap; gap: 10px; padding: 12px 16px; }
          .pwa-banner-install { width: 100%; text-align: center; }
        }
      `}</style>
      <div className="pwa-banner">
        <span className="pwa-banner-icon">✦</span>
        <div className="pwa-banner-text">
          <div className="pwa-banner-title">Add Arti Steps to Home Screen</div>
          <div className="pwa-banner-desc">Quick access to your family&apos;s art gallery</div>
        </div>
        <button className="pwa-banner-install" onClick={handleInstall}>Install</button>
        <button className="pwa-banner-close" onClick={handleDismiss} aria-label="Dismiss">×</button>
      </div>
    </>
  );
}
