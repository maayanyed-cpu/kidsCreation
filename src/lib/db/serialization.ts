export function serialize(arr: string[]): string {
  return JSON.stringify(arr);
}

export function deserialize(raw: string): string[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
