export function splitIntoChunks(input: string, maxChars = 3500): string[] {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) return [normalized];
  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < normalized.length) {
    chunks.push(normalized.slice(cursor, cursor + maxChars));
    cursor += maxChars;
  }
  return chunks;
}
