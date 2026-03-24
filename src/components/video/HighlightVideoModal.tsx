"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { VideoConfig, ProgressCallback } from "@/lib/video/generateVideo";

interface Props {
  config: VideoConfig;
  onClose: () => void;
}

export function HighlightVideoModal({ config, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"generating" | "ready" | "error">("generating");
  const [step, setStep] = useState("Preparing...");
  const [percent, setPercent] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const blobRef = useRef<Blob | null>(null);

  const onProgress: ProgressCallback = useCallback((s: string, p: number) => {
    setStep(s);
    setPercent(p);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { generateHighlightVideo } = await import("@/lib/video/generateVideo");
        const blob = await generateHighlightVideo(canvasRef.current!, config, onProgress);
        if (cancelled) return;
        blobRef.current = blob;
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        setPhase("ready");
      } catch (err) {
        if (cancelled) return;
        console.error("[HighlightVideo] Generation failed:", err);
        setPhase("error");
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDownload() {
    if (!videoBlob || !videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `${config.childName}_${config.period.replace(/\s/g, "_")}.webm`;
    a.click();
  }

  function handleShare() {
    if (!videoBlob) return;
    const he = config.locale === "he";
    const text = he
      ? `🎬🎨 היצירות של ${config.childName} — ${config.period}! נוצר ב-Kidz Creations`
      : `🎬🎨 ${config.childName}'s ${config.type === "yearly" ? "year" : "month"} of creativity! Made with Kidz Creations`;

    if (navigator.share) {
      navigator.share({
        title: `${config.childName}'s Highlight Reel`,
        text,
        files: [new File([videoBlob], `${config.childName}_highlight.webm`, { type: "video/webm" })],
      }).catch(() => {});
    } else {
      // Fallback: copy text
      navigator.clipboard.writeText(text);
    }
  }

  const sizeMB = videoBlob ? (videoBlob.size / 1024 / 1024).toFixed(1) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl rounded-3xl bg-white overflow-hidden"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}
      >
        {/* Canvas preview (visible during generation) */}
        {phase === "generating" && (
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ aspectRatio: "16/9", background: "#fdf8f4" }}
            />
            {/* Progress overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 bg-gradient-to-t from-black/40 to-transparent">
              <p className="text-white text-sm font-medium mb-2">{step}</p>
              <div className="w-3/4 h-2 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${percent}%`, background: "linear-gradient(90deg, #ff7657, #fbbf24)" }}
                />
              </div>
              <p className="text-white/70 text-xs mt-1">{percent}%</p>
            </div>
          </div>
        )}

        {/* Video player (visible when ready) */}
        {phase === "ready" && videoUrl && (
          <div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full"
              style={{ aspectRatio: "16/9", background: "#000" }}
            />
          </div>
        )}

        {/* Error state */}
        {phase === "error" && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <span className="text-4xl mb-3">😔</span>
            <p className="text-sm font-medium text-[#2d1f14] mb-1">Video generation failed</p>
            <p className="text-xs text-[#9b8474]">Your browser may not support video recording. Try Chrome or Edge.</p>
          </div>
        )}

        {/* Actions bar */}
        <div className="p-4 flex items-center gap-3">
          {phase === "ready" && (
            <>
              <button
                onClick={handleDownload}
                className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #ff7657, #ff9a7b)" }}
              >
                Download {sizeMB && `(${sizeMB} MB)`}
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2.5 rounded-2xl text-sm font-semibold bg-[#f5f0eb] text-[#5c4a38]"
              >
                Share
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl text-sm text-[#9b8474] hover:text-[#5c4a38] transition-colors ms-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
