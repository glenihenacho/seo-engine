import { createClient, type SanityClient } from "@sanity/client";

import { getEnv } from "./config.js";

const cache = new Map<string, SanityClient>();

export function sanityClientFor(dataset: string): SanityClient {
  const existing = cache.get(dataset);
  if (existing) return existing;

  const env = getEnv();
  const client = createClient({
    projectId: env.SANITY_PROJECT_ID,
    dataset,
    apiVersion: env.SANITY_API_VERSION,
    token: env.SANITY_TOKEN,
    useCdn: false,
  });
  cache.set(dataset, client);
  return client;
}

export function resetSanityClientCacheForTests(): void {
  cache.clear();
}
