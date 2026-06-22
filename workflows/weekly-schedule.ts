import { schedules } from "@trigger.dev/sdk/v3";

import { logger } from "../lib/logger.js";
import { pickSlot } from "../lib/posting-windows.js";
import { listActiveSchedules } from "../tools/airtable-list-active-schedules.js";
import { singleClient } from "./single-client.js";

type BatchItem = {
  payload: { recordId: string };
  options: { delay: Date; idempotencyKey: string };
};

export const weeklySchedule = schedules.task({
  id: "seo-engine.weekly-schedule",
  cron: "0 0 * * 0",
  run: async (): Promise<{ scheduled: number }> => {
    const schedulesList = await listActiveSchedules();
    logger.info({ count: schedulesList.length }, "weekly schedule starting");

    const now = new Date();
    const items: BatchItem[] = [];

    for (const schedule of schedulesList) {
      if (
        schedule.postsPerWeek !== undefined &&
        schedule.postsPerWeek !== schedule.postingWindows.length
      ) {
        logger.warn(
          {
            schedule: schedule.name,
            postsPerWeek: schedule.postsPerWeek,
            windows: schedule.postingWindows.length,
          },
          "posts-per-week does not match number of windows; trusting windows",
        );
      }

      for (const window of schedule.postingWindows) {
        try {
          const runAt = pickSlot(window, now);
          const dateKey = runAt.toISOString().slice(0, 10);
          items.push({
            payload: { recordId: schedule.clientRecordId },
            options: {
              delay: runAt,
              idempotencyKey: `${schedule.clientRecordId}-${schedule.airtableRecordId}-${dateKey}`,
            },
          });
        } catch (err) {
          logger.error(
            { schedule: schedule.name, window, err: (err as Error).message },
            "skipping invalid window",
          );
        }
      }
    }

    if (items.length === 0) {
      logger.info("no slots to schedule");
      return { scheduled: 0 };
    }

    await singleClient.batchTrigger(items);
    logger.info({ scheduled: items.length }, "weekly schedule complete");
    return { scheduled: items.length };
  },
});
