import { z } from "zod";

export const SanityStatus = z.enum(["Off", "Dry Run", "Needs Review", "Greenlit"]);
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
  author: z
    .object({ _type: z.literal("reference"), _ref: z.string() })
    .optional(),
  generatedBy: z.literal("seo-engine"),
  airtableClientId: z.string(),
  generatedAt: z.string().datetime(),
});
export type SanityPost = z.infer<typeof SanityPost>;

export const PostingWindow = z.object({
  day: z.number().int().min(0).max(6),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});
export type PostingWindow = z.infer<typeof PostingWindow>;

export const ContentSchedule = z.object({
  airtableRecordId: z.string(),
  name: z.string(),
  clientRecordId: z.string(),
  type: z.string().optional(),
  postsPerWeek: z.number().int().positive().optional(),
  postingWindows: z.array(PostingWindow),
  active: z.boolean(),
});
export type ContentSchedule = z.infer<typeof ContentSchedule>;
