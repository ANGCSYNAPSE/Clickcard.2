/**
 * Types, defaults and safety validation for the advanced QR customizer.
 * Kept separate from the rendering component so the same rules apply
 * wherever a QR design is built, saved, or exported.
 */

export type QrDotType = "square" | "dots" | "rounded" | "extra-rounded" | "classy" | "classy-rounded";
export type QrCornerSquareType = "square" | "dot" | "extra-rounded";
export type QrCornerDotType = "square" | "dot";

export interface QrGradient {
  enabled: boolean;
  type: "linear" | "radial";
  /** Degrees, linear only. */
  angle: number;
  start: string;
  end: string;
}

export interface QrDesignSettings {
  patternStyle: QrDotType;
  fgColor: string;
  bgColor: string;
  gradient: QrGradient;
  /** When false, corner squares/dots use `fgColor`/gradient instead of their own color. */
  useCustomCornerColor: boolean;
  cornerSquareType: QrCornerSquareType;
  cornerSquareColor: string;
  cornerDotType: QrCornerDotType;
  cornerDotColor: string;
  logoUrl?: string;
  /** Fraction of the QR's width the logo may occupy — capped well below 1 so data isn't obscured. */
  logoSize: number;
  logoMargin: number;
  hideBackgroundDots: boolean;
}

export const DOT_TYPES: { value: QrDotType; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "dots", label: "Dots" },
  { value: "extra-rounded", label: "Extra rounded" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy rounded" },
];

export const CORNER_SQUARE_TYPES: { value: QrCornerSquareType; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "extra-rounded", label: "Extra rounded" },
  { value: "dot", label: "Circle" },
];

export const CORNER_DOT_TYPES: { value: QrCornerDotType; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
];

export const COLOR_PRESETS = [
  { name: "Black", fg: "#0B2E2B", bg: "#FFFFFF" },
  { name: "Deep navy", fg: "#0F172A", bg: "#FFFFFF" },
  { name: "Indigo", fg: "#3730A3", bg: "#FFFFFF" },
  { name: "Purple", fg: "#6B21A8", bg: "#FFFFFF" },
  { name: "Emerald", fg: "#065F46", bg: "#FFFFFF" },
  { name: "Orange", fg: "#BE5103", bg: "#FFFFFF" },
  { name: "White on dark", fg: "#FFFFFF", bg: "#0B2E2B" },
];

export const GRADIENT_PRESETS: { name: string; start: string; end: string }[] = [
  { name: "Indigo → Purple", start: "#4338CA", end: "#7E22CE" },
  { name: "Blue → Cyan", start: "#1D4ED8", end: "#06B6D4" },
  { name: "Orange → Pink", start: "#BE5103", end: "#DB2777" },
  { name: "Emerald → Teal", start: "#047857", end: "#0D9488" },
  { name: "Black → Dark gray", start: "#000000", end: "#404040" },
];

export const DEFAULT_QR_SETTINGS: QrDesignSettings = {
  patternStyle: "rounded",
  fgColor: "#0B2E2B",
  bgColor: "#FFFFFF",
  gradient: { enabled: false, type: "linear", angle: 45, start: "#4338CA", end: "#7E22CE" },
  useCustomCornerColor: false,
  cornerSquareType: "extra-rounded",
  cornerSquareColor: "#0B2E2B",
  cornerDotType: "dot",
  cornerDotColor: "#0B2E2B",
  logoUrl: undefined,
  logoSize: 0.22,
  logoMargin: 8,
  hideBackgroundDots: true,
};

/** Hard ceiling — past this, a logo starts eating into error-correctable data. */
export const MAX_LOGO_SIZE = 0.32;
export const MIN_LOGO_SIZE = 0.1;

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/** Relative luminance (WCAG formula), used only for a relative contrast check — not a scan guarantee. */
function luminance([r, g, b]: [number, number, number]) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function isValidHex(hex: string): boolean {
  return hexToRgb(hex) !== null;
}

/** Contrast ratio between two hex colors, 1 (identical) to 21 (black/white). */
export function contrastRatio(hexA: string, hexB: string): number | null {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return null;
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export interface QrWarning {
  level: "info" | "warning";
  message: string;
}

/**
 * Software-only checks — a green result means "no known red flag", not a
 * guarantee a scanner will read it. Never silently strips a bad setting;
 * callers decide whether to block or just warn.
 */
export function validateQrSettings(settings: QrDesignSettings): QrWarning[] {
  const warnings: QrWarning[] = [];

  const fg = settings.gradient.enabled ? settings.gradient.start : settings.fgColor;
  const ratio = contrastRatio(fg, settings.bgColor);
  if (ratio !== null && ratio < 2.5) {
    warnings.push({
      level: "warning",
      message: "Low contrast between the QR color and background — try a lighter background or darker QR color.",
    });
  }
  if (settings.gradient.enabled) {
    const endRatio = contrastRatio(settings.gradient.end, settings.bgColor);
    if (endRatio !== null && endRatio < 2.2) {
      warnings.push({
        level: "warning",
        message: "One end of the gradient is close to the background color — this may affect scan reliability.",
      });
    }
  }
  if (settings.logoUrl && settings.logoSize > 0.28) {
    warnings.push({ level: "warning", message: "Your logo may be too large — try shrinking it below 28%." });
  }
  if (warnings.length === 0) {
    warnings.push({ level: "info", message: "Your QR code is ready to scan." });
  }
  return warnings;
}

export const MAX_LOGO_UPLOAD_BYTES = 4 * 1024 * 1024; // 4MB — source file, before compression
export const LOGO_ACCEPT = "image/png,image/jpeg,image/webp";

/**
 * Downscales an uploaded logo to a small square PNG data URL client-side.
 * There's no generic "upload arbitrary image, get a hosted URL" endpoint in
 * this app yet (the existing upload routes each overwrite a specific field
 * — profile picture, business logo — so reusing one here would silently
 * change unrelated data). Compressing in the browser keeps the embedded
 * data URL small enough to store inline with the rest of the QR design
 * instead of standing up a new upload pipeline for one icon.
 */
export function compressLogoToDataUrl(file: File, maxDimension = 240): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file (PNG, JPG or WebP)."));
      return;
    }
    if (file.size > MAX_LOGO_UPLOAD_BYTES) {
      reject(new Error("That image is too large — please choose one under 4MB."));
      return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not process that image."));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read that image."));
    };
    img.src = objectUrl;
  });
}
