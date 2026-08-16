"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star } from "lucide-react";

import Img1 from "@/images/hero/1_designer.png";
import Img2 from "@/images/hero/2_founder.png";
import Img3 from "@/images/hero/3_influncer.png";
import Img4 from "@/images/hero/4_singer.png";
import Img5 from "@/images/hero/5_gym.png";
import Img6 from "@/images/hero/6_student.png";
import Img7 from "@/images/hero/7_dev.png";
import Img8 from "@/images/hero/8_freelancer.png";
import Img9 from "@/images/hero/9_standup.png";
import Img10 from "@/images/hero/10_tattoo.png";
import Img11 from "@/images/hero/11_makeover.png";

import ClaimBar from "./ClaimBar";
import { heroAvatars } from "@/lib/site";

const IMAGES = [
  { id: "img1", src: Img2.src },
  { id: "img2", src: Img3.src },
  { id: "img3", src: Img1.src },
  { id: "img4", src: Img4.src },
  { id: "img5", src: Img5.src },
  { id: "img6", src: Img9.src },
  { id: "img7", src: Img11.src },
  { id: "img8", src: Img10.src },
  { id: "img9", src: Img6.src },
  { id: "img10", src: Img7.src },
  { id: "img11", src: Img8.src },
];

// An arc of slots, symmetric around a center slot at angle 0. The outer
// slots on each side are fully transparent "parking" positions. Cards fade
// out into them before they wrap around, so the wrap itself always happens
// while invisible — never a visible jump across the row. Only the cards at
// the very start and end of the screen carry a "blurSide": just the outer
// half of that card (the half facing off-screen) is blurred, fading into a
// sharp inner half.
//
// Positions are placed by angle around a circle (not hand-picked pixel
// values), so every card sits evenly spaced on the same circular arc and
// is rotated to match its tangent — a true circular carousel.
const ANGLE_STEP_DEG = 12;
const CENTER_Y = -10; // px — vertical offset of the center card
const RADIUS_Y_RATIO = 2.1; // vertical radius as a multiple of card size, so the
// curvature of the arc stays the same at every card size

const PARK_OFFSET = 5; // outermost slot overall — invisible, this is where cards wrap
const SLOT_COUNT = PARK_OFFSET * 2 + 1; // must stay equal to IMAGES.length
const CENTER_SLOT = (SLOT_COUNT - 1) / 2;

// The outermost drawn card is centered on the screen edge, so it straddles it
// and its blurred outer half bleeds off — the arc spans the full viewport.
const EDGE_RATIO = 0.5;

// Both the arc radius and the card size are driven by the viewport width, which
// is what lets the carousel be full-bleed *and* keep a gap between neighbouring
// cards. Those two goals fight each other: the arc has to reach the screen edge
// by `visibleDepth` steps, so the wider the arc is drawn the more cards have to
// fit inside it. A fixed card size cannot satisfy both (9 cards of 240px with a
// 20px gap would need a ~1860px viewport), so narrower screens draw a shallower
// arc with fewer cards, and `cardRatio` is set per tier to stay comfortably
// below that tier's neighbour spacing.
// The binding constraint is the *outer* pair, not the center one: x = R·sin(nθ)
// compresses as the angle grows, so the depth 3→4 spacing is the narrowest on
// the arc and it sets the card size for the whole tier.
// `cardRatio` is set just under the ratio at which that tier's tightest pair
// would touch (0.116 / 0.164 / 0.238 / 0.465), which is what trades gap width
// for card size — pushing a ratio past its limit makes the cards overlap again.
const TIERS = [
  { minWidth: 1280, visibleDepth: 4, cardRatio: 0.11, maxCard: 340 },
  { minWidth: 1024, visibleDepth: 3, cardRatio: 0.156, maxCard: 290 },
  { minWidth: 640, visibleDepth: 2, cardRatio: 0.225, maxCard: 270 },
  { minWidth: 0, visibleDepth: 1, cardRatio: 0.42, maxCard: 250 },
];

const DEFAULT_WIDTH = 1280; // used for SSR and the first client render

function buildLayout(viewportWidth: number) {
  const tier = TIERS.find((t) => viewportWidth >= t.minWidth) ?? TIERS[TIERS.length - 1];
  const { visibleDepth } = tier;

  const cardSize = Math.round(Math.min(viewportWidth * tier.cardRatio, tier.maxCard));
  const radiusY = cardSize * RADIUS_Y_RATIO;
  const radiusX =
    (EDGE_RATIO * viewportWidth) /
    Math.sin((visibleDepth * ANGLE_STEP_DEG * Math.PI) / 180);

  const positions = Array.from({ length: SLOT_COUNT }, (_, i) => {
    const offset = i - CENTER_SLOT;
    const depth = Math.abs(offset);
    const angleDeg = offset * ANGLE_STEP_DEG;
    const angleRad = (angleDeg * Math.PI) / 180;
    // Anything past the visible depth sits in a parking slot: still animating
    // along the arc, but fully transparent, so the wrap happens unseen.
    const drawn = depth <= visibleDepth;

    return {
      rotate: angleDeg,
      x: Math.round(radiusX * Math.sin(angleRad)),
      y: Math.round(CENTER_Y + radiusY * (1 - Math.cos(angleRad))),
      scale: depth === 0 ? 1.15 : 1 - (depth - 1) * 0.04,
      opacity: drawn ? 1 : 0,
      // Strictly decreasing with depth so a nearer card always paints over a
      // farther one, rather than stacking by DOM order (which is fixed per
      // image while the slots rotate, and would flicker). Stays under the
      // z-10 the headline block sits on.
      zIndex: drawn ? visibleDepth + 2 - depth : 0,
      blurSide: depth === visibleDepth ? (offset < 0 ? "left" : "right") : "none",
      isCenter: depth === 0,
    };
  });

  // Cards are centered in the track and then translated by `y`, so the track
  // has to be twice the furthest card's reach to keep the arc from spilling
  // into the headline below.
  const outerDepth = Math.min(visibleDepth, PARK_OFFSET);
  const outer = positions[CENTER_SLOT + outerDepth];
  const trackHeight = Math.round(
    Math.max(
      2 * (outer.y + (cardSize * outer.scale) / 2),
      cardSize * 1.15 - 2 * CENTER_Y,
    ),
  );

  return { cardSize, trackHeight, positions };
}

