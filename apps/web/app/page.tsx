import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-5xl font-bold">TextToTeachingVideo</h1>
      <p className="text-slate-300">Turn lesson notes into grounded teacher-style videos in 12+ Indian languages.</p>
      <Link href="/create" className="rounded bg-emerald-500 px-6 py-3 font-semibold text-slate-950">Create video</Link>
    </main>
  );
}
