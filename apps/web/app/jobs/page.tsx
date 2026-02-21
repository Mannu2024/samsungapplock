"use client";
import { useEffect, useState } from "react";

type Job = { id: string; status: string; progress: number; updated_at: string };

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const timer = setInterval(async () => {
      const projects = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects?userId=`).then((r) => r.json());
      const allJobs = await Promise.all((projects as any[]).map((p) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${p.id}`).then((r) => r.json()).catch(() => null)));
      setJobs(allJobs.filter(Boolean));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h2 className="mb-4 text-3xl font-semibold">Jobs</h2>
      <ul className="space-y-2">{jobs.map((job) => <li key={job.id} className="rounded border border-slate-700 p-3">{job.id} - {job.status} ({job.progress}%)</li>)}</ul>
    </main>
  );
}
