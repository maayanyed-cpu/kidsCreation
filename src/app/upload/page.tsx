export default function UploadPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 40%, #f0faf8 100%)" }}
    >
      <span className="text-6xl mb-6">🎨</span>
      <h1
        className="text-2xl font-bold text-[#2d1f14] mb-3"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Upload Artwork
      </h1>
      <p className="text-sm text-[#9b8474] max-w-xs leading-relaxed">
        Coming soon — drop a photo of your child&apos;s artwork to start the magic.
      </p>
      <div
        className="mt-8 w-full max-w-xs h-40 rounded-2xl border-2 border-dashed border-[#e0d8d0] flex flex-col items-center justify-center gap-2 text-[#9b8474] cursor-not-allowed"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4 4 4M4 20h16" />
        </svg>
        <span className="text-sm">Tap to upload</span>
      </div>
    </div>
  );
}
