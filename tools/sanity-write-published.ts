import { logger } from "../lib/logger.js";
import type { SanityPost } from "../lib/models.js";

// PR #1 stub. PR #2 will replace this with
// `sanityClientFor(dataset).createIfNotExists(post)`.
export async function writePublished(
  dataset: string,
  post: SanityPost,
): Promise<{ id: string }> {
  logger.info(
    { dataset, id: post._id, title: post.title },
    "[stub] writePublished — Sanity write deferred to PR #2",
  );
  return { id: post._id };
}
