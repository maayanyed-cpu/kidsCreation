import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local to use the live Vision API.\n" +
        "Set ANTHROPIC_MOCK_MODE=true in .env.local to develop without an API key."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const VISION_MODEL = "claude-3-5-sonnet-20241022";
export const isMockMode = () => process.env.ANTHROPIC_MOCK_MODE === "true";
