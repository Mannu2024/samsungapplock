import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  dbUrl: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/text_to_teaching_video",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  storageBaseUrl: process.env.STORAGE_BASE_URL ?? "http://localhost:9000/mock",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret"
};
