import { Router } from "express";
import { generationQueue } from "../queue/queues";
import { pool } from "../db/client";

export const jobsRouter = Router();

jobsRouter.post("/", async (req, res) => {
  const { projectId, settings } = req.body;
  const result = await pool.query(
    "INSERT INTO jobs (project_id, status, progress, settings_json) VALUES ($1, 'queued', 0, $2) RETURNING *",
    [projectId, settings]
  );
  const job = result.rows[0];
  await generationQueue.add("generate", { jobId: job.id }, { attempts: 3, removeOnComplete: true });
  res.json(job);
});

jobsRouter.get("/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM jobs WHERE id = $1", [req.params.id]);
  res.json(result.rows[0]);
});

jobsRouter.get("/:id/result", async (req, res) => {
  const assets = await pool.query("SELECT * FROM assets WHERE job_id = $1", [req.params.id]);
  res.json({ jobId: req.params.id, assets: assets.rows });
});

jobsRouter.post("/:id/regenerate", async (req, res) => {
  await generationQueue.add("regenerate", { jobId: req.params.id, steps: req.body.steps ?? [] }, { attempts: 2 });
  res.json({ ok: true });
});
