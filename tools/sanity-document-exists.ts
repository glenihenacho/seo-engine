import { sanityClientFor } from "../lib/sanity-client.js";

export async function documentExists(dataset: string, documentId: string): Promise<boolean> {
  const result = await sanityClientFor(dataset).fetch<string | null>(
    `*[_id == $id][0]._id`,
    { id: documentId },
  );
  return result !== null && result !== undefined;
}
