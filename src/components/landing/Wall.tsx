"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { testimonials } from "@/lib/site";

const FRAME_BG = ["bg-primary", "bg-secondary", "bg-yellow", "bg-paper-tint"];
const AUTO_INTERVAL = 4000;

export default function Wall() {
  const [[index, dir], setIndex] = useState<[number, number]>([0, 1]);
  const t = testimonials[index % testimonials.length];

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(([i]) => [(i + 1) % testimonials.length, 1]);
    }, AUTO_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const go = (step: number) =>
    setIndex(([i]) => [
      (i + step + testimonials.length) % testimonials.length,
      step,
    ]);

  return (
    <section id="love" className="overflow-hidden bg-paper px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-block rounded-full bg-paper-tint px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-dark">
          Wall of love
        </span>

        <div className="relative mt-10 min-h-[28rem] sm:min-h-[24rem]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.figure
              key={index}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`mx-auto grid h-40 w-52 place-items-center rounded-[28px] sm:h-44 sm:w-60 ${
                  FRAME_BG[index % FRAME_BG.length]
                }`}
              >
                <img
                  src={t.avatar.replace("/80?", "/160?")}
                  alt={t.name}
                  className="h-38 w-38 rounded-full border-4 border-white object-cover"
                />
              </div>

              <blockquote className="mx-auto mt-10 max-w-2xl text-4xl font-extrabold leading-snug tracking-tight text-dark sm:text-3xl">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-8">
                <p className="text-base font-bold text-dark">{t.name}</p>
                <p className="text-sm font-semibold text-muted">{t.role}</p>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="grid h-12 w-12 place-items-center rounded-full border border-line bg-white text-dark transition hover:bg-paper-tint"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="grid h-12 w-12 place-items-center rounded-full bg-dark text-white transition hover:bg-dark-hover"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
