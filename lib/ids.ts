export function isoDateUtc(runDate: Date): string {
  return runDate.toISOString().slice(0, 10);
}

export function buildDocumentId(recordId: string, runDate: Date): string {
  return `seo-engine.${recordId}.${isoDateUtc(runDate)}`;
}

export function buildDraftId(recordId: string, runDate: Date): string {
  return `drafts.${buildDocumentId(recordId, runDate)}`;
}
