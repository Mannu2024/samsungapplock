import { teachingScriptSchema, type SupportedLanguage, type TeachingScript } from "@ttv/shared";

export function buildGroundedScript(input: string, language: SupportedLanguage, includeQuiz: boolean): TeachingScript {
  const sentences = input.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 20);
  const scenes = sentences.map((sentence, index) => {
    const start = input.indexOf(sentence);
    const end = start + sentence.length;
    return {
      title: index === 0 ? "Introduction" : `Concept ${index}`,
      onScreenBullets: [sentence.slice(0, 80)],
      narrationText: sentence,
      sourceSpans: [{ start, end, text: sentence }],
      assumption: false
    };
  });

  const script: TeachingScript = {
    language,
    scenes,
    glossary: [],
    citations: scenes.map((s) => ({ claim: s.narrationText, sourceSpans: s.sourceSpans, assumption: s.assumption })),
    ...(includeQuiz
      ? {
          quiz: [
            {
              question: "Which sentence best summarizes the lesson?",
              options: scenes.slice(0, 3).map((s) => s.narrationText.slice(0, 40)),
              answer: scenes[0]?.narrationText.slice(0, 40) ?? ""
            }
          ]
        }
      : {})
  };

  return teachingScriptSchema.parse(script);
}
