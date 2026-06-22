import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";

import { task } from "@trigger.dev/sdk/v3";

import { generatePost } from "../lib/generation.js";
import { buildDocumentId } from "../lib/ids.js";
import { logger } from "../lib/logger.js";
import type { Client } from "../lib/models.js";
import { buildPost } from "../lib/post-builder.js";
import { getClient } from "../tools/airtable-get-client.js";
import { documentExists } from "../tools/sanity-document-exists.js";
import { writeDraft } from "../tools/sanity-write-draft.js";
import { writePublished } from "../tools/sanity-write-published.js";

export type RunArgs = { recordId: string; dryRun?: boolean };
export type RunResult =
  | { status: "skipped"; reason: "not-ready" | "status-off" | "already-published" }
  | { status: "draft"; id: string }
  | { status: "published"; id: string }
  | { status: "dry-run"; id: string };

export async function runForClient(args: RunArgs): Promise<RunResult> {
  const client = await getClient(args.recordId);
  return runForResolvedClient(client, { dryRun: args.dryRun });
}

export async function runForResolvedClient(
  client: Client,
  opts: { dryRun?: boolean } = {},
): Promise<RunResult> {
  const runDate = new Date();
  const log = logger.child({
    client: client.name,
    recordId: client.airtableRecordId,
    dataset: client.sanityDataset,
  });

  if (!client.isReady) {
    log.info("client is not ready; skipping");
    return { status: "skipped", reason: "not-ready" };
  }
  if (client.sanityStatus === "Off") {
    log.info("Sanity Status is Off; skipping");
    return { status: "skipped", reason: "status-off" };
  }

  const dryRun = opts.dryRun ?? client.sanityStatus === "Dry Run";

  if (client.sanityStatus === "Greenlit") {
    const id = buildDocumentId(client.airtableRecordId, runDate);
    if (await documentExists(client.sanityDataset, id)) {
      log.info({ id }, "Greenlit document already exists; skipping generation");
      return { status: "skipped", reason: "already-published" };
    }
  }

  const draft = await generatePost(client);
  const asDraft = client.sanityStatus !== "Greenlit";
  const post = buildPost({ client, draft, runDate, asDraft });

  if (dryRun) {
    log.info({ id: post._id, status: client.sanityStatus }, "DRY RUN: would write to Sanity");
    process.stdout.write(JSON.stringify(post, null, 2) + "\n");
    return { status: "dry-run", id: post._id };
  }

  if (asDraft) {
    const { id } = await writeDraft(client.sanityDataset, post);
    return { status: "draft", id };
  }
  const { id } = await writePublished(client.sanityDataset, post);
  return { status: "published", id };
}

export const singleClient = task({
  id: "seo-engine.single-client",
  queue: { concurrencyLimit: 4 },
  run: async (payload: RunArgs) => runForClient(payload),
});

// CLI entry — runs only when executed directly (e.g. `pnpm cli --client recXXX --dry-run`).
const isDirectInvocation =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectInvocation) {
  const { values } = parseArgs({
    options: {
      client: { type: "string" },
      "dry-run": { type: "boolean", default: undefined },
    },
    allowPositionals: true,
  });

  const recordId = values.client;
  if (!recordId) {
    process.stderr.write(
      "Usage: pnpm cli --client <recordId> [--dry-run]\n",
    );
    process.exit(1);
  }

  runForClient({ recordId, dryRun: values["dry-run"] })
    .then((result) => {
      logger.info(result, "single-client completed");
      process.exit(0);
    })
    .catch((err: Error) => {
      logger.error({ err: err.message, stack: err.stack }, "single-client failed");
      process.exit(1);
    });
}
