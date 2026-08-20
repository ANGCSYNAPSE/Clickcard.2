/**
 * Client-side PDF export helpers for:
 * - CV
 * - Portfolio
 * - Digital Business Cards
 *
 * Uses:
 * - html2canvas -> captures the rendered DOM
 * - pdf-lib -> creates the final PDF
 */

import { PDFDocument } from "pdf-lib";
import html2canvas from "html2canvas";

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const MM_TO_PT = 2.8346456693;

/**
 * Wait until fonts and images inside an element are ready.
 */
async function waitForAssets(el: HTMLElement) {
  // Wait for web fonts
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue if Font Loading API is unavailable
    }
  }

  // Wait for images
  const images = Array.from(el.querySelectorAll("img"));

  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        const done = () => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        };

        img.addEventListener("load", done);
        img.addEventListener("error", done);
      });
    }),
  );
}

/**
 * Capture an element into a canvas.
 *
 * Important:
 * The digital-card preview is normally scaled down using CSS.
 * Capturing that scaled preview can cause:
 *
 * - text clipping
 * - incorrect positions
 * - stretched backgrounds
 * - wrong spacing
 * - missing content
 *
 * So we clone the card, remove the preview scaling,
 * and render the clone at its real dimensions.
 */
async function captureCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  await waitForAssets(el);

  const rect = el.getBoundingClientRect();

  const computed = window.getComputedStyle(el);

  const width =
    el.offsetWidth ||
    parseFloat(computed.width) ||
    rect.width;

  const height =
    el.offsetHeight ||
    parseFloat(computed.height) ||
    rect.height;

  if (!width || !height) {
    throw new Error("Unable to determine element dimensions for PDF export.");
  }

  /**
   * Create an isolated wrapper.
   */
  const wrapper = document.createElement("div");

  wrapper.style.position = "fixed";
  wrapper.style.left = "-100000px";
  wrapper.style.top = "0";

  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;

  wrapper.style.margin = "0";
  wrapper.style.padding = "0";

  wrapper.style.overflow = "hidden";

  wrapper.style.background = "transparent";

  wrapper.style.zIndex = "-999999";

  /**
   * Clone the actual card.
   */
  const clone = el.cloneNode(true) as HTMLElement;

  clone.style.position = "relative";

  clone.style.left = "0";
  clone.style.top = "0";

  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;

  clone.style.minWidth = `${width}px`;
  clone.style.minHeight = `${height}px`;

  clone.style.maxWidth = "none";
  clone.style.maxHeight = "none";

  clone.style.margin = "0";
  clone.style.padding = computed.padding;

  /**
   * Most importantly:
   * remove any scale/transform from the preview.
   */
  clone.style.transform = "none";
  clone.style.transformOrigin = "top left";

  /**
   * Prevent responsive shrinking.
   */
  clone.style.flexShrink = "0";
  clone.style.boxSizing = "border-box";

  /**
   * Preserve clipping exactly like the card.
   */
  clone.style.overflow = "hidden";

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  /**
   * Wait one frame so the cloned card gets fully painted.
   */
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  await waitForAssets(clone);

  /**
   * Capture at high resolution.
   *
   * scale: 3 gives considerably better text quality in the PDF.
   */
  const canvas = await html2canvas(clone, {
    scale: 3,

    useCORS: true,
    allowTaint: false,

    backgroundColor: null,

    width: Math.round(width),
    height: Math.round(height),

    windowWidth: Math.round(width),
    windowHeight: Math.round(height),

    x: 0,
    y: 0,

    scrollX: 0,
    scrollY: 0,

    imageTimeout: 15000,

    logging: false,

    removeContainer: true,

    onclone: (clonedDocument) => {
      /**
       * Remove transforms from the cloned card.
       */
      const clonedElements =
        clonedDocument.querySelectorAll<HTMLElement>(
          "[data-card-face]",
        );

      clonedElements.forEach((element) => {
        element.style.transform = "none";
        element.style.transformOrigin = "top left";
      });
    },
  });

  /**
   * Remove temporary clone.
   */
  document.body.removeChild(wrapper);

  return canvas;
}

/**
 * Converts a data URL into raw bytes.
 */
