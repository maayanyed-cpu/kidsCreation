import { NextRequest, NextResponse } from "next/server";
import { analyzeMonthlyProgress } from "@/lib/pipeline/analyzeMonthlyProgress";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("childId" in body) ||
    typeof (body as Record<string, unknown>).childId !== "string"
  ) {
    return NextResponse.json(
      { error: "Request body must include a string 'childId' field", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  const { childId, childName, locale } = body as {
    childId: string;
    childName?: string;
    locale?: "en" | "he";
  };

  // NOTE: This call can take 30–120s with the live Vision API.
  // In production, move to a background job (e.g. Vercel's `waitUntil` or a
  // queue) to avoid gateway timeouts. In mock mode it completes in < 1s.
  const result = await analyzeMonthlyProgress(childId, childName, undefined, locale);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.message,
        code: "INSUFFICIENT_ARTWORKS",
        artworkCount: result.artworkCount,
      },
      { status: 422 }
    );
  }

  return NextResponse.json(result.insight, { status: 201 });
}
