import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

// Maximum upload size — 50 MB
const MAX_BYTES = 50 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime"]);

function ext(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "jpg", // converted
    "image/heif": "jpg",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
  };
  return map[mime] ?? "bin";
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const childId = (formData.get("childId") as string | null)?.trim();
  const title = (formData.get("title") as string | null)?.trim() || null;

  if (!file || !childId) {
    return NextResponse.json(
      { error: "file and childId are required" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max 50 MB)` },
      { status: 413 }
    );
  }

  const isImage = IMAGE_TYPES.has(file.type);
  const isVideo = VIDEO_TYPES.has(file.type);
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}` },
      { status: 415 }
    );
  }

  // ── Save to disk ──────────────────────────────────────────────────────────
  const artworkId = `art_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", childId);
  await mkdir(uploadDir, { recursive: true });

  let buffer = Buffer.from(await file.arrayBuffer());

  // HEIC → JPEG conversion
  if (file.type === "image/heic" || file.type === "image/heif") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const heicConvert = require("heic-convert");
      buffer = Buffer.from(
        await heicConvert({ buffer, format: "JPEG", quality: 0.92 })
      );
    } catch (err) {
      console.warn("[upload] HEIC conversion failed, storing original:", err);
    }
  }

  const filename = `${artworkId}.${ext(file.type)}`;
  const thumbFilename = `thumb_${artworkId}.jpg`;
  const filePath = path.join(uploadDir, filename);
  const thumbPath = path.join(uploadDir, thumbFilename);

  let imageUrl = `/uploads/${childId}/${filename}`;
  let thumbUrl: string | null = null;

  if (isImage) {
    // Resize main image to max 1200px width, save as JPEG for web
    try {
      await sharp(buffer)
        .resize(1200, null, { withoutEnlargement: true })
        .jpeg({ quality: 88 })
        .toFile(filePath.replace(/\.[^.]+$/, ".jpg"));
      imageUrl = `/uploads/${childId}/${artworkId}.jpg`;

      // 400px thumbnail
      await sharp(buffer)
        .resize(400, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbPath);
      thumbUrl = `/uploads/${childId}/${thumbFilename}`;
    } catch (err) {
      console.warn("[upload] sharp processing failed, storing original:", err);
      await writeFile(filePath, buffer);
    }
  } else {
    // Video — store as-is, no thumbnail for MVP
    await writeFile(filePath, buffer);
  }

  // ── Create DB record ──────────────────────────────────────────────────────
  await prisma.artworkAnalysis.create({
    data: {
      artwork_id: artworkId,
      child_id: childId,
      image_url: imageUrl,
      thumb_url: thumbUrl,
      title,
      status: "pending",
      predominant_colors: "[]",
      main_subjects: "[]",
      technique_notes: "",
      ai_tags: "[]",
      emotional_tone: "Joyful",
    },
  });

  // ── Count artworks this month ─────────────────────────────────────────────
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const artworksThisMonth = await prisma.artworkAnalysis.count({
    where: {
      child_id: childId,
      analysis_date: { gte: startOfMonth },
      deleted_at: null,
    },
  });

  const hasInsightThisMonth = !!(await prisma.insights.findFirst({
    where: {
      child_id: childId,
      analysis_period: now.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    },
    select: { id: true },
  }));

  return NextResponse.json({
    artworkId,
    imageUrl,
    thumbUrl,
    artworksThisMonth,
    hasInsightThisMonth,
  });
}
