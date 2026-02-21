import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  const sqlPath = path.resolve(__dirname, "../../migrations/001_init.sql");
  const sql = await fs.readFile(sqlPath, "utf8");
  await pool.query(sql);
}
