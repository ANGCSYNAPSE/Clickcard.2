"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star } from "lucide-react";
import Img1 from "../../images/img1.png";
import Img2 from "../../images/img2.png";
import Img3 from "../../images/img3.png";
import Img4 from "../../images/img4.png";
import ClaimBar from "./ClaimBar";
import { heroAvatars } from "@/lib/site";

const IMAGES = [
  { id: "img1", src: Img2.src },
  { id: "img2", src: Img3.src },
  { id: "img3", src: Img1.src },
  { id: "img4", src: Img4.src },
  { id: "img5", src: Img2.src },
  { id: "img6", src: Img3.src },
  { id: "img7", src: Img1.src },
  { id: "img8", src: Img4.src },
  { id: "img9", src: Img2.src },
];

// A 9-slot arc: the outermost slot on each side is a fully transparent
// "parking" position. Cards fade out into it before they wrap around,
// so the wrap itself always happens while invisible — never a visible
// jump across the row. The two slots just inside the edges carry a
// half blur, so cards visibly blur in/out as they enter and exit
// rather than snapping straight to full focus.
const POSITIONS = [
  { id: "pos0", rotate: -45, x: "-430%", y: 210, scale: 0.8, zIndex: 0, hideMobile: true, opacity: 0, blur: 10 },
  { id: "pos1", rotate: -35, x: "-330%", y: 160, scale: 0.9, zIndex: 0, hideMobile: true, opacity: 1, blur: 5 },
  { id: "pos2", rotate: -25, x: "-220%", y: 100, scale: 1, zIndex: 1, hideMobile: true, opacity: 1, blur: 0 },
  { id: "pos3", rotate: -12, x: "-110%", y: 30, scale: 1, zIndex: 2, opacity: 1, blur: 0 },
  { id: "pos4", rotate: 0, x: "0%", y: -10, scale: 1.15, zIndex: 3, isCenter: true, opacity: 1, blur: 0 },
  { id: "pos5", rotate: 12, x: "110%", y: 30, scale: 1, zIndex: 2, opacity: 1, blur: 0 },
  { id: "pos6", rotate: 25, x: "220%", y: 100, scale: 1, zIndex: 1, hideMobile: true, opacity: 1, blur: 0 },
  { id: "pos7", rotate: 35, x: "330%", y: 160, scale: 0.9, zIndex: 0, hideMobile: true, opacity: 1, blur: 5 },
  { id: "pos8", rotate: 45, x: "430%", y: 210, scale: 0.8, zIndex: 0, hideMobile: true, opacity: 0, blur: 10 },
];

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
                  filter: `blur(${pos.blur}px)`,
                }}
                animate={{
                  opacity: pos.opacity,
                  y: pos.y,
                  x: pos.x,
                  rotate: pos.rotate,
                  scale: pos.scale,
                  filter: `blur(${pos.blur}px)`,
                }}
                transition={{ duration: 1.1, ease: [0.45, 0, 0.2, 1] }}
                className={`absolute w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 ${pos.hideMobile ? "hidden md:block" : "block"}`}
                style={{ zIndex: pos.zIndex }}
              >
                  <div className="w-full h-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-soft-lg bg-white border border-line">
                    <img
                      src={img.src}
                      alt={`Hero ${img.id}`}
                      className="h-full w-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>

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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-4 py-1.5 text-xs font-semibold text-dark backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
            Your identity, one tap away
          </span>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-[1.05] text-dark sm:text-6xl lg:text-5xl">
            The Future Doesn&apos;t Exchange Cards.
            <br />
            It Shares{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Identities.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-md text-lg font-medium leading-relaxed text-subtle">
            Create yours in minutes.
          </p>

          <div className="mt-9 flex justify-center px-4">
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
