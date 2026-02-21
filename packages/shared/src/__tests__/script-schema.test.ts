import { describe, expect, it } from "vitest";
import { teachingScriptSchema } from "../index";

describe("teachingScriptSchema", () => {
  it("accepts grounded script json", () => {
    const result = teachingScriptSchema.safeParse({
      language: "en",
      scenes: [
        {
          title: "Intro",
          onScreenBullets: ["Definition"],
          narrationText: "A simple intro",
          sourceSpans: [{ start: 0, end: 10, text: "Hello world" }],
          assumption: false
        }
      ],
      glossary: [{ term: "CPU", meaning: "Central Processing Unit" }],
      citations: [{ claim: "CPU expands to Central Processing Unit", sourceSpans: [{ start: 0, end: 10, text: "CPU" }], assumption: false }]
    });

    expect(result.success).toBe(true);
  });
});
