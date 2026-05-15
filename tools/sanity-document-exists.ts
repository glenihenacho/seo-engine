import { createClient, type SanityClient } from "@sanity/client";

import { getEnv } from "../lib/config.js";

let cached: SanityClient | undefined;

function client(): SanityClient {
  if (!cached) {
    const env = getEnv();
    cached = createClient({
      projectId: env.SANITY_PROJECT_ID,
      dataset: env.SANITY_DATASET,
      apiVersion: env.SANITY_API_VERSION,
      token: env.SANITY_TOKEN,
      useCdn: false,
    });
  }
  return cached;
}

export async function documentExists(documentId: string): Promise<boolean> {
  const result = await client().fetch<string | null>(`*[_id == $id][0]._id`, { id: documentId });
  return result !== null && result !== undefined;
}
