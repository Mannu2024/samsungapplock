import { Router } from "express";
import { pool } from "../db/client";

export const projectsRouter = Router();

projectsRouter.post("/", async (req, res) => {
  const { userId, title, sourceText } = req.body;
  const result = await pool.query(
    "INSERT INTO projects (user_id, title, source_text) VALUES ($1, $2, $3) RETURNING *",
    [userId, title, sourceText]
  );
  res.json(result.rows[0]);
});

projectsRouter.get("/", async (req, res) => {
  const userId = req.query.userId;
  const result = await pool.query("SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
  res.json(result.rows);
});
