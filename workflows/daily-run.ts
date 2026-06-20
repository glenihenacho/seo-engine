import { schedules } from "@trigger.dev/sdk/v3";

import { logger } from "../lib/logger.js";
import { listReadyClients } from "../tools/airtable-list-ready-clients.js";
import { runForResolvedClient, type RunResult } from "./single-client.js";

type ClientOutcome = {
  recordId: string;
  name: string;
  result: RunResult | null;
  error?: string;
};

export const dailyRun = schedules.task({
  id: "seo-engine.daily-run",
  cron: "0 13 * * *",
  run: async (): Promise<{ total: number; outcomes: ClientOutcome[] }> => {
    const clients = await listReadyClients();
    logger.info({ count: clients.length }, "daily run starting");

    const outcomes: ClientOutcome[] = [];
    for (const client of clients) {
      try {
        const result = await runForResolvedClient(client, { dryRun: client.dryRun });
        outcomes.push({
          recordId: client.airtableRecordId,
          name: client.name,
          result,
        });
      } catch (err) {
        const message = (err as Error).message;
        logger.error(
          { recordId: client.airtableRecordId, name: client.name, err: message },
          "client failed; continuing batch",
        );
        outcomes.push({
          recordId: client.airtableRecordId,
          name: client.name,
          result: null,
          error: message,
        });
      }
    }

    logger.info({ total: outcomes.length }, "daily run complete");
    return { total: outcomes.length, outcomes };
  },
});
