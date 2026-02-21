import express from "express";
import cors from "cors";
import { config } from "./config";
import { runMigrations } from "./db/migrate";
import { authRouter } from "./routes/auth";
import { projectsRouter } from "./routes/projects";
import { jobsRouter } from "./routes/jobs";

const app = express();
app.use(cors());
app.use(express.json({ limit: "4mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRouter);
app.use("/projects", projectsRouter);
app.use("/jobs", jobsRouter);

runMigrations()
  .then(() => app.listen(config.port, () => console.log(`api running on ${config.port}`)))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
