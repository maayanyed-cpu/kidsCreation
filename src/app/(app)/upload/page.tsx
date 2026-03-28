import { prisma } from "@/lib/db/prisma";
import { UploadForm } from "@/components/upload/UploadForm";
import type { Child } from "@/types/child";

const DEFAULT_CHILD_ID = "child_003";

async function getAllChildren(): Promise<Child[]> {
  const rows = await prisma.child.findMany({ orderBy: { created_at: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    name_he: r.name_he,
    avatar_emoji: r.avatar_emoji,
    date_of_birth: r.date_of_birth,
    created_at: r.created_at,
  }));
}

interface PageProps {
  searchParams: Promise<{ child?: string; challenge?: string }>;
}

export default async function UploadPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const childId = params.child ?? DEFAULT_CHILD_ID;
  const challengeId = params.challenge ?? null;
  const allChildren = await getAllChildren();
  const selectedChild =
    allChildren.find((c) => c.id === childId) ??
    allChildren.find((c) => c.id === DEFAULT_CHILD_ID) ??
    allChildren[0];

  let challengeInfo: { id: string; title: string; title_he: string; emoji: string } | null = null;
  if (challengeId) {
    const ch = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { id: true, title: true, title_he: true, emoji: true },
    });
    if (ch) challengeInfo = ch;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--cream, #faf8f5)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10" style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}>
        <h1
          className="text-2xl font-bold text-[#2d1f14] tracking-tight mb-8 flex items-center gap-2.5"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ＋ Add a Creation
        </h1>

        <div
          className="rounded-3xl border border-[#e8e0d8] p-6 sm:p-8"
          style={{ background: "#fffdfb", boxShadow: "0 1px 3px rgba(42,36,31,0.04)" }}
        >
          {challengeInfo && (
            <div
              className="rounded-2xl p-4 mb-6 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, #fff8f5, #f0faf8)", border: "1.5px solid #fde8e2" }}
            >
              <span className="text-2xl">{challengeInfo.emoji}</span>
              <div>
                <p className="text-[10px] font-bold text-[#9b8474] uppercase tracking-wider">Challenge Submission</p>
                <p className="text-sm font-bold text-[#2d1f14]">{challengeInfo.title}</p>
              </div>
            </div>
          )}

          <UploadForm
            children={allChildren}
            defaultChildId={selectedChild.id}
            challengeId={challengeInfo?.id}
            challengeTitle={challengeInfo?.title}
          />
        </div>
      </div>
    </div>
  );
}
