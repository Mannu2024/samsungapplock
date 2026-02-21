import { Queue } from "bullmq";
import IORedis from "ioredis";
import { config } from "../config";

const connection = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });

export const generationQueue = new Queue("generation", { connection });
