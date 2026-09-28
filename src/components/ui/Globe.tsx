"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/cn";

export interface GlobeProps {
  className?: string;
  /** Brand-matched palette per theme — light and dark need different base/glow colors to read correctly. */
  theme?: "light" | "dark";
  config?: Partial<COBEOptions>;
}

const BRAND_MARKER: [number, number, number] = [190 / 255, 81 / 255, 3 / 255]; // #BE5103

const THEME_CONFIG: Record<"light" | "dark", Partial<COBEOptions>> = {
  light: {
    dark: 0,
    baseColor: [1, 1, 1],
    glowColor: [1, 1, 1],
    markerColor: BRAND_MARKER,
  },
  dark: {
    dark: 1,
    baseColor: [0.28, 0.28, 0.3],
    glowColor: [0.35, 0.2, 0.1],
    markerColor: BRAND_MARKER,
  },
};

const BASE_CONFIG: COBEOptions = {
  width: 600,
  height: 600,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: BRAND_MARKER,
  glowColor: [1, 1, 1],
  markers: [
    { location: [41.0082, 28.9784], size: 0.06 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [-23.5505, -46.6333], size: 0.1 },
  ],
};

export function Globe({ className, theme = "light", config }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);

  const resolvedConfig = useMemo<COBEOptions>(
    () => ({ ...BASE_CONFIG, ...THEME_CONFIG[theme], ...config }),
    [theme, config],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.offsetWidth;
    const globe = createGlobe(canvas, {
      ...resolvedConfig,
      width: width * 2,
      height: width * 2,
    });

    // cobe v2 dropped the old per-frame `onRender` callback in favor of
    // driving rotation yourself via the returned instance's `update()`.
    let raf: number;
    let cancelled = false;
    const spin = () => {
      if (cancelled) return;
      phiRef.current += 0.005;
      globe.update({ phi: phiRef.current });
      raf = requestAnimationFrame(spin);
    };
    raf = requestAnimationFrame(spin);

    const handleResize = () => {
      const w = canvas.offsetWidth;
      globe.update({ width: w * 2, height: w * 2 });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      globe.destroy();
    };
  }, [resolvedConfig]);

  return (
    <div className={cn("relative aspect-square w-full max-w-md", className)}>
      <canvas ref={canvasRef} className="size-full [contain:layout_paint_size]" />
    </div>
  );
}
