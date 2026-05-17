import Airtable from "airtable";

import { getEnv } from "../lib/config.js";
import { logger } from "../lib/logger.js";
import { Client, SanityStatus } from "../lib/models.js";

type AirtableFields = Record<string, unknown>;
type AirtableRecord = { id: string; fields: AirtableFields };

export function recordToClient(record: AirtableRecord): Client {
  const fields = record.fields;

  const statusRaw = (fields["Sanity Status"] ?? "Off") as string;
  const status = SanityStatus.safeParse(statusRaw);
  if (!status.success) {
    throw new Error(`Invalid Sanity Status "${statusRaw}" on record ${record.id}`);
  }

  const authorRaw = fields["Sanity Author Ref"];
  const sanityAuthorRef =
    typeof authorRaw === "string" && authorRaw.length > 0 ? authorRaw : null;

  const datasetRaw = fields["Sanity Dataset"];
  if (typeof datasetRaw !== "string" || datasetRaw.length === 0) {
    throw new Error(`Missing or empty Sanity Dataset on record ${record.id}`);
  }

  return Client.parse({
    airtableRecordId: record.id,
    name: String(fields["Client Name"] ?? ""),
    brandVoice: String(fields["Brand Voice Guidelines"] ?? ""),
    audience: String(fields["Audience Segments (Summary)"] ?? ""),
    industry: String(fields["Industry"] ?? ""),
    services: String(fields["Services (Summary)"] ?? ""),
    painPoints: String(fields["Key Pain Points"] ?? ""),
    forbiddenTerms: String(fields["Forbidden Terms"] ?? ""),
    sanityStatus: status.data,
    sanityDataset: datasetRaw,
    isReady: Boolean(fields["Is Ready for Gumloop (Any)"]),
    sanityAuthorRef,
  });
}

export async function listReadyClients(): Promise<Client[]> {
  const env = getEnv();
  const base = new Airtable({ apiKey: env.AIRTABLE_API_KEY }).base(env.AIRTABLE_BASE_ID);
  const records = await base(env.AIRTABLE_TABLE)
    .select({ filterByFormula: "{Is Ready for Gumloop (Any)} = TRUE()" })
    .all();

  const clients: Client[] = [];
  for (const r of records) {
    try {
      clients.push(recordToClient({ id: r.id, fields: r.fields as AirtableFields }));
    } catch (err) {
      logger.error(
        { recordId: r.id, err: (err as Error).message },
        "skipping invalid client record",
      );
    }
  }
  return clients;
}
