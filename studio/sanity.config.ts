import { defineConfig, type WorkspaceOptions } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./schemas";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
if (!projectId) {
  throw new Error(
    "SANITY_STUDIO_PROJECT_ID must be set before booting the Studio.",
  );
}

const datasets = (process.env.SANITY_STUDIO_DATASETS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

if (datasets.length === 0) {
  throw new Error(
    "SANITY_STUDIO_DATASETS must list at least one dataset slug (comma-separated).",
  );
}

const workspaces: WorkspaceOptions[] = datasets.map((dataset) => ({
  name: dataset,
  title: dataset,
  basePath: `/${dataset}`,
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: { types: schemaTypes },
}));

export default defineConfig(workspaces);
