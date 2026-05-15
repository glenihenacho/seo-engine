import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_seo_engine_REPLACE_ME",
  runtime: "node",
  logLevel: "info",
  maxDuration: 600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      randomize: true,
    },
  },
  dirs: ["./workflows"],
  build: {
    external: ["@sanity/client"],
  },
});
