import { SanityPost, type Client, type ContentDraft } from "./models.js";
import { buildDocumentId, buildDraftId } from "./ids.js";
import { markdownToPortableText } from "./portable-text.js";

export function buildPost(args: {
  client: Client;
  draft: ContentDraft;
  runDate: Date;
  asDraft: boolean;
}): SanityPost {
  const { client, draft, runDate, asDraft } = args;
  const _id = asDraft
    ? buildDraftId(client.airtableRecordId, runDate)
    : buildDocumentId(client.airtableRecordId, runDate);
  const authorRef = client.sanityAuthorRef ?? "author.ai-content";

  return SanityPost.parse({
    _id,
    _type: "post",
    title: draft.title,
    slug: { _type: "slug", current: draft.slug },
    body: markdownToPortableText(draft.bodyMarkdown),
    metaDescription: draft.metaDescription,
    targetKeyword: draft.targetKeyword,
    author: { _type: "reference", _ref: authorRef },
    generatedBy: "seo-engine",
    airtableClientId: client.airtableRecordId,
    generatedAt: draft.generatedAt,
  });
}
