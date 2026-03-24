/**
 * Client-side highlight video generation using Canvas + MediaRecorder.
 * Renders a slideshow of a child's artwork with transitions, title cards,
 * and stats. The canvas is shown as a live preview during recording.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VideoSlide {
  imageUrl: string;
  title?: string;
  date: string;
  challengeName?: string;
}

export interface VideoStats {
  totalArtworks: number;
  topInterest: string;
  sentiment: string;
  totalReactions: number;
  challengesCompleted?: number;
}

export interface VideoConfig {
  type: "monthly" | "yearly";
  childName: string;
  childEmoji: string;
  period: string; // "March 2026" or "2026"
  artworks: VideoSlide[];
  stats: VideoStats;
  milestone?: string;
  locale: "en" | "he";
  // For yearly: monthly breakdowns
  monthlyBreakdown?: { month: string; artworks: VideoSlide[] }[];
}

export type ProgressCallback = (step: string, percent: number) => void;

// ── Constants ─────────────────────────────────────────────────────────────────

const W = 1280;
const H = 720;
const FPS = 30;
const FRAME_MS = 1000 / FPS;

// App palette
const CORAL = "#ff7657";
const CREAM = "#fdf8f4";
const TEAL = "#0f9d8f";
const DARK = "#2d1f14";
const MUTED = "#9b8474";
const WHITE = "#ffffff";

// ── Image loading ─────────────────────────────────────────────────────────────

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${url}`));
    img.src = url;
  });
}

async function loadImages(
  slides: VideoSlide[],
  onProgress: ProgressCallback
): Promise<HTMLImageElement[]> {
  const images: HTMLImageElement[] = [];
  for (let i = 0; i < slides.length; i++) {
    try {
      images.push(await loadImage(slides[i].imageUrl));
    } catch {
      // Create a placeholder for failed loads
      const c = document.createElement("canvas");
      c.width = 400;
      c.height = 300;
      const cx = c.getContext("2d")!;
      cx.fillStyle = "#f0ede9";
      cx.fillRect(0, 0, 400, 300);
      cx.fillStyle = MUTED;
      cx.font = "40px sans-serif";
      cx.textAlign = "center";
      cx.fillText("🎨", 200, 160);
      const placeholder = new Image();
      placeholder.src = c.toDataURL();
      await new Promise((r) => { placeholder.onload = r; });
      images.push(placeholder);
    }
    onProgress(`Loading artwork (${i + 1}/${slides.length})...`, Math.round(((i + 1) / slides.length) * 25));
  }
  return images;
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

function fillGradient(ctx: CanvasRenderingContext2D, c1: string, c2: string) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  font: string,
  color: string
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, y);
}

/** Draw image covering canvas with Ken Burns zoom (progress 0→1 zooms from 100%→105%) */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  kenBurns: number = 0
) {
  const scale = 1 + 0.05 * kenBurns;
  const imgAspect = img.width / img.height;
  const canvasAspect = W / H;

  let sw: number, sh: number, sx: number, sy: number;
  if (imgAspect > canvasAspect) {
    sh = img.height;
    sw = sh * canvasAspect;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / canvasAspect;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(scale, scale);
  ctx.translate(-W / 2, -H / 2);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
  ctx.restore();
}

function drawOverlayText(ctx: CanvasRenderingContext2D, text: string, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.85;
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(0, H - 60, W, 60);
  ctx.globalAlpha = alpha;
  ctx.font = "500 18px system-ui, sans-serif";
  ctx.fillStyle = WHITE;
  ctx.textAlign = "center";
  ctx.fillText(text, W / 2, H - 30);
  ctx.restore();
}

// ── Scene rendering ───────────────────────────────────────────────────────────

function renderTitleCard(ctx: CanvasRenderingContext2D, config: VideoConfig, alpha: number) {
  fillGradient(ctx, "#fff4f0", "#f0faf8");
  ctx.globalAlpha = alpha;
  drawCenteredText(ctx, config.childEmoji, H / 2 - 80, "80px sans-serif", DARK);
  const titleFont = 'bold 44px "Fraunces", Georgia, serif';
  const he = config.locale === "he";
  const title = he
    ? `היצירות של ${config.childName}`
    : `${config.childName}'s Creations`;
  drawCenteredText(ctx, title, H / 2, titleFont, DARK);
  drawCenteredText(ctx, config.period, H / 2 + 50, "500 22px system-ui, sans-serif", MUTED);
  ctx.globalAlpha = 1;
}

function renderStatsCard(ctx: CanvasRenderingContext2D, stats: VideoStats, config: VideoConfig, alpha: number) {
  fillGradient(ctx, "#fff4f0", "#f0faf8");
  ctx.globalAlpha = alpha;
  const he = config.locale === "he";
  const y0 = H / 2 - 100;

  drawCenteredText(ctx, he ? "סיכום החודש" : "Month at a Glance", y0, 'bold 32px "Fraunces", Georgia, serif', DARK);

  const lines = [
    `🎨 ${stats.totalArtworks} ${he ? "יצירות" : "creations"}`,
    `⭐ ${he ? "עניין מוביל" : "Top interest"}: ${stats.topInterest}`,
    `💛 ${he ? "מצב רוח" : "Mood"}: ${stats.sentiment}`,
    ...(stats.totalReactions > 0 ? [`❤️ ${stats.totalReactions} ${he ? "תגובות מהמשפחה" : "reactions from family"}`] : []),
    ...(stats.challengesCompleted ? [`🏆 ${stats.challengesCompleted} ${he ? "אתגרים הושלמו" : "challenges completed"}`] : []),
  ];
  lines.forEach((line, i) => {
    drawCenteredText(ctx, line, y0 + 55 + i * 38, "500 22px system-ui, sans-serif", DARK);
  });
  ctx.globalAlpha = 1;
}

function renderMilestoneCard(ctx: CanvasRenderingContext2D, milestone: string, config: VideoConfig, alpha: number) {
  fillGradient(ctx, "#fff8f5", "#f0faf8");
  ctx.globalAlpha = alpha;
  const he = config.locale === "he";
  drawCenteredText(ctx, "🏅", H / 2 - 80, "64px sans-serif", DARK);
  drawCenteredText(ctx, he ? "הישג נפתח!" : "Achievement Unlocked!", H / 2 - 20, 'bold 28px "Fraunces", Georgia, serif', CORAL);

  // Wrap milestone text
  ctx.font = "500 18px system-ui, sans-serif";
  ctx.fillStyle = DARK;
  ctx.textAlign = "center";
  const words = milestone.split(" ");
  let line = "";
  let y = H / 2 + 30;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > W * 0.75 && line) {
      ctx.fillText(line.trim(), W / 2, y);
      line = word + " ";
      y += 26;
    } else {
      line = test;
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), W / 2, y);
  ctx.globalAlpha = 1;
}

