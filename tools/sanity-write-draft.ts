import { logger } from "../lib/logger.js";
import type { SanityPost } from "../lib/models.js";

// PR #1 stub. PR #2 will replace this with a real `client.createOrReplace(post)` call
// once we have confirmed the Sanity schema via `get_schema` and have a write token.
export async function writeDraft(post: SanityPost): Promise<{ id: string }> {
  logger.info(
    { id: post._id, title: post.title },
    "[stub] writeDraft — Sanity write deferred to PR #2",
  );
  return { id: post._id };
}
