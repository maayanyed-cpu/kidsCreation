const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomChars(n: number): string {
  return Array.from({ length: n }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
}

/** Generate a share code like "zohar-a7k2" */
export function generateShareCode(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "art";
  return `${slug}-${randomChars(4)}`;
}
