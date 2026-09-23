import { businessProfileService } from "@/services/businessProfileService";

/** Fetches a document's bytes as a Blob — via our authenticated backend
 * proxy when a businessProfileId is given, otherwise straight from storage.
 * Used for both downloads and inline preview: reading the response as a
 * Blob (rather than pointing an <a>/<iframe> straight at the storage URL)
 * sidesteps a `Content-Disposition: attachment` response silently forcing
 * a browser download instead of letting us render or save it ourselves. */
export async function fetchDocumentBlob(
  doc: { id: string; url: string },
  businessProfileId?: number,
): Promise<Blob> {
  if (businessProfileId) {
    const { data } = await businessProfileService.downloadDocument(businessProfileId, doc.id);
    return data;
  }
  const res = await fetch(doc.url);
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
  return res.blob();
}

/** Triggers a browser save-as for an already-fetched blob via a
 * programmatic anchor click — the actual mechanics shared by both
 * `downloadFile` below and any caller that already has a Blob (e.g. one
 * fetched through our own backend instead of directly from storage). */
export function saveBlob(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Revoke the blob URL after a short delay to allow the download to start
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
}

/**
 * Force-downloads a file by fetching it as a blob and triggering a
 * programmatic anchor click. This works even for cross-origin URLs
 * (Supabase Storage, S3, Cloudflare R2, etc.) where the HTML
 * `download` attribute is silently ignored by the browser.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
  saveBlob(await res.blob(), filename);
}
