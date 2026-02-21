"use client";
import { useEffect, useState } from "react";

export default function ResultPage({ params }: { params: { id: string } }) {
  const [result, setResult] = useState<any>(null);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${params.id}/result`).then((r) => r.json()).then(setResult);
  }, [params.id]);

  if (!result) return <main className="p-6">Loading...</main>;
  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <h2 className="text-3xl font-semibold">Result</h2>
      <pre className="overflow-auto rounded border border-slate-700 p-3 text-sm">{JSON.stringify(result, null, 2)}</pre>
    </main>
  );
}
