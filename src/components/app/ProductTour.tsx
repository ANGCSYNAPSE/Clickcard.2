import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch } from "@/store/hooks";
import { setSidebar } from "@/store/slices/uiSlice";

export interface TourStep {
  /** Matches a `data-tour="<target>"` attribute — omit for a centered, un-spotlit step (welcome/closing). */
  target?: string;
  title: string;
  body: string;
}

const PAD = 8; // spotlight breathing room around the target's real box
const ACCENT = "#7C3AED"; // violet — the tour's own accent, distinct from the app's brand-orange
const ARROW_COLOR = "#B79CF2"; // pale violet — the hand-drawn-style connector line

function useTargetRect(target: string | undefined, step: number) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!target) {
      setRect(null);
      return;
    }
    let raf = 0;
    let scrolled = false;
    const measure = () => {
      // A step's target can resolve to more than one element — e.g. a
      // desktop-only panel and its mobile-only equivalent (a "Preview"
      // button) sharing the same `data-tour` id, only one of which is ever
      // actually on screen at a given breakpoint. Pick whichever one is
      // actually visible rather than always the first DOM match, or a
      // `display:none` twin would make the step wrongly fall back to a
      // centered card instead of finding its visible sibling.
      const candidates = document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`);
      const el = Array.from(candidates).find((c) => c.offsetParent !== null) ?? null;
      if (el) {
        if (!scrolled) {
          el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          scrolled = true;
        }
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };
    // A mobile nav target can still be mid-slide out of its off-canvas
    // drawer (its own CSS transition, separate from this tour), and the
    // smooth scrollIntoView above can easily outlast a short measurement
    // window on a real, tall page (unlike a short test page, a real
    // dashboard scroll can take the better part of a second) — keep
    // re-measuring for a while rather than trusting an early snapshot, so
    // the spotlight/arrow don't lock onto a stale, still-settling position.
    const start = performance.now();
    const DURATION = 900;
    const tick = (now: number) => {
      measure();
      if (now - start < DURATION) raf = window.requestAnimationFrame(tick);
    };
    const t = setTimeout(() => {
      raf = window.requestAnimationFrame(tick);
    }, 150);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    // Belt-and-suspenders: once the browser confirms the smooth scroll has
    // actually finished, take one more authoritative measurement — covers
    // the rare case where scrolling runs past the polling window above.
    document.addEventListener("scrollend", measure, true);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      document.removeEventListener("scrollend", measure, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, step]);

  return rect;
}

type Side = "bottom" | "top" | "left" | "right";

/**
 * A minimal, dependency-free spotlight tour: dims the page, cuts a
 * highlighted hole (dim + a glowing ring) around the current step's
 * `data-tour` target, and shows a small card — connected to the target by a
 * curved arrow — carrying Back/Next/Skip. No target = a centered
 * intro/closing card with no spotlight.
 */
export default function ProductTour({
  steps,
  onFinish,
}: {
  steps: TourStep[];
  onFinish: () => void;
}) {
  const dispatch = useAppDispatch();
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const rect = useTargetRect(step?.target, index);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    // Sidebar nav items live in an off-canvas drawer on mobile — only open
    // it for steps that actually target something inside it. AppShell's own
    // drawer backdrop (a full-screen dim+blur, separate from the tour's own
    // spotlight overlay) stacks on top of everything else while open, so
    // leaving it open for the whole tour washed out every non-nav target
    // (hero button, live preview, etc.) on mobile.
    const needsSidebar = step?.target?.startsWith("nav-") || step?.target === "view-public-page";
    dispatch(setSidebar(!!needsSidebar));
    return () => {
      dispatch(setSidebar(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step?.target]);

  const spotlightStyle = useMemo(() => {
    // Layered box-shadow: a thick glowing accent ring right at the hole's
    // edge, then the dim covering the rest of the page — one element, no
    // extra overlay panels.
    const shadow = `0 0 0 4px ${ACCENT}, 0 0 0 8px ${ACCENT}55, 0 0 32px 6px ${ACCENT}99, 0 0 0 9999px rgba(11,14,13,0.72)`;
    if (!rect) {
      // No spotlight hole to keep sharp (welcome/closing) — blur the whole
      // background behind the dim, not just darken it.
      return {
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        boxShadow: "0 0 0 9999px rgba(11,14,13,0.72)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      };
    }
    return {
      top: rect.top - PAD,
      left: rect.left - PAD,
      width: rect.width + PAD * 2,
      height: rect.height + PAD * 2,
      boxShadow: shadow,
    };
  }, [rect]);

  // Keep the card on-screen by picking whichever side of the target
  // actually has room — below/above for a normal-sized element, but
  // beside it (left/right) for something tall and narrow (like a side
  // panel), where squeezing the card below or above it would run it off
  // the bottom of the viewport instead.
  const placement = useMemo(() => {
    const cardWidth = 320;
    const cardHeight = 260; // rough estimate — only used to pick a side, not to render
    const gap = 28;
    if (typeof window === "undefined" || !rect) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const holeTop = rect.top - PAD;
    const holeLeft = rect.left - PAD;
    const holeRight = rect.left + rect.width + PAD;
    const holeBottom = rect.top + rect.height + PAD;
    const space = {
      bottom: vh - holeBottom,
      top: holeTop,
      right: vw - holeRight,
      left: holeLeft,
    };

    let side: Side = "bottom";
    if (space.bottom >= cardHeight + gap) side = "bottom";
    else if (space.top >= cardHeight + gap) side = "top";
    else if (space.right >= cardWidth + gap) side = "right";
    else if (space.left >= cardWidth + gap) side = "left";
    else side = (Object.entries(space).sort((a, b) => b[1] - a[1])[0][0]) as Side;

    if (side === "right" || side === "left") {
      const top = Math.min(Math.max(rect.top + rect.height / 2, cardHeight / 2 + gap), vh - cardHeight / 2 - gap);
      return {
        side,
        style:
          side === "right"
            ? ({ top, left: holeRight + gap, transform: "translate(0, -50%)" } as const)
            : ({ top, left: holeLeft - gap, transform: "translate(-100%, -50%)" } as const),
      };
    }
    const left = Math.min(Math.max(rect.left + rect.width / 2, cardWidth / 2 + gap), vw - cardWidth / 2 - gap);
    return {
      side,
      style:
        side === "bottom"
          ? ({ top: holeBottom + gap, left, transform: "translate(-50%, 0)" } as const)
          : ({ top: holeTop - gap, left, transform: "translate(-50%, -100%)" } as const),
    };
  }, [rect]);

  const cardStyle = placement?.style ?? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  // Measure the card's actual rendered box (post-transform) so the arrow can
  // anchor to its real edge rather than an estimate. The card glides to its
  // new spot over a 300ms CSS transition, so a single measurement right
  // after render would catch it mid-flight and leave the arrow pointing at
  // a stale position — keep sampling every frame for the transition's
  // duration so the arrow tracks the card all the way to rest.
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) {
      setCardRect(null);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const DURATION = 400;
    const tick = (now: number) => {
      setCardRect(el.getBoundingClientRect());
      if (now - start < DURATION) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, placement, step?.title]);

  // A smooth curved connector from the card's edge to the target's
  // highlighted box, with an arrowhead landing on the target — the
  // hand-drawn-style pointer from the reference design, in place of a plain
  // caret.
  const arrowPath = useMemo(() => {
    if (!rect || !cardRect || !placement) return null;
    const holeTop = rect.top - PAD;
    const holeLeft = rect.left - PAD;
    const holeRight = rect.left + rect.width + PAD;
    const holeBottom = rect.top + rect.height + PAD;
    const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
    const EDGE = 35; // keep anchors off the very corner of a box
    const INSET = 6; // land the tip just inside the ring, not exactly on its edge

    let start: { x: number; y: number };
    let end: { x: number; y: number };

    // Anchor each end at whichever point on its own box is nearest the
    // other box's center — instead of a fixed fraction of the box — so the
    // connector stays short and direct even when the card lands far from
    // its target (e.g. clamped away from a screen edge), rather than
    // stretching into a long diagonal between two arbitrary fixed points.
    switch (placement.side) {
      case "bottom":
      case "top": {
        const targetCenterX = (holeLeft + holeRight) / 2;
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const startX = clamp(targetCenterX, cardRect.left + EDGE, cardRect.right - EDGE);
        const endX = clamp(cardCenterX, holeLeft + EDGE / 2, holeRight - EDGE / 2);
        start = { x: startX, y: placement.side === "bottom" ? cardRect.top : cardRect.bottom };
        // Land the tip a few px *inside* the ring rather than exactly on its
        // outer edge — small enough not to look off, but enough that the
        // arrowhead visibly overlaps the ring instead of appearing to stop
        // just short of it if the target's measured box is off by a pixel
        // or two (e.g. still settling after a scroll).
        end = { x: endX, y: placement.side === "bottom" ? holeBottom - INSET : holeTop + INSET };
        break;
      }
      case "right":
      case "left":
      default: {
        const targetCenterY = (holeTop + holeBottom) / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        const startY = clamp(targetCenterY, cardRect.top + EDGE, cardRect.bottom - EDGE);
        const endY = clamp(cardCenterY, holeTop + EDGE / 2, holeBottom - EDGE / 2);
        start = { x: placement.side === "right" ? cardRect.left : cardRect.right, y: startY };
        end = { x: placement.side === "right" ? holeRight - INSET : holeLeft + INSET, y: endY };
        break;
      }
    }

    // Bow the curve by an amount proportional to its length, clamped to a
    // sane range, so short local connections curve gently and longer ones
    // still read as a smooth arc rather than a near-straight stretched line.
    const dist = Math.hypot(end.x - start.x, end.y - start.y);
    const bow = clamp(dist * 0.18, 24, 90);
    const control =
      placement.side === "bottom" || placement.side === "top"
        ? { x: (start.x + end.x) / 2 + bow, y: (start.y + end.y) / 2 }
        : { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 - bow };

    const dx = end.x - control.x;
    const dy = end.y - control.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return {
      d: `M ${start.x} ${start.y} Q ${control.x} ${control.y}, ${end.x} ${end.y}`,
      end,
      angle,
    };
  }, [rect, cardRect, placement]);

  const isLast = index === steps.length - 1;

  const next = () => {
    if (isLast) onFinish();
    else setIndex((i) => i + 1);
  };
  const back = () => setIndex((i) => Math.max(0, i - 1));

  return (
    <div className="fixed inset-0 z-[100]">
      {/* dim + glowing highlight ring — one element; the "hole" is the element's own box */}
      <div
        className="pointer-events-none absolute rounded-2xl transition-all duration-300"
        style={spotlightStyle}
      />
      {/* click-catcher so background isn't interactive during the tour */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

      <AnimatePresence>
        {arrowPath && (
          <motion.svg
            key={index}
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <path d={arrowPath.d} fill="none" stroke={ARROW_COLOR} strokeWidth={2.5} strokeLinecap="round" />
            <polygon
              points="0,-6 12,0 0,6"
              fill={ARROW_COLOR}
              transform={`translate(${arrowPath.end.x}, ${arrowPath.end.y}) rotate(${arrowPath.angle})`}
            />
          </motion.svg>
        )}
      </AnimatePresence>

      <div
        ref={cardRef}
        className={`absolute max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-soft-lg ring-1 ring-ink/10 transition-all duration-300 ease-out ${
          rect ? "w-80 p-5" : "w-96 p-7"
        }`}
        style={cardStyle}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-ink/40">
                {index + 1} / {steps.length}
              </span>
              <button
                onClick={onFinish}
                className="text-xs font-semibold underline-offset-2 transition hover:underline"
                style={{ color: ACCENT }}
              >
                Skip tour
              </button>
            </div>
            <h3 className={`mt-3 font-display font-black text-ink ${rect ? "text-base" : "text-lg"}`}>{step.title}</h3>
            <p className={`mt-1.5 leading-relaxed text-ink/60 ${rect ? "text-sm" : "text-base"}`}>{step.body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? 16 : 6,
                  background: i === index ? ACCENT : "rgba(124,58,237,0.2)",
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                onClick={back}
                className="rounded-full px-3.5 py-2 text-xs font-bold transition hover:brightness-95"
                style={{ background: "#EDE6FB", color: ACCENT }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={next}
              className="rounded-full px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
              style={{ background: ACCENT }}
            >
              {isLast ? "Finish tour" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
