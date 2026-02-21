import dotenv from "dotenv";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { Pool } from "pg";
import { runPipeline } from "../../api/src/pipeline/pipeline";

dotenv.config();

const redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null });
const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/text_to_teaching_video" });

const steps = ["Script", "Translation", "Voice", "Slides", "Render", "Upload"];

new Worker(
  "generation",
  async (job) => {
    const jobId = job.data.jobId as string;
    await pool.query("UPDATE jobs SET status='processing', progress=5, updated_at=now() WHERE id=$1", [jobId]);

    const jobRow = (await pool.query("SELECT j.*, p.source_text FROM jobs j JOIN projects p ON p.id = j.project_id WHERE j.id = $1", [jobId])).rows[0];
    const settings = jobRow.settings_json;
    const output = await runPipeline(jobRow.source_text, settings);

    for (let i = 0; i < output.script.scenes.length; i += 1) {
      const s = output.script.scenes[i];
      await pool.query(
        "INSERT INTO scenes (job_id, scene_index, title, bullets_json, narration_text, source_spans_json) VALUES ($1,$2,$3,$4,$5,$6)",
        [jobId, i, s.title, JSON.stringify(s.onScreenBullets), s.narrationText, JSON.stringify(s.sourceSpans)]
      );
      await pool.query("INSERT INTO assets (job_id, type, url, meta_json) VALUES ($1,$2,$3,$4)", [jobId, "audio", output.audioAssets[i].audioUrl, JSON.stringify(output.audioAssets[i])]);
    }

    await pool.query("INSERT INTO assets (job_id, type, url, meta_json) VALUES ($1,$2,$3,$4)", [jobId, "video", output.render.mp4Url, JSON.stringify({ steps })]);
    await pool.query("INSERT INTO assets (job_id, type, url, meta_json) VALUES ($1,$2,$3,$4)", [jobId, "subtitles", `inline://srt/${jobId}`, JSON.stringify({ srt: output.subtitlesSrt })]);

    await pool.query("UPDATE jobs SET status='done', progress=100, updated_at=now() WHERE id=$1", [jobId]);
  },
  { connection: redis }
);

console.log("worker running");
