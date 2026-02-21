import { type GenerationSettings } from "@ttv/shared";
import { FidelityTranslationProvider, MockTtsProvider } from "../providers/mockProviders";
import { buildGroundedScript } from "./scriptBuilder";
import { moderateInput } from "./moderation";

const translator = new FidelityTranslationProvider();
const tts = new MockTtsProvider();

export async function runPipeline(sourceText: string, settings: GenerationSettings) {
  const moderation = moderateInput(sourceText);
  if (!moderation.allowed) throw new Error(moderation.reason);

  const script = buildGroundedScript(sourceText, settings.targetLanguage, settings.quiz);
  const translatedScenes = await Promise.all(
    script.scenes.map(async (scene) => ({
      ...scene,
      narrationText: await translator.translate(scene.narrationText, "auto", settings.targetLanguage)
    }))
  );

  const audioAssets = await Promise.all(
    translatedScenes.map((scene) =>
      tts.synthesize({ text: scene.narrationText, language: settings.targetLanguage, voice: settings.voice, speed: settings.speakingSpeed })
    )
  );

  return {
    script: { ...script, scenes: translatedScenes },
    audioAssets,
    subtitlesSrt: translatedScenes.map((s, i) => `${i + 1}\n00:00:${String(i).padStart(2, "0")},000 --> 00:00:${String(i + 1).padStart(2, "0")},000\n${s.narrationText}\n`).join("\n"),
    render: {
      mp4Url: "mock://render/output.mp4",
      stepBreakdown: ["Script", "Translation", "Voice", "Slides", "Render", "Upload"]
    }
  };
}
