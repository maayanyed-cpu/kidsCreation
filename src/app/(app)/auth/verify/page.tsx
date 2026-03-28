export default function VerifyPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 50%, #f0faf8 100%)" }}
    >
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">✉️</div>
        <h1
          className="text-2xl font-bold text-[#2d1f14] mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Check your email
        </h1>
        <p className="text-[#9b8474] text-sm leading-relaxed">
          A sign-in link is on its way. Click the link in the email to continue —
          no password needed.
        </p>
        <p className="text-[#c4b5a8] text-xs mt-6">
          Didn&apos;t get it? Check your spam folder or{" "}
          <a href="/auth/signin" className="underline hover:text-[#9b8474]">
            try again
          </a>
          .
        </p>
      </div>
    </div>
  );
}
