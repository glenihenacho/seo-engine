import Airtable from "airtable";

import { getEnv } from "../lib/config.js";
import type { Client } from "../lib/models.js";
import { recordToClient } from "./airtable-list-ready-clients.js";

export async function getClient(recordId: string): Promise<Client> {
  const env = getEnv();
  const base = new Airtable({ apiKey: env.AIRTABLE_API_KEY }).base(env.AIRTABLE_BASE_ID);
  const record = await base(env.AIRTABLE_TABLE).find(recordId);
  return recordToClient({ id: record.id, fields: record.fields as Record<string, unknown> });
}
