import { z } from "zod";

const Env = z.object({
  AIRTABLE_API_KEY: z.string().min(1),
  AIRTABLE_BASE_ID: z.string().default("app1dXnj3CwDlL5Hj"),
  AIRTABLE_TABLE: z.string().default("Clients"),
  AIRTABLE_SCHEDULES_TABLE: z.string().default("Content Schedules"),
  SANITY_PROJECT_ID: z.string().default(""),
  SANITY_TOKEN: z.string().default(""),
  SANITY_API_VERSION: z.string().default("2024-10-01"),
  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_BASE_URL: z.string().default("https://openrouter.ai/api/v1"),
  MODEL_NAME: z.string().default("anthropic/claude-sonnet-4.6"),
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