function renderClosingCard(ctx: CanvasRenderingContext2D, alpha: number) {
  fillGradient(ctx, "#fff4f0", "#f0faf8");
  ctx.globalAlpha = alpha;
  drawCenteredText(ctx, "Made with ❤️ on", H / 2 - 20, "500 22px system-ui, sans-serif", MUTED);
  drawCenteredText(ctx, "Kidz Creations", H / 2 + 25, 'bold 36px "Fraunces", Georgia, serif', CORAL);
  ctx.globalAlpha = 1;
}

// ── Timeline ──────────────────────────────────────────────────────────────────

interface Segment {
  type: "title" | "artwork" | "stats" | "milestone" | "closing";
  start: number; // seconds
  duration: number;
  artworkIndex?: number;
  slideInfo?: VideoSlide;
}

function buildTimeline(config: VideoConfig): { segments: Segment[]; duration: number } {
  const segments: Segment[] = [];
  let t = 0;

  // Title card
  segments.push({ type: "title", start: t, duration: 2.5 });
  t += 2.5;

  // Artworks
  const artDuration = config.type === "yearly" ? 2.2 : 2.8;
  for (let i = 0; i < config.artworks.length; i++) {
    segments.push({ type: "artwork", start: t, duration: artDuration, artworkIndex: i, slideInfo: config.artworks[i] });
    t += artDuration;
  }

  // Stats
  segments.push({ type: "stats", start: t, duration: 4 });
  t += 4;

  // Milestone (if present)
  if (config.milestone) {
    segments.push({ type: "milestone", start: t, duration: 4 });
    t += 4;
  }

  // Closing
  segments.push({ type: "closing", start: t, duration: 2.5 });
  t += 2.5;

  return { segments, duration: t };
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateHighlightVideo(
  canvas: HTMLCanvasElement,
  config: VideoConfig,
  onProgress: ProgressCallback
): Promise<Blob> {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 1. Load images
  const images = await loadImages(config.artworks, onProgress);

  // 2. Build timeline
  const { segments, duration } = buildTimeline(config);
  const totalFrames = Math.ceil(duration * FPS);

  onProgress("Composing slideshow...", 28);

  // 3. Set up audio (simple ambient pad)
  let audioCtx: AudioContext | undefined;
  let audioStream: MediaStream | undefined;
  try {
    audioCtx = new AudioContext({ sampleRate: 44100 });
    const dest = audioCtx.createMediaStreamDestination();

    // Warm pad chord: C3 + E3 + G3
    const freqs = [130.81, 164.81, 196.00];
    for (const freq of freqs) {
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = audioCtx.createGain();
      gain.gain.value = 0.06;
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 800;
      osc.connect(filter).connect(gain).connect(dest);
      osc.start();
    }
    audioStream = dest.stream;
  } catch {
    // Audio unavailable — silent video
  }

  // 4. Set up MediaRecorder
  const videoStream = canvas.captureStream(FPS);
  if (audioStream) {
    for (const track of audioStream.getAudioTracks()) {
      videoStream.addTrack(track);
    }
  }

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";
  const recorder = new MediaRecorder(videoStream, { mimeType, videoBitsPerSecond: 2_500_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
  });

  recorder.start(100); // collect data every 100ms

  // 5. Render frames in real-time
  const FADE = 0.4; // seconds for cross-fade

  for (let frame = 0; frame < totalFrames; frame++) {
    const t = frame / FPS;

    // Find current segment
    const seg = segments.find((s) => t >= s.start && t < s.start + s.duration) ?? segments[segments.length - 1];
    const segT = (t - seg.start) / seg.duration; // 0-1 within segment
    const fadeIn = Math.min(1, (t - seg.start) / FADE);
    const fadeOut = Math.min(1, (seg.start + seg.duration - t) / FADE);
    const alpha = Math.min(fadeIn, fadeOut);

    switch (seg.type) {
      case "title":
        renderTitleCard(ctx, config, alpha);
        break;
      case "artwork": {
        const img = images[seg.artworkIndex!];
        if (img) {
          // Background: previous artwork fading or solid color
          fillGradient(ctx, CREAM, CREAM);
          ctx.globalAlpha = alpha;
          drawImageCover(ctx, img, segT); // Ken Burns
          ctx.globalAlpha = 1;
          // Overlay info
          const label = seg.slideInfo?.challengeName
            ? `🏆 ${seg.slideInfo.challengeName}`
            : seg.slideInfo?.date ?? "";
          if (label) drawOverlayText(ctx, label, alpha);
        }
        break;
      }
      case "stats":
        renderStatsCard(ctx, config.stats, config, alpha);
        break;
      case "milestone":
        renderMilestoneCard(ctx, config.milestone!, config, alpha);
        break;
      case "closing":
        renderClosingCard(ctx, alpha);
        break;
    }

    // Progress
    if (frame % FPS === 0) {
      const pct = 28 + Math.round((frame / totalFrames) * 65);
      onProgress("Composing slideshow...", pct);
    }

    // Wait for next frame (real-time recording)
    await new Promise((r) => setTimeout(r, FRAME_MS));
  }

  // 6. Finalize
  onProgress("Finalizing...", 96);
  recorder.stop();
  if (audioCtx) audioCtx.close();

  const blob = await done;
  onProgress("Done!", 100);
  return blob;
}
