/**
 * Client-side "render the DOM to a PDF" helpers for CV and Portfolio
 * downloads — there's no backend PDF route for either (unlike the Digital
 * Card, which renders server-side via profileService.downloadCardPdf), so
 * these capture the already-rendered preview with html2canvas and assemble
 * a real downloadable PDF file with jsPDF, entirely in the browser.
 */
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

async function captureCanvas(el: HTMLElement) {
  // Without this, html2canvas can capture mid font-swap (FOUT) — the
  // fallback and web font both partially painted — which shows up as
  // smudged/overlapping "ghost" text in the exported PDF, especially for
  // templates using a Google Font that's still loading over the network.
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      /* fonts API not fully supported — proceed with best-effort capture */
    }
  }

  return html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });
}

/**
 * One PDF page per element — for content that's already paginated into
 * discrete A4-shaped pages (ResumePreview's `[data-cv-page]` divs).
 */
export async function exportPagesToPdf(pages: HTMLElement[], filename: string) {
  if (pages.length === 0) throw new Error("Nothing to export");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  for (let i = 0; i < pages.length; i++) {
    const canvas = await captureCanvas(pages[i]);
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
  }

  pdf.save(filename);
}

/**
 * A single, possibly very tall element (e.g. Portfolio's one continuous
 * page) — captured once, then sliced into as many A4-width pages as the
 * content needs.
 */
export async function exportHtmlToPdf(el: HTMLElement, filename: string) {
  const canvas = await captureCanvas(el);
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  const imgWidthMm = A4_WIDTH_MM;
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

  if (imgHeightMm <= A4_HEIGHT_MM) {
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, imgWidthMm, imgHeightMm);
    pdf.save(filename);
    return;
  }

  // Slice the tall canvas into page-height chunks, one PDF page each.
  const pxPerPage = (A4_HEIGHT_MM * canvas.width) / imgWidthMm;
  let renderedPx = 0;
  let first = true;

  while (renderedPx < canvas.height) {
    const sliceHeightPx = Math.min(pxPerPage, canvas.height - renderedPx);
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;
    const ctx = sliceCanvas.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

    if (!first) pdf.addPage();
    first = false;
    const sliceHeightMm = (sliceHeightPx * imgWidthMm) / canvas.width;
    pdf.addImage(sliceCanvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, imgWidthMm, sliceHeightMm);
    renderedPx += sliceHeightPx;
  }

  pdf.save(filename);
}