function useViewportWidth() {
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return width;
}

const ROTATE_INTERVAL = 3500;
const N = IMAGES.length;

export default function Hero() {
  const [rotation, setRotation] = useState(0);
  const viewportWidth = useViewportWidth();
  const { cardSize, trackHeight, positions } = useMemo(
    () => buildLayout(viewportWidth),
    [viewportWidth],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => r + 1);
    }, ROTATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-x-clip bg-paper-soft pt-20 sm:pt-4 pb-20 min-h-screen flex flex-col items-center justify-center">
      {/* Background ambient light */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-[26rem] w-[15rem] rounded-full bg-primary/25 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-[26rem] w-[15rem] rounded-full bg-secondary/20 blur-[110px]"
      />

      <div className="relative mx-auto w-full px-4 flex flex-col items-center">
        {/* Arc Carousel Area */}
        <div
          className="relative flex justify-center items-center mb-0 md:mb-2 w-screen"
          style={{ height: trackHeight }}
        >
          {IMAGES.map((img, originalIndex) => {
            // Every tick, each card glides one slot to the left along the
            // arc. The outer slots are fully transparent, so the card that
            // wraps from the first slot back to the last one always does it
            // while already invisible — the motion stays one continuous,
            // evenly-timed glide with no visible cut.
            const slot = ((originalIndex - rotation) % N + N) % N;
            const pos = positions[slot];

            return (
              <motion.div
                key={img.id}
                initial={{
                  opacity: 0,
                  y: pos.y + 40,
                  x: pos.x,
                  rotate: pos.rotate,
                  scale: pos.scale,
                }}
                animate={{
                  opacity: pos.opacity,
                  y: pos.y,
                  x: pos.x,
                  rotate: pos.rotate,
                  scale: pos.scale,
                }}
                transition={{ duration: 1.1, ease: [0.45, 0, 0.2, 1] }}
                className="absolute block"
                style={{
                  width: cardSize,
                  height: cardSize,
                  zIndex: pos.zIndex,
                  perspective: 800,
                }}
              >
                  <motion.div
                    whileHover={{ rotateY: 180 }}
                    transition={{ duration: 0.6, ease: [0.45, 0, 0.2, 1] }}
                    style={{
                      transformStyle: "preserve-3d",
                      // Scales with the card so the corners keep the same
                      // proportion now that the card size follows the viewport.
                      borderRadius: Math.round(cardSize * 0.17),
                    }}
                    className="relative w-full h-full overflow-hidden shadow-soft-lg bg-white border border-line"
                  >
                    <img
                      src={img.src}
                      alt={`Hero ${img.id}`}
                      className="h-full w-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                    />
                    {pos.blurSide !== "none" && (
                      <img
                        src={img.src}
                        aria-hidden
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                        style={{
                          filter: "blur(10px)",
                          WebkitMaskImage:
                            pos.blurSide === "left"
                              ? "linear-gradient(to right, black 0%, black 30%, transparent 75%)"
                              : "linear-gradient(to left, black 0%, black 30%, transparent 75%)",
                          maskImage:
                            pos.blurSide === "left"
                              ? "linear-gradient(to right, black 0%, black 30%, transparent 75%)"
                              : "linear-gradient(to left, black 0%, black 30%, transparent 75%)",
                        }}
                      />
                    )}
                  </motion.div>

                </motion.div>
            );
          })}
        </div>

        {/* Text Area */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-5xl mx-auto px-5 text-center flex flex-col items-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-dark backdrop-blur sm:px-4 sm:py-1.5">
            
            Your identity, one tap away
          </span>

          <h1 className="mx-auto mt-2  text-[1.5rem] font-extrabold leading-[1.1] text-dark sm:mt-3 sm:text-3xl sm:leading-[1.05] lg:text-6xl">
            The Future Doesn&apos;t Exchange Cards.
            <br />
            It Shares{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Identities.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-base font-medium leading-relaxed text-subtle sm:mt-6 sm:text-lg">
            Create yours in minutes.
          </p>

          <div className="mt-7 flex w-full justify-center sm:mt-9">
            <ClaimBar variant="light" />
          </div>

          {/* <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {heroAvatars.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-9 w-9 rounded-full border-[3px] border-[#0A0A0A] object-cover"
                />
              ))}
            </div>
            <p className="text-sm font-semibold text-white/60">
              <span className="inline-flex items-center gap-0.5 align-middle text-white">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                4.9
              </span>{" "}
              from 50,000+ people
            </p>
          </div> */}
        </motion.div>
      </div>
    </section>
  );
}
