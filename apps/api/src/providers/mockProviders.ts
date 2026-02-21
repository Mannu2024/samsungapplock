import type { AvatarProvider, TranslationProvider, TtsProvider } from "./interfaces";

export class FidelityTranslationProvider implements TranslationProvider {
  async translate(text: string): Promise<string> {
    return text;
  }
}

export class MockTtsProvider implements TtsProvider {
  async synthesize({ text }: { text: string; language: string; voice: string; speed: number }) {
    return {
      audioUrl: `mock://audio/${Buffer.from(text).toString("hex").slice(0, 12)}.mp3`,
      timings: text.split(" ").map((word, idx) => ({ text: word, startMs: idx * 300, endMs: idx * 300 + 250 }))
    };
  }
}

export class DisabledAvatarProvider implements AvatarProvider {
  async renderTalkingHead() {
    throw new Error("Avatar provider disabled for MVP");
  }
}
