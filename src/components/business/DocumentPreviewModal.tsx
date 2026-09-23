import { useEffect, useCallback, useState } from "react";
import { X, Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import type { BusinessDocument } from "@/types";
import { fetchDocumentBlob } from "@/lib/downloadFile";

const isImageDoc = (doc: Pick<BusinessDocument, "name" | "mimeType">) =>
  doc.mimeType?.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(doc.name);

const isPdfDoc = (doc: Pick<BusinessDocument, "name" | "mimeType">) =>
  doc.mimeType === "application/pdf" || /\.pdf$/i.test(doc.name);

interface Props {
  doc: BusinessDocument | null;
  onClose: () => void;
  onDownload: (doc: BusinessDocument) => void;
  downloadingId: string | null;
  businessProfileId?: number;
}

export default function DocumentPreviewModal({ doc, onClose, onDownload, downloadingId, businessProfileId }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  /* Close on Escape key */
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!doc) return;
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [doc, handleKey]);

  // Fetch the file as a blob and preview *that* instead of pointing the
  // <img>/<iframe> straight at the storage URL — navigating an iframe to a
  // URL that responds with Content-Disposition: attachment makes the
  // browser silently trigger a download instead of rendering it, which is
  // exactly what looked like "clicking the card downloads it".
  useEffect(() => {
    setBlobUrl(null);
    setFailed(false);
    if (!doc || !(isImageDoc(doc) || isPdfDoc(doc))) return;

    let objectUrl: string | null = null;
    let cancelled = false;
    setLoading(true);

    fetchDocumentBlob(doc, businessProfileId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc, businessProfileId]);

  if (!doc) return null;

  const isDownloading = downloadingId === doc.id;
  const previewable = isImageDoc(doc) || isPdfDoc(doc);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel — stop clicks from bubbling to backdrop */}
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white dark:bg-[#1a1a1a] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-ink/8 dark:border-white/8">
          <FileText size={16} className="shrink-0 text-ink/50 dark:text-white/50" />
          <p className="flex-1 min-w-0 truncate text-sm font-semibold text-ink dark:text-white">
            {doc.name}
          </p>
          <div className="flex items-center gap-1">
            {/* Download — blob fetch, always saves to disk */}
            <button
              type="button"
              onClick={() => onDownload(doc)}
              disabled={isDownloading}
              title="Download"
              className="grid h-8 w-8 place-items-center rounded-lg text-ink/50 hover:bg-ink/5 hover:text-brand-600 disabled:opacity-50 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white transition"
            >
              {isDownloading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )}
            </button>
            {/* Open in new tab — the blob URL we already fetched for preview,
                not the raw storage URL, which triggers a download instead of
                opening (same Content-Disposition issue as the card click). */}
            <button
              type="button"
              onClick={() => window.open(blobUrl || doc.url, "_blank", "noreferrer")}
              className="grid h-8 w-8 place-items-center rounded-lg text-ink/50 hover:bg-ink/5 hover:text-brand-600 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white transition"
              title="Open in new tab"
            >
              <ExternalLink size={15} />
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-ink/50 hover:bg-ink/5 hover:text-rose-500 dark:text-white/50 dark:hover:bg-white/10 transition"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-mist dark:bg-[#111] min-h-0">
          {!previewable ? (
            /* Unsupported type */
            <div className="flex flex-col items-center justify-center gap-4 p-10 text-center min-h-64">
              <FileText size={44} className="text-ink/20 dark:text-white/20" />
              <p className="text-sm text-ink/50 dark:text-white/50">
                Preview is not available for this file type.
              </p>
              <button
                type="button"
                onClick={() => onDownload(doc)}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}
                Download file
              </button>
            </div>
          ) : loading ? (
            <div className="flex h-full min-h-64 items-center justify-center">
              <Loader2 size={28} className="animate-spin text-ink/30 dark:text-white/30" />
            </div>
          ) : failed || !blobUrl ? (
            <div className="flex flex-col items-center justify-center gap-4 p-10 text-center min-h-64">
              <FileText size={44} className="text-ink/20 dark:text-white/20" />
              <p className="text-sm text-ink/50 dark:text-white/50">Couldn&rsquo;t load a preview for this file.</p>
              <button
                type="button"
                onClick={() => onDownload(doc)}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}
                Download file
              </button>
            </div>
          ) : isImageDoc(doc) ? (
            /* Image preview */
            <div className="flex h-full min-h-64 items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blobUrl}
                alt={doc.name}
                className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>
          ) : (
            /* PDF preview — #toolbar=0&navpanes=0 suppresses Chrome's built-in
               PDF viewer chrome (toolbar, thumbnail sidebar) so this is just
               the document itself; our own header already has download/open
               actions, so that toolbar was pure duplication. */
            <iframe
              src={`${blobUrl}#toolbar=0&navpanes=0&statusbar=0`}
              title={doc.name}
              className="h-[75vh] w-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
