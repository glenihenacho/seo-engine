import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../tools/airtable-get-client.js", () => ({
  getClient: vi.fn(),
}));
vi.mock("../tools/sanity-document-exists.js", () => ({
  documentExists: vi.fn(),
}));
vi.mock("../tools/sanity-write-draft.js", () => ({
  writeDraft: vi.fn(),
}));
vi.mock("../tools/sanity-write-published.js", () => ({
  writePublished: vi.fn(),
}));
vi.mock("../lib/generation.js", () => ({
  generatePost: vi.fn(),
}));

import { generatePost } from "../lib/generation.js";
import type { Client, ContentDraft } from "../lib/models.js";
import { documentExists } from "../tools/sanity-document-exists.js";
import { writeDraft } from "../tools/sanity-write-draft.js";
import { writePublished } from "../tools/sanity-write-published.js";
import { runForResolvedClient } from "../workflows/single-client.js";

const baseClient: Client = {
  airtableRecordId: "rec1",
  name: "Acme",
  brandVoice: "vox",
  targetKeywords: ["kw"],
  audience: "aud",
  sanityStatus: "Greenlit",
  sanityDataset: "acme",
  isReady: true,
  sanityAuthorRef: null,
};

const draft: ContentDraft = {
  title: "T",
  slug: "t",
  bodyMarkdown: "# Hi\n\nBody.",
  metaDescription: "m".repeat(150),
  targetKeyword: "kw",
  generatedAt: "2026-05-15T13:00:00.000Z",
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(generatePost).mockResolvedValue(draft);
  vi.mocked(documentExists).mockResolvedValue(false);
  vi.mocked(writeDraft).mockResolvedValue({ id: "drafts.x" });
  vi.mocked(writePublished).mockResolvedValue({ id: "x" });
});

describe("runForResolvedClient routing", () => {
  it("skips when isReady is false", async () => {
    const r = await runForResolvedClient({ ...baseClient, isReady: false }, { dryRun: false });
    expect(r).toEqual({ status: "skipped", reason: "not-ready" });
    expect(generatePost).not.toHaveBeenCalled();
  });

  it("skips when sanityStatus is Off", async () => {
    const r = await runForResolvedClient(
      { ...baseClient, sanityStatus: "Off" },
      { dryRun: false },
    );
    expect(r).toEqual({ status: "skipped", reason: "status-off" });
    expect(generatePost).not.toHaveBeenCalled();
  });

  it("writes a draft on Needs Review and passes the client's dataset", async () => {
    const r = await runForResolvedClient(
      { ...baseClient, sanityStatus: "Needs Review", sanityDataset: "beta-co" },
      { dryRun: false },
    );
    expect(r.status).toBe("draft");
    expect(writeDraft).toHaveBeenCalledOnce();
    expect(vi.mocked(writeDraft).mock.calls[0]?.[0]).toBe("beta-co");
    expect(writePublished).not.toHaveBeenCalled();
  });

  it("publishes on Greenlit when no existing doc, passing the client's dataset", async () => {
    const r = await runForResolvedClient(baseClient, { dryRun: false });
    expect(r.status).toBe("published");
    expect(writePublished).toHaveBeenCalledOnce();
    expect(vi.mocked(writePublished).mock.calls[0]?.[0]).toBe("acme");
    expect(writeDraft).not.toHaveBeenCalled();
  });

  it("skips generation on Greenlit when document already exists in the client's dataset", async () => {
    vi.mocked(documentExists).mockResolvedValueOnce(true);
    const r = await runForResolvedClient(baseClient, { dryRun: false });
    expect(r).toEqual({ status: "skipped", reason: "already-published" });
    expect(vi.mocked(documentExists).mock.calls[0]?.[0]).toBe("acme");
    expect(generatePost).not.toHaveBeenCalled();
    expect(writePublished).not.toHaveBeenCalled();
  });

  it("dry-run skips both write tools but still generates", async () => {
    const r = await runForResolvedClient(
      { ...baseClient, sanityStatus: "Needs Review" },
      { dryRun: true },
    );
    expect(r.status).toBe("dry-run");
    expect(generatePost).toHaveBeenCalledOnce();
    expect(writeDraft).not.toHaveBeenCalled();
    expect(writePublished).not.toHaveBeenCalled();
  });
});