function dataUrlToBytes(dataUrl: string): Uint8Array {
  const commaIndex = dataUrl.indexOf(",");

  if (commaIndex === -1) {
    throw new Error("Invalid data URL.");
  }

  const base64 = dataUrl.slice(commaIndex + 1);

  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

/**
 * Trigger browser download.
 */
function triggerDownload(
  bytes: Uint8Array,
  filename: string,
) {
  // pdf-lib's Uint8Array is typed against ArrayBufferLike, not concretely
  // ArrayBuffer — BlobPart wants the latter, hence the cast.
  const blob = new Blob(
    [bytes as unknown as ArrayBuffer],
    {
      type: "application/pdf",
    },
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  /**
   * Give the browser time to start the download
   * before removing the object URL.
   */
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Adds a canvas as a full-page image.
 */
async function addImagePage(
  pdfDoc: PDFDocument,
  canvas: HTMLCanvasElement,
  widthPt: number,
  heightPt: number,
) {
  /**
   * PNG is better for business cards because it keeps
   * small text, icons and geometric shapes sharp.
   */
  const pngBytes = dataUrlToBytes(
    canvas.toDataURL("image/png"),
  );

  const png = await pdfDoc.embedPng(pngBytes);

  /**
   * Create a completely separate PDF page.
   */
  const page = pdfDoc.addPage([
    widthPt,
    heightPt,
  ]);

  /**
   * Fill the entire page with the card image.
   */
  page.drawImage(png, {
    x: 0,
    y: 0,
    width: widthPt,
    height: heightPt,
  });
}

/**
 * ============================================================
 * CV PDF EXPORT
 * ============================================================
 *
 * One PDF page per [data-cv-page] element.
 */
export async function exportPagesToPdf(
  pages: HTMLElement[],
  filename: string,
) {
  if (pages.length === 0) {
    throw new Error("Nothing to export");
  }

  const pdfDoc = await PDFDocument.create();

  for (const page of pages) {
    const canvas = await captureCanvas(page);

    await addImagePage(
      pdfDoc,
      canvas,
      A4_WIDTH_PT,
      A4_HEIGHT_PT,
    );
  }

  const pdfBytes = await pdfDoc.save();

  triggerDownload(
    pdfBytes,
    filename,
  );
}

/**
 * ============================================================
 * DIGITAL BUSINESS CARD PDF EXPORT
 * ============================================================
 *
 * Exports:
 *
 * Front card -> PDF page 1
 * Back card  -> PDF page 2
 *
 * The page dimensions are calculated from the actual
 * card dimensions, so portrait and landscape templates
 * both work correctly.
 */
export async function exportCardFacesToPdf(
  faces: HTMLElement[],
  filename: string,
) {
  if (!faces || faces.length === 0) {
    throw new Error("Nothing to export");
  }

  const pdfDoc = await PDFDocument.create();

  /**
   * Standard business card width.
   * Both front and back use exactly the same PDF dimensions.
   */
  const CARD_WIDTH_MM = 90;
  const CARD_WIDTH_PT =
    CARD_WIDTH_MM * MM_TO_PT;

  /**
   * Only export the first two faces:
   *
   * faces[0] = FRONT
   * faces[1] = BACK
   */
  const frontFace = faces[0];
  const backFace = faces[1];

  /**
   * ---------------------------------------------------------
   * PAGE 1 — FRONT
   * ---------------------------------------------------------
   */
  if (frontFace) {
    const frontCanvas = await captureCanvas(frontFace);

    if (
      frontCanvas.width > 0 &&
      frontCanvas.height > 0
    ) {
      const frontHeightPt =
        (frontCanvas.height / frontCanvas.width) *
        CARD_WIDTH_PT;

      await addImagePage(
        pdfDoc,
        frontCanvas,
        CARD_WIDTH_PT,
        frontHeightPt,
      );
    }
  }

  /**
   * ---------------------------------------------------------
   * PAGE 2 — BACK
   * ---------------------------------------------------------
   */
  if (backFace) {
    const backCanvas = await captureCanvas(backFace);

    if (
      backCanvas.width > 0 &&
      backCanvas.height > 0
    ) {
      const backHeightPt =
        (backCanvas.height / backCanvas.width) *
        CARD_WIDTH_PT;

      await addImagePage(
        pdfDoc,
        backCanvas,
        CARD_WIDTH_PT,
        backHeightPt,
      );
    }
  }

  /**
   * Make sure at least one page was created.
   */
  if (pdfDoc.getPageCount() === 0) {
    throw new Error(
      "Unable to create card PDF.",
    );
  }

  /**
   * Save PDF.
   */
  const pdfBytes = await pdfDoc.save();

  triggerDownload(
    pdfBytes,
    filename,
  );
}

/**
 * ============================================================
 * PORTFOLIO PDF EXPORT
 * ============================================================
 *
 * Exports a long HTML element into multiple A4 pages.
 */
export async function exportHtmlToPdf(
  el: HTMLElement,
  filename: string,
) {
  if (!el) {
    throw new Error("Nothing to export");
  }

  const canvas = await captureCanvas(el);

  const pdfDoc = await PDFDocument.create();

  const imgHeightPt =
    (canvas.height * A4_WIDTH_PT) /
    canvas.width;

  /**
   * If everything fits on one A4 page.
   */
  if (imgHeightPt <= A4_HEIGHT_PT) {
    await addImagePage(
      pdfDoc,
      canvas,
      A4_WIDTH_PT,
      imgHeightPt,
    );

    const pdfBytes = await pdfDoc.save();

    triggerDownload(
      pdfBytes,
      filename,
    );

    return;
  }

  /**
   * Calculate how many pixels correspond
   * to one A4 page.
   */
  const pxPerPage =
    (A4_HEIGHT_PT * canvas.width) /
    A4_WIDTH_PT;

  let renderedPx = 0;

  while (renderedPx < canvas.height) {
    const sliceHeightPx = Math.min(
      pxPerPage,
      canvas.height - renderedPx,
    );

    const sliceCanvas =
      document.createElement("canvas");

    sliceCanvas.width = canvas.width;

    sliceCanvas.height =
      Math.ceil(sliceHeightPx);

    const ctx =
      sliceCanvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Unable to create PDF canvas context.",
      );
    }

    /**
     * Draw the appropriate section
     * of the original canvas.
     */
    ctx.drawImage(
      canvas,

      0,
      renderedPx,
      canvas.width,
      sliceHeightPx,

      0,
      0,
      canvas.width,
      sliceHeightPx,
    );

    const sliceHeightPt =
      (sliceHeightPx * A4_WIDTH_PT) /
      canvas.width;

    await addImagePage(
      pdfDoc,
      sliceCanvas,
      A4_WIDTH_PT,
      sliceHeightPt,
    );

    renderedPx += sliceHeightPx;
  }

  const pdfBytes = await pdfDoc.save();

  triggerDownload(
    pdfBytes,
    filename,
  );
}
