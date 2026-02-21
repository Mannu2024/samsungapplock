import { z } from "zod";

export const supportedLanguages = [
  "en",
  "hi",
  "bn",
  "ta",
  "te",
  "mr",
  "gu",
  "kn",
  "ml",
  "pa",
  "or",
  "ur"
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const sourceSpanSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
  text: z.string().min(1)
});

export const sceneSchema = z.object({
  title: z.string().min(1),
  onScreenBullets: z.array(z.string()).min(1),
  narrationText: z.string().min(1),
  sourceSpans: z.array(sourceSpanSchema),
  assumption: z.boolean().default(false)
});

export const teachingScriptSchema = z.object({
  language: z.enum(supportedLanguages),
  scenes: z.array(sceneSchema).min(1).max(20),
  glossary: z.array(
    z.object({ term: z.string().min(1), meaning: z.string().min(1) })
  ),
  quiz: z.array(
    z.object({ question: z.string(), options: z.array(z.string()), answer: z.string() })
  ).optional(),
  citations: z.array(
    z.object({ claim: z.string(), sourceSpans: z.array(sourceSpanSchema), assumption: z.boolean().default(false) })
  )
});

export type TeachingScript = z.infer<typeof teachingScriptSchema>;

export type JobStatus = "queued" | "processing" | "rendering" | "done" | "failed";

export type GenerationSettings = {
  targetLanguage: SupportedLanguage;
  voice: string;
  speakingSpeed: number;
  tone: "teacher-friendly";
  style: "slides" | "presenter";
  subtitles: boolean;
  bilingualSubtitles: boolean;
  quiz: boolean;
  addExamples: boolean;
  level: "school" | "college" | "competitive";
  allowExternalReferences: boolean;
  transliteration: boolean;
  accuracyMode: boolean;
};
