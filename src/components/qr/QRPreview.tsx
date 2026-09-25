import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type QRCodeStylingClass from "qr-code-styling";
import type { Options, FileExtension } from "qr-code-styling";
import type { QrDesignSettings } from "@/lib/qrStyling";
import { MAX_LOGO_SIZE, MIN_LOGO_SIZE } from "@/lib/qrStyling";

export interface QRPreviewHandle {
  download: (extension: FileExtension) => Promise<void>;
}

function buildOptions(data: string, settings: QrDesignSettings, size: number): Partial<Options> {
  const gradient = settings.gradient.enabled
    ? {
        type: settings.gradient.type,
        rotation: settings.gradient.type === "linear" ? (settings.gradient.angle * Math.PI) / 180 : undefined,
        colorStops: [
          { offset: 0, color: settings.gradient.start },
          { offset: 1, color: settings.gradient.end },
        ],
      }
    : undefined;

  const cornersSquareOptions: NonNullable<Options["cornersSquareOptions"]> = { type: settings.cornerSquareType };
  const cornersDotOptions: NonNullable<Options["cornersDotOptions"]> = { type: settings.cornerDotType };
  if (settings.useCustomCornerColor) {
    cornersSquareOptions.color = settings.cornerSquareColor;
    cornersDotOptions.color = settings.cornerDotColor;
  } else if (gradient) {
    cornersSquareOptions.gradient = gradient;
    cornersDotOptions.gradient = gradient;
  } else {
    cornersSquareOptions.color = settings.fgColor;
    cornersDotOptions.color = settings.fgColor;
  }

  const logoSize = settings.logoUrl
    ? Math.min(Math.max(settings.logoSize, MIN_LOGO_SIZE), MAX_LOGO_SIZE)
    : undefined;

  return {
    width: size,
    height: size,
    data,
    // The QR's own quiet zone, drawn *inside* the given width/height — a
    // fixed 10px ate a large chunk of a small preview (e.g. 20% of a
    // 100px box), making the pattern look tiny even though the canvas
    // itself filled its container. Scale it with size instead so small
    // previews stay dense while still keeping a real quiet zone.
    margin: Math.max(4, Math.round(size * 0.04)),
    // `image`/`imageOptions` are omitted entirely (not set to `undefined`)
    // when there's no logo — the library shallow-merges options over its
    // own defaults, so an explicit `imageOptions: undefined` key clobbers
    // its default object instead of falling back to it, which crashes
    // inside the constructor when it reads `imageOptions.hideBackgroundDots`.
    ...(settings.logoUrl
      ? {
          image: settings.logoUrl,
          imageOptions: {
            imageSize: logoSize,
            margin: settings.logoMargin,
            hideBackgroundDots: settings.hideBackgroundDots,
            crossOrigin: "anonymous",
          },
        }
      : {}),
    qrOptions: { errorCorrectionLevel: settings.logoUrl ? "H" : "M" },
    dotsOptions: gradient
      ? { type: settings.patternStyle, gradient }
      : { type: settings.patternStyle, color: settings.fgColor },
    cornersSquareOptions,
    cornersDotOptions,
    backgroundOptions: { color: settings.bgColor },
  };
}

/**
 * Renders a real, scannable QR code via qr-code-styling (canvas-based —
 * never a decorative CSS approximation). The library touches `window`, so
 * it's imported dynamically inside an effect rather than at module scope,
 * which would break Next.js's server render.
 *
 * The wrapper div is sized to exactly `size`×`size` px via inline style —
 * qr-code-styling renders its canvas/svg at that same fixed resolution and
 * never shrinks it to fit a smaller CSS container on its own, so a caller
 * placing this in a small box must pass a matching `size` rather than
 * relying on CSS to scale it down (percentage sizing here would also
 * collapse to 0 wherever the parent's own height is auto/undefined).
 */
const QRPreview = forwardRef<
  QRPreviewHandle,
  { data: string; settings: QrDesignSettings; size?: number; fileName?: string; className?: string }
>(({ data, settings, size = 240, fileName = "clickcard-qr", className }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStylingClass | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      if (cancelled || !containerRef.current) return;
      qrRef.current = new QRCodeStyling(buildOptions(data, settings, size));
      containerRef.current.innerHTML = "";
      qrRef.current.append(containerRef.current);
    });
    return () => {
      cancelled = true;
    };
    // Only re-create on mount — subsequent changes go through `update` below,
    // since re-instantiating on every keystroke would flicker/re-append.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    qrRef.current?.update(buildOptions(data, settings, size));
  }, [data, settings, size]);

  useImperativeHandle(ref, () => ({
    download: async (extension) => {
      if (!qrRef.current) return;
      await qrRef.current.download({ name: fileName, extension });
    },
  }));

  return <div ref={containerRef} className={className} style={{ width: size, height: size }} />;
});
QRPreview.displayName = "QRPreview";

export default QRPreview;
