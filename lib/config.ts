import { z } from "zod";

const Env = z.object({
  AIRTABLE_API_KEY: z.string().min(1),
  AIRTABLE_BASE_ID: z.string().default("app1dXnj3CwDlL5Hj"),
  AIRTABLE_TABLE: z.string().default("Clients"),
  SANITY_PROJECT_ID: z.string().default(""),
  SANITY_DATASET: z.string().default("production"),
  SANITY_TOKEN: z.string().default(""),
  SANITY_API_VERSION: z.string().default("2024-10-01"),
  ANTHROPIC_API_KEY: z.string().min(1),
  MODEL_NAME: z.string().default("claude-sonnet-4-6"),
  DRY_RUN: z
    .preprocess((v) => (typeof v === "string" ? v.toLowerCase() === "true" : v), z.boolean())
    .default(true),
  LOG_LEVEL: z.string().default("info"),
});

export type Env = z.infer<typeof Env>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (!cached) {
    cached = Env.parse(process.env);
  }
  return cached;
}

export function resetEnvCacheForTests(): void {
  cached = undefined;
}
