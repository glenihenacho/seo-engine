import { logger } from "../lib/logger.js";
import type { SanityPost } from "../lib/models.js";
import { sanityClientFor } from "../lib/sanity-client.js";

export async function writeDraft(
  dataset: string,
  post: SanityPost,
): Promise<{ id: string }> {
  const client = sanityClientFor(dataset);
  const result = await client.createOrReplace(post);
  logger.info(
    { dataset, id: result._id, title: post.title },
    "wrote Sanity draft",
  );
  return { id: result._id };
}
