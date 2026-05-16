import { logger } from "../lib/logger.js";
import type { SanityPost } from "../lib/models.js";

// PR #1 stub. PR #2 will replace this with a real
// `sanityClientFor(dataset).createOrReplace(post)` call once the
// Sanity schema and write token are in place.
export async function writeDraft(
  dataset: string,
  post: SanityPost,
): Promise<{ id: string }> {
  logger.info(
    { dataset, id: post._id, title: post.title },
    "[stub] writeDraft — Sanity write deferred to PR #2",
  );
  return { id: post._id };
}
