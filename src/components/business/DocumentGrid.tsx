import { useEffect, useState } from "react";
import { FileText, Download, Trash2, Loader2 } from "lucide-react";
import type { BusinessDocument } from "@/types";
import DocumentPreviewModal from "./DocumentPreviewModal";
import { fetchDocumentBlob, saveBlob } from "@/lib/downloadFile";
import { renderPdfThumbnail } from "@/lib/pdfThumbnail";

const getExt = (name: string) => name.split(".").pop()?.toLowerCase() || "";

const isImageDoc = (doc: Pick<BusinessDocument, "name" | "mimeType">) =>
  doc.mimeType?.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(doc.name);

const isPdfDoc = (doc: Pick<BusinessDocument, "name" | "mimeType">) =>
  doc.mimeType === "application/pdf" || /\.pdf$/i.test(doc.name);

const FILE_TILE_STYLES: Record<string, string> = {
  pdf: "bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400",
  doc: "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400",
  docx: "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400",
  xls: "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400",
  xlsx: "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400",
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

/** Card grid of uploaded documents, with an image/file-type preview tile.
 * `onRemove` is only passed by the owner's editable page — the public
 * shareable page renders the same grid read-only (download only).
 * `businessProfileId` is likewise owner-only — it lets downloads go through
 * our own authenticated backend proxy (which sets the correct filename and
 * Content-Disposition itself) instead of fetching Cloudinary's raw delivery
 * URL directly from the browser. */
export default function DocumentGrid({
  documents,
  onRemove,
  businessProfileId,
}: {
  documents: BusinessDocument[];
  onRemove?: (id: string) => void;
  businessProfileId?: number;
}) {
  const [previewDoc, setPreviewDoc] = useState<BusinessDocument | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  // Render an actual page-1 thumbnail for each PDF instead of the generic
  // file-type icon — fetched as a blob (same helper as downloads) and
  // rendered client-side with pdf.js, so no server-side work is needed.
  useEffect(() => {
    let cancelled = false;
    documents.filter(isPdfDoc).forEach(async (doc) => {
      if (thumbnails[doc.id]) return;
      try {
        const blob = await fetchDocumentBlob(doc, businessProfileId);
        const dataUrl = await renderPdfThumbnail(blob);
        if (!cancelled) setThumbnails((prev) => ({ ...prev, [doc.id]: dataUrl }));
      } catch {
        // Leave it — the tile falls back to the generic PDF icon.
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, businessProfileId]);

  const handleDownload = async (doc: BusinessDocument) => {
    if (downloadingId) return;
    setDownloadingId(doc.id);
    try {
      const blob = await fetchDocumentBlob(doc, businessProfileId);
      saveBlob(blob, doc.name);
    } catch {
      try {
        // Retry with a direct fetch in case only the authenticated proxy failed.
        const blob = await fetchDocumentBlob(doc);
        saveBlob(blob, doc.name);
      } catch {
        // Last resort: just navigate to it — a save prompt or the
        // browser's own viewer, better than nothing.
        window.open(doc.url, "_blank", "noreferrer");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {documents.map((doc) => {
          const ext = getExt(doc.name);
          const isDownloading = downloadingId === doc.id;
          return (
            <div
              key={doc.id}
              className="group overflow-hidden rounded-2xl border border-ink/5 bg-paper-soft transition hover:border-brand-200 dark:border-white/5 dark:bg-white/5"
            >
              {/* Tile — click to preview */}
              <button
                type="button"
                onClick={() => setPreviewDoc(doc)}
                className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-white dark:bg-[#1f1f1f] cursor-pointer"
              >
                {isImageDoc(doc) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={doc.url} alt={doc.name} className="h-full w-full object-cover" />
                ) : isPdfDoc(doc) && thumbnails[doc.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnails[doc.id]} alt={doc.name} className="h-full w-full object-cover" />
                ) : (
                  <div
                    className={`flex h-full w-full flex-col items-center justify-center gap-1.5 ${
                      FILE_TILE_STYLES[ext] || "bg-mist text-ink/40 dark:bg-white/10 dark:text-white/40"
                    }`}
                  >
                    <FileText size={28} />
                    {ext && <span className="text-[10px] font-black uppercase tracking-wider">{ext}</span>}
                  </div>
                )}
              </button>

              <div className="flex items-center gap-1.5 p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink dark:text-white">{doc.name}</p>
                  {doc.size ? (
                    <p className="text-[10px] text-ink/40 dark:text-white/40">{formatBytes(doc.size)}</p>
                  ) : null}
                </div>

                {/* Download button — blob fetch so it always saves to disk */}
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  disabled={isDownloading}
                  title="Download"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink/45 transition hover:bg-white hover:text-brand-600 disabled:opacity-50 dark:text-white/45 dark:hover:bg-white/10"
                >
                  {isDownloading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Download size={13} />
                  )}
                </button>

                {onRemove && (
                  <button
                    onClick={() => onRemove(doc.id)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink/45 transition hover:bg-white hover:text-rose-500 dark:text-white/45 dark:hover:bg-white/10"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Document preview modal */}
      <DocumentPreviewModal
        doc={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownload}
        downloadingId={downloadingId}
        businessProfileId={businessProfileId}
      />
    </>
  );
}
