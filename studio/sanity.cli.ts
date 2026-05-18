import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
const firstDataset =
  (process.env.SANITY_STUDIO_DATASETS ?? "")
    .split(",")
    .map((s) => s.trim())
    .find((s) => s.length > 0) ?? "";

export default defineCliConfig({
  api: {
    projectId,
    dataset: firstDataset,
  },
});
