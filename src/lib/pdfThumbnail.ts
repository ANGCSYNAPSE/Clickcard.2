/** Renders a PDF blob's first page to a PNG data URL, for use as a card
 * thumbnail. Runs entirely client-side (pdf.js + canvas) — no server
 * involvement needed.
 * Uses dynamic import so pdfjs-dist is never loaded during server-side rendering. */
export async function renderPdfThumbnail(blob: Blob, targetWidth = 400): Promise<string> {
  if (typeof window === "undefined") return "";

  const pdfjsLib = await import("pdfjs-dist");
  if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await blob.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas not supported");

  await page.render({ canvas, canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/png");
}
