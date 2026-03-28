"use client";

import Link from "next/link";
import type { ArtworkAnalysis } from "@/types/artwork";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { translateTag } from "@/lib/i18n/contentTranslations";

const SENTIMENT_EMOJI: Record<string, string> = {
  Joyful: "😄",
  Calm: "😌",
  Energetic: "⚡",
  Expressive: "🎨",
  Dreamy: "✨",
  Curious: "🔍",
  Bold: "🔥",
  Warm: "🌸",
  Playful: "🎉",
};

interface Props {
  artwork: ArtworkAnalysis;
  childParam?: string;
}

export function ArtworkCard({ artwork, childParam }: Props) {
  const { locale } = useLocale();
  const sentimentEmoji = SENTIMENT_EMOJI[artwork.emotional_tone] ?? "🎨";
  const backParam = childParam ? `?child=${childParam}` : "";

  const formattedDate = new Date(artwork.analysis_date).toLocaleDateString(
    locale === "he" ? "he-IL" : "en-US",
    { month: "short", day: "numeric" }
  );

  return (
    <>
      <style>{`
        .art-card-new {
          background: #fffdfb;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #e8e0d8;
          transition: all 0.3s ease;
          text-decoration: none;
          display: block;
        }
        .art-card-new:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(42,36,31,0.08);
        }
        .art-card-img {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #f5f0eb;
        }
        .art-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .art-card-new:hover .art-card-img img {
          transform: scale(1.05);
        }
        .art-card-emoji {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #fffdfb;
          box-shadow: 0 4px 12px rgba(42,36,31,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border: 2px solid #f5f0eb;
        }
        .art-card-info {
          padding: 14px 16px;
        }
        .art-card-date {
          font-size: 14px;
          font-weight: 600;
          color: #5c5248;
          margin-bottom: 8px;
        }
        .art-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .art-card-tag {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          background: #f5f0eb;
          color: #7a6e62;
          border: 1px solid #e8e0d8;
        }
      `}</style>

      <Link
        href={`/gallery/${artwork.artwork_id}${backParam}`}
        className="art-card-new"
      >
        {/* Thumbnail */}
        <div className="art-card-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artwork.thumb_url ?? artwork.image_url}
            alt={artwork.main_subjects.join(", ") || artwork.title || "artwork"}
            loading="lazy"
          />
          {/* Sentiment or pending badge */}
          <span className="art-card-emoji">
            {artwork.status === "pending" ? "⏳" : sentimentEmoji}
          </span>
        </div>

        {/* Card body */}
        <div className="art-card-info" dir={locale === "he" ? "rtl" : "ltr"}>
          <div className="art-card-date" suppressHydrationWarning>{formattedDate}</div>

          {/* Tags */}
          {artwork.ai_tags.length > 0 && (
            <div className="art-card-tags">
              {artwork.ai_tags.slice(0, 3).map((tag) => (
                <span key={tag} className="art-card-tag">
                  {translateTag(tag, locale)}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </>
  );
}
