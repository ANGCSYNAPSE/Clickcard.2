"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star } from "lucide-react";
import Img1 from "../../images/hero1.png";
import Img2 from "../../images/hero2.png";
import Img3 from "../../images/hero3.png";
import Img4 from "../../images/hero4.png";
import Img5 from "../../images/hero5.png";
import ClaimBar from "./ClaimBar";
import { heroAvatars } from "@/lib/site";

const IMAGES = [
  { id: "img1", src: Img2.src },
  { id: "img2", src: Img3.src },
  { id: "img3", src: Img1.src },
  { id: "img4", src: Img4.src },
  { id: "img5", src: Img5.src },
  { id: "img6", src: Img3.src },
  { id: "img7", src: Img1.src },
  { id: "img8", src: Img4.src },
  { id: "img9", src: Img2.src },
];

// A 9-slot arc: the outermost slot on each side is a fully transparent
// "parking" position. Cards fade out into it before they wrap around,
// so the wrap itself always happens while invisible — never a visible
// jump across the row. Only the cards at the very start and end of the
// screen carry a "blurSide": just the outer half of that card (the half
// facing off-screen) is blurred, fading into a sharp inner half.
//
// Positions are placed by angle around a circle (not hand-picked pixel
// values), so every card sits evenly spaced on the same circular arc and
// is rotated to match its tangent — a true circular carousel.
const SLOT_COUNT = 9;
const CENTER_SLOT = (SLOT_COUNT - 1) / 2;
const ANGLE_STEP_DEG = 12;
const RADIUS_X = 600; // % — horizontal circle radius
const RADIUS_Y = 660; // px — vertical circle radius (curvature depth)
const CENTER_Y = -10; // px — vertical offset of the center card

const SLOT_META = [
  { scale: 0.8, zIndex: 0, hideMobile: true, opacity: 0, blurSide: "left" }, // offset -4 (buffer)
  { scale: 0.9, zIndex: 0, hideMobile: true, opacity: 1, blurSide: "left" }, // offset -3
  { scale: 1, zIndex: 1, hideMobile: true, opacity: 1, blurSide: "none" }, // offset -2
  { scale: 1, zIndex: 2, hideMobile: false, opacity: 1, blurSide: "none" }, // offset -1
  { scale: 1.15, zIndex: 3, hideMobile: false, opacity: 1, blurSide: "none", isCenter: true }, // offset 0
  { scale: 1, zIndex: 2, hideMobile: false, opacity: 1, blurSide: "none" }, // offset 1
  { scale: 1, zIndex: 1, hideMobile: true, opacity: 1, blurSide: "none" }, // offset 2
  { scale: 0.9, zIndex: 0, hideMobile: true, opacity: 1, blurSide: "right" }, // offset 3
  { scale: 0.8, zIndex: 0, hideMobile: true, opacity: 0, blurSide: "right" }, // offset 4 (buffer)
];

const POSITIONS = SLOT_META.map((meta, i) => {
  const offset = i - CENTER_SLOT;
  const angleDeg = offset * ANGLE_STEP_DEG;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    id: `pos${i}`,
    rotate: angleDeg,
    x: `${(RADIUS_X * Math.sin(angleRad)).toFixed(1)}%`,
    y: Math.round(CENTER_Y + RADIUS_Y * (1 - Math.cos(angleRad))),
    ...meta,
  };
});

const ROTATE_INTERVAL = 3500;
const N = IMAGES.length;

export default function Hero() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => r + 1);
    }, ROTATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-paper-soft pt-10 pb-20 min-h-screen flex flex-col items-center justify-center">
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
        <div className="relative flex justify-center items-center h-[250px] sm:h-[350px] md:h-[400px] mb-8 md:mb-16 w-screen">
          {IMAGES.map((img, originalIndex) => {
            // Every tick, each card glides one slot to the left along the
            // arc. The two outer slots are fully transparent, so the card
            // that wraps from the first slot back to the last one always
            // does it while already invisible — the motion stays one
            // continuous, evenly-timed glide with no visible cut.
            const slot = ((originalIndex - rotation) % N + N) % N;
            const pos = POSITIONS[slot];

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
                className={`absolute w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 ${pos.hideMobile ? "hidden md:block" : "block"}`}
                style={{ zIndex: pos.zIndex, perspective: 800 }}
              >
                  <motion.div
                    whileHover={{ rotateY: 180 }}
                    transition={{ duration: 0.6, ease: [0.45, 0, 0.2, 1] }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="relative w-full h-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-soft-lg bg-white border border-line"
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

                  {/* Badges for the center image */}
                  {/* <AnimatePresence>
                    {pos.isCenter && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        className="absolute inset-0 pointer-events-none"
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          transition={{ delay: 0.4, type: "spring" }}
                          className="absolute -left-12 sm:-left-20 top-1/3 z-20 flex items-center gap-2 rounded-full sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1.5 sm:p-2 shadow-xl pointer-events-auto"
                        >
                          <img
                            src={Img3.src}
                            alt="Avatar"
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                          />
                          <div className="hidden sm:block pr-2">
                            <p className="text-[10px] sm:text-xs font-bold text-white leading-tight">
                              LoraJason
                            </p>
                            <p className="text-[8px] sm:text-[10px] text-white/70">
                              You are the inspiration
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, x: 20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          className="absolute -right-10 sm:-right-16 top-1/4 z-20 flex items-center gap-2 rounded-full sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1.5 sm:p-2 shadow-xl pointer-events-auto"
                        >
                          <img
                            src={Img4.src}
                            alt="Avatar"
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                          />
                          <div className="hidden sm:block pr-2">
                            <p className="text-[10px] sm:text-xs font-bold text-white leading-tight">
                              JPG
                            </p>
                            <p className="text-[8px] sm:text-[10px] text-white/70">
                              Killing it brother!
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 0.6, type: "spring" }}
                          className="absolute -right-2 sm:-right-4 -bottom-2 sm:-bottom-4 z-20 grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full sm:rounded-2xl bg-gradient-to-tr from-red-500 to-rose-400 shadow-xl border border-white/20 pointer-events-auto"
                        >
                          <Heart className="h-5 w-5 sm:h-6 sm:w-6 fill-white text-white" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence> */}
                </motion.div>
            );
          })}
        </div>

        {/* Text Area */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mx-auto max-w-7xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-3 py-1 text-[11px] font-semibold text-dark backdrop-blur sm:px-4 sm:py-1.5 sm:text-xs">
            <Sparkles className="h-3 w-3 text-secondary sm:h-3.5 sm:w-3.5" />
            Your identity, one tap away
          </span>

          <h1 className="mx-auto mt-4 max-w-4xl text-[2rem] font-extrabold leading-[1.1] text-dark sm:mt-6 sm:text-5xl sm:leading-[1.05] lg:text-6xl">
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

          <div className="mt-7 flex justify-center sm:mt-9">
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
