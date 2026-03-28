import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.onboarding_complete) redirect("/dashboard");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background:
          "linear-gradient(160deg, #fff4f0 0%, #fdf8f4 50%, #f0faf8 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🎨</div>
          <h1
            className="text-xl font-bold text-[#2d1f14]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Arti Steps
          </h1>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl bg-white p-6"
          style={{
            boxShadow:
              "0 2px 4px rgba(45,31,20,0.06), 0 8px 32px rgba(45,31,20,0.08)",
          }}
        >
          <OnboardingWizard
            userId={session.user.id}
            initialName={session.user.name ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
