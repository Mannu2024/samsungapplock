import { describe, expect, it } from "vitest";
import { runPipeline } from "../pipeline/pipeline";

describe("pipeline", () => {
  it("creates grounded script and assets", async () => {
    const result = await runPipeline("Photosynthesis converts light into energy.", {
      targetLanguage: "en",
      voice: "teacher-en-1",
      speakingSpeed: 1,
      tone: "teacher-friendly",
      style: "slides",
      subtitles: true,
      bilingualSubtitles: false,
      quiz: true,
      addExamples: true,
      level: "school",
      allowExternalReferences: false,
      transliteration: false,
      accuracyMode: true
    });

    expect(result.script.scenes.length).toBeGreaterThan(0);
    expect(result.audioAssets.length).toEqual(result.script.scenes.length);
    expect(result.render.mp4Url).toContain("mock://render");
  });
});
