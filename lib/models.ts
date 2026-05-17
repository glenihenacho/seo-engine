import { z } from "zod";

export const SanityStatus = z.enum(["Off", "Needs Review", "Greenlit"]);
export type SanityStatus = z.infer<typeof SanityStatus>;

export const Client = z.object({
  airtableRecordId: z.string(),
  name: z.string(),
  brandVoice: z.string(),
  audience: z.string(),
  industry: z.string(),
  services: z.string(),
  painPoints: z.string(),
  forbiddenTerms: z.string(),
  sanityStatus: SanityStatus,
  sanityDataset: z.string().min(1),
  isReady: z.boolean(),
  sanityAuthorRef: z.string().nullable(),
});
export type Client = z.infer<typeof Client>;

export const ContentDraft = z.object({
  title: z.string(),
  slug: z.string(),
  bodyMarkdown: z.string(),
  metaDescription: z.string(),
  targetKeyword: z.string(),
  generatedAt: z.string().datetime(),
});
export type ContentDraft = z.infer<typeof ContentDraft>;

export const SanityPost = z.object({
  _id: z.string(),
  _type: z.literal("post"),
  title: z.string(),
  slug: z.object({ _type: z.literal("slug"), current: z.string() }),
  body: z.array(z.record(z.any())),
  metaDescription: z.string(),
  targetKeyword: z.string(),
  generatedBy: z.literal("seo-engine"),
  airtableClientId: z.string(),
  generatedAt: z.string().datetime(),
});
export type SanityPost = z.infer<typeof SanityPost>;
