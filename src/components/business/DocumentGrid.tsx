import { FileText, Download, Trash2 } from "lucide-react";
import type { BusinessDocument } from "@/types";

const getExt = (name: string) => name.split(".").pop()?.toLowerCase() || "";

const isImageDoc = (doc: Pick<BusinessDocument, "name" | "mimeType">) =>
  doc.mimeType?.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(doc.name);

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
 * shareable page renders the same grid read-only (download only). */
export default function DocumentGrid({
  documents,
  onRemove,
}: {
  documents: BusinessDocument[];
  onRemove?: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {documents.map((doc) => {
        const ext = getExt(doc.name);
        return (
          <div
            key={doc.id}
            className="group overflow-hidden rounded-2xl border border-ink/5 bg-paper-soft transition hover:border-brand-200 dark:border-white/5 dark:bg-white/5"
          >
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-white dark:bg-[#1f1f1f]"
            >
              {isImageDoc(doc) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doc.url} alt={doc.name} className="h-full w-full object-cover" />
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
            </a>
            <div className="flex items-center gap-1.5 p-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink dark:text-white">{doc.name}</p>
                {doc.size ? (
                  <p className="text-[10px] text-ink/40 dark:text-white/40">{formatBytes(doc.size)}</p>
                ) : null}
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink/45 transition hover:bg-white hover:text-brand-600 dark:text-white/45 dark:hover:bg-white/10"
              >
                <Download size={13} />
              </a>
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
  );
}
