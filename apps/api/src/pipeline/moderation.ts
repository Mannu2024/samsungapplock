const blockedPatterns = [/deepfake of/i, /illegal weapon/i, /how to hack/i];

export function moderateInput(text: string) {
  const block = blockedPatterns.find((p) => p.test(text));
  if (block) {
    return { allowed: false, reason: "Blocked by safety moderation policy" };
  }
  return { allowed: true };
}
