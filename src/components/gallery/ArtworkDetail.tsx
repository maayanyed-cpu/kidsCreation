"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ArtworkAnalysis } from "@/types/artwork";
import { useLocale } from "@/lib/i18n/LocaleContext";

// Map CSS named colors to display well — use them directly as CSS values
const COLOR_FALLBACK = "#c4b5a5";

interface Props {
  artwork: ArtworkAnalysis;
  childName: string;
  encouragementScripts: string[];
  reportPeriod: string | null;
  backChildParam?: string;
  children?: React.ReactNode;
}

export function ArtworkDetail({
  artwork,
  childName,
  encouragementScripts,
  reportPeriod,
  backChildParam,
  children: socialSection,
}: Props) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const backHref = backChildParam
    ? `/gallery?child=${backChildParam}`
    : "/gallery";

  const formattedDate = new Date(artwork.analysis_date).toLocaleDateString(
    locale === "he" ? "he-IL" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/artworks/${artwork.artwork_id}`, { method: "DELETE" });
      router.push(backHref);
      router.refresh();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 40%, #f0faf8 100%)" }}
    >
      {/* Sticky mini-header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-[#f0ede9] px-4 sm:px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-sm font-medium text-[#5c4a38] hover:text-[#ff7657] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={locale === "he" ? "rotate-180" : ""}>
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("gallery.back")}
          </Link>
          <div className="flex-1" />
          <span className="text-xs text-[#9b8474]">{childName} · {formattedDate}</span>
        </div>
      </header>

      <main
        className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        {/* Full-size image */}
        <div className="rounded-2xl overflow-hidden shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artwork.image_url}
            alt={artwork.main_subjects.join(", ")}
            className="w-full object-cover"
            style={{ maxHeight: "60vh" }}
          />
        </div>

        {/* Colors */}
        <div className="card">
          <h2 className="text-xs font-bold text-[#9b8474] uppercase tracking-wider mb-3">
            {t("gallery.detail.colors")}
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            {artwork.predominant_colors.map((color) => (
              <div key={color} className="flex items-center gap-1.5">
                <span
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm block"
                  style={{ background: color !== "silver" ? color : "#c0c0c0" }}
                />
                <span className="text-xs text-[#5c4a38] capitalize">{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects + Technique */}
        <div className="card space-y-4">
          <div>
            <h2 className="text-xs font-bold text-[#9b8474] uppercase tracking-wider mb-2">
              {t("gallery.detail.subjects")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {artwork.main_subjects.map((s) => (
                <span
                  key={s}
                  className="text-sm px-3 py-1 rounded-full font-medium"
                  style={{ background: "#fff1ed", color: "#ff7657" }}
                >
                  {s.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-[#9b8474] uppercase tracking-wider mb-2">
              {t("gallery.detail.technique")}
            </h2>
            <p className="text-sm text-[#2d1f14] leading-relaxed">{artwork.technique_notes}</p>
          </div>
        </div>

        {/* Tags */}
        {artwork.ai_tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {artwork.ai_tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f5f0eb] text-[#5c4a38]"
              >
                #{tag.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}

        {/* Encouragement scripts */}
        {encouragementScripts.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-bold text-[#2d1f14] mb-1">
              {t("gallery.detail.encouragement")}
            </h2>
            {reportPeriod && (
              <p className="text-xs text-[#9b8474] mb-3">{reportPeriod}</p>
            )}
            <ul className="space-y-3">
              {encouragementScripts.map((script, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-sm text-[#2d1f14] leading-relaxed"
                >
                  <span className="mt-0.5 text-[#ff7657] flex-shrink-0">💬</span>
                  <span>"{script}"</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Social: reactions + comments */}
        {socialSection}

        {/* Delete */}
        <div className="pt-2">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-2xl text-sm font-medium text-[#e55] border border-[#fdd] hover:bg-[#fff5f5] transition-colors"
            >
              {t("gallery.detail.delete")}
            </button>
          ) : (
            <div className="rounded-2xl border border-[#fdd] bg-[#fff5f5] p-4 space-y-3">
              <p className="text-sm font-medium text-[#2d1f14] text-center">
                {t("gallery.detail.deleteConfirm")}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#f5f0eb] text-[#5c4a38] hover:bg-[#ede8e2] transition-colors"
                >
                  {t("gallery.detail.deleteCancel")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#e55] text-white hover:bg-[#d44] disabled:opacity-50 transition-colors"
                >
                  {deleting ? "..." : t("gallery.detail.deleteConfirmBtn")}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
