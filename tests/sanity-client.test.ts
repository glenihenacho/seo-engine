import { beforeEach, describe, expect, it } from "vitest";

import { resetEnvCacheForTests } from "../lib/config.js";
import {
  resetSanityClientCacheForTests,
  sanityClientFor,
} from "../lib/sanity-client.js";

beforeEach(() => {
  process.env.AIRTABLE_API_KEY = "ak";
  process.env.OPENROUTER_API_KEY = "ork";
  process.env.SANITY_PROJECT_ID = "proj";
  process.env.SANITY_TOKEN = "tok";
  resetEnvCacheForTests();
  resetSanityClientCacheForTests();
});

describe("sanityClientFor", () => {
  it("returns distinct clients for distinct datasets", () => {
    const a = sanityClientFor("acme");
    const b = sanityClientFor("beta-co");
    expect(a).not.toBe(b);
    expect(a.config().dataset).toBe("acme");
    expect(b.config().dataset).toBe("beta-co");
  });

  it("caches by dataset so repeat calls return the same instance", () => {
    const first = sanityClientFor("acme");
    const second = sanityClientFor("acme");
    expect(first).toBe(second);
  });

  it("threads projectId, apiVersion, and token from env", () => {
    const client = sanityClientFor("acme");
    expect(client.config().projectId).toBe("proj");
    expect(client.config().token).toBe("tok");
    expect(client.config().useCdn).toBe(false);
  });
});
