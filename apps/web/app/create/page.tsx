"use client";
import { useState } from "react";

const languages = ["en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "or", "ur"];

export default function CreatePage() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");

  async function onGenerate() {
    const project = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: null, title: "New Lesson", sourceText: text })
    }).then((r) => r.json());

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        settings: {
          targetLanguage: language,
          voice: `${language}-teacher-1`,
          speakingSpeed: 1,
          tone: "teacher-friendly",
          style: "slides",
          subtitles: true,
          bilingualSubtitles: true,
          quiz: true,
          addExamples: true,
          level: "school",
          allowExternalReferences: false,
          transliteration: false,
          accuracyMode: true
        }
      })
    });
    window.location.href = "/jobs";
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h2 className="text-3xl font-semibold">Create Teaching Video</h2>
      <textarea className="h-56 w-full rounded border border-slate-700 bg-slate-900 p-3" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste teaching content..." />
      <div className="flex gap-4">
        <select className="rounded border border-slate-700 bg-slate-900 p-2" value={language} onChange={(e) => setLanguage(e.target.value)}>{languages.map((l) => <option key={l}>{l}</option>)}</select>
        <button onClick={onGenerate} className="rounded bg-emerald-500 px-5 py-2 font-semibold text-slate-950">Generate</button>
      </div>
    </main>
  );
}
