/**
 * Client-side "render the DOM to a PDF" helpers for CV, Portfolio, and
 * Digital Card downloads. The Card's server-side route
 * (profileService.downloadCardPdf) depends on a Chromium binary the Vercel
 * deployment doesn't provision (puppeteer-core has nothing to launch there,
 * so it 503s) — these capture the already-rendered preview with
 * html2canvas and assemble a real downloadable PDF file with jsPDF,
 * entirely in the browser, no backend rendering required.
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
 * One PDF page per card face (front, back — each its own element, e.g.
 * CardPreview's `[data-card-face]` divs), every page sized to that face's
 * own aspect ratio instead of an A4 sheet or one shared page. Capturing
 * both faces together onto a single tall page (stacked, as they appear on
 * screen) made the PDF page itself absurdly tall — a PDF viewer showing
 * "fit width" then only displayed the top portion, making the front face
 * look blown up and cutting the back face off entirely. Separate
 * correctly-proportioned pages match what's on screen exactly.
 */
export async function exportCardFacesToPdf(faces: HTMLElement[], filename: string) {
  if (faces.length === 0) throw new Error("Nothing to export");
  const widthMm = 90;
  let pdf: jsPDF | null = null;

  for (let i = 0; i < faces.length; i++) {
    const canvas = await captureCanvas(faces[i]);
    const heightMm = (canvas.height * widthMm) / canvas.width;
    // jsPDF defaults to portrait orientation — for a landscape card (wider
    // than tall) that leaves the actual page shape wrong even though the
    // format array itself says [width, height], and the image then only
    // fills a small portion of a much taller-than-expected page (the huge
    // blank gap under a cropped-looking face in the downloaded PDF). Has
    // to be told explicitly which way this particular face goes.
    const orientation = widthMm > heightMm ? "landscape" : "portrait";
    if (!pdf) {
      pdf = new jsPDF({ unit: "mm", format: [widthMm, heightMm], orientation });
    } else {
      pdf.addPage([widthMm, heightMm], orientation);
    }
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, widthMm, heightMm);
  }

  pdf!.save(filename);
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
