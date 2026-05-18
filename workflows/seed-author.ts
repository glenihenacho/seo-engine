import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";

import { task } from "@trigger.dev/sdk/v3";

import { logger } from "../lib/logger.js";
import { sanityClientFor } from "../lib/sanity-client.js";

export type SeedAuthorArgs = { dataset: string };
export type SeedAuthorResult = { id: string; created: boolean };

const AUTHOR_ID = "author.ai-content";

export async function seedAuthor(
  args: SeedAuthorArgs,
): Promise<SeedAuthorResult> {
  const client = sanityClientFor(args.dataset);
  const existing = await client.fetch<string | null>(
    `*[_id == $id][0]._id`,
    { id: AUTHOR_ID },
  );
  const doc = await client.createIfNotExists({
    _id: AUTHOR_ID,
    _type: "author",
    name: "AI Content",
    slug: { _type: "slug", current: "ai-content" },
  });
  const created = existing === null || existing === undefined;
  logger.info(
    { dataset: args.dataset, id: doc._id, created },
    "seeded default author",
  );
  return { id: doc._id, created };
}

export const seedAuthorTask = task({
  id: "seo-engine.seed-author",
  run: async (payload: SeedAuthorArgs) => seedAuthor(payload),
});

const isDirectInvocation =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectInvocation) {
  const { values } = parseArgs({
    options: {
      dataset: { type: "string" },
    },
  });

  const dataset = values.dataset;
  if (!dataset) {
    process.stderr.write(
      "Usage: pnpm cli:seed-author --dataset <slug>\n",
    );
    process.exit(1);
  }

  seedAuthor({ dataset })
    .then((result) => {
      logger.info(result, "seed-author completed");
      process.exit(0);
    })
    .catch((err: Error) => {
      logger.error(
        { err: err.message, stack: err.stack },
        "seed-author failed",
      );
      process.exit(1);
    });
}
