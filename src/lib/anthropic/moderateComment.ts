import { getAnthropicClient, isMockMode } from "./client";

const HAIKU_MODEL = "claude-3-5-haiku-20241022";

const SYSTEM_PROMPT = `You are a content filter for a children's art sharing app. Evaluate if this comment is positive, encouraging, and appropriate for a child to read.

Respond with ONLY one of:
- YES — the comment is positive and appropriate
- NO — the comment is negative, inappropriate, or not encouraging
- UNSURE — you're not certain; hold for parent review`;

const BLOCK_WORDS = [
  "ugly", "bad", "hate", "stupid", "dumb", "terrible", "awful",
  "worst", "sucks", "boring", "lame", "disgusting", "gross",
];

/** Returns "approved" | "rejected" | "pending" (pending = needs parent review) */
export async function moderateComment(text: string): Promise<"approved" | "rejected" | "pending"> {
  if (isMockMode()) {
    const lower = text.toLowerCase();
    if (BLOCK_WORDS.some((w) => lower.includes(w))) return "rejected";
    return "approved";
  }

  try {
    const client = getAnthropicClient();
    const res = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 10,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    const answer = res.content[0].type === "text" ? res.content[0].text.trim().toUpperCase() : "UNSURE";

    if (answer.startsWith("YES")) return "approved";
    if (answer.startsWith("NO")) return "rejected";
    return "pending";
  } catch (err) {
    console.error("[moderateComment] AI filter error, holding for review:", err);
    return "pending";
  }
}
