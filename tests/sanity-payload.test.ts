import { describe, expect, it } from "vitest";

import type { Client, ContentDraft } from "../lib/models.js";
import { buildPost } from "../lib/post-builder.js";

const client: Client = {
  airtableRecordId: "rec123",
  name: "Acme",
  brandVoice: "v",
  targetKeywords: ["kw"],
  audience: "a",
  sanityStatus: "Greenlit",
  sanityDataset: "acme",
  isReady: true,
  sanityAuthorRef: null,
};

const draft: ContentDraft = {
  title: "Hello World",
  slug: "hello-world",
  bodyMarkdown: "## Section 1\n\nFirst paragraph.\n\nSecond paragraph.",
  metaDescription: "m".repeat(150),
  targetKeyword: "kw",
  generatedAt: "2026-05-15T13:00:00.000Z",
};

const runDate = new Date("2026-05-15T13:00:00Z");

describe("buildPost", () => {
  it("uses a deterministic published _id", () => {
    const post = buildPost({ client, draft, runDate, asDraft: false });
    expect(post._id).toBe("seo-engine.rec123.2026-05-15");
    expect(post._type).toBe("post");
    expect(post.slug).toEqual({ _type: "slug", current: "hello-world" });
    expect(post.generatedBy).toBe("seo-engine");
    expect(post.airtableClientId).toBe("rec123");
    expect(post.generatedAt).toBe("2026-05-15T13:00:00.000Z");
  });

  it("prefixes drafts. on the draft path", () => {
    const post = buildPost({ client, draft, runDate, asDraft: true });
    expect(post._id).toBe("drafts.seo-engine.rec123.2026-05-15");
  });

  it("converts markdown into PortableText blocks (h2 + normal)", () => {
    const post = buildPost({ client, draft, runDate, asDraft: false });
    expect(post.body).toHaveLength(3);
    expect(post.body[0]).toMatchObject({ _type: "block", style: "h2" });
    expect(post.body[1]).toMatchObject({ _type: "block", style: "normal" });
    expect(post.body[2]).toMatchObject({ _type: "block", style: "normal" });
  });
});
