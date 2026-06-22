import Airtable from "airtable";

import { getEnv } from "../lib/config.js";
import { logger } from "../lib/logger.js";
import { ContentSchedule } from "../lib/models.js";
import { parsePostingWindows } from "../lib/posting-windows.js";

type AirtableFields = Record<string, unknown>;
type AirtableRecord = { id: string; fields: AirtableFields };

export function recordToSchedule(record: AirtableRecord): ContentSchedule {
  const fields = record.fields;

  const clientLinks = fields["Client"];
  const clientRecordId =
    Array.isArray(clientLinks) && clientLinks.length > 0 && typeof clientLinks[0] === "string"
      ? clientLinks[0]
      : null;
  if (!clientRecordId) {
    throw new Error(`Schedule ${record.id} has no linked Client`);
  }

  const windowsRaw = typeof fields["Posting Windows"] === "string" ? fields["Posting Windows"] : "";
  const postingWindows = parsePostingWindows(windowsRaw);

  const typeRaw = fields["Type"];
  const type = typeof typeRaw === "string" ? typeRaw : undefined;

  const postsPerWeekRaw = fields["Posts per week"];
  const postsPerWeek = typeof postsPerWeekRaw === "number" ? postsPerWeekRaw : undefined;

  return ContentSchedule.parse({
    airtableRecordId: record.id,
    name: String(fields["Schedule Name"] ?? ""),
    clientRecordId,
    type,
    postsPerWeek,
    postingWindows,
    active: Boolean(fields["Active"]),
  });
}

export async function listActiveSchedules(): Promise<ContentSchedule[]> {
  const env = getEnv();
  const base = new Airtable({ apiKey: env.AIRTABLE_API_KEY }).base(env.AIRTABLE_BASE_ID);
  const records = await base(env.AIRTABLE_SCHEDULES_TABLE)
    .select({ filterByFormula: "{Active} = TRUE()" })
    .all();

  const schedules: ContentSchedule[] = [];
  for (const r of records) {
    try {
      schedules.push(recordToSchedule({ id: r.id, fields: r.fields as AirtableFields }));
    } catch (err) {
      logger.error(
        { recordId: r.id, err: (err as Error).message },
        "skipping invalid schedule record",
      );
    }
  }
  return schedules;
}
