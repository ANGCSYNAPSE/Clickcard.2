"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { featuresBySegment, segments } from "@/lib/site";

type SegmentKey = keyof typeof featuresBySegment;

export default function Audiences() {
  const [active, setActive] = useState<SegmentKey>("Students");

  return (
    <section className="bg-paper-soft px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-subtle">
            Who it&apos;s for
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-dark sm:text-5xl">
            Made for whoever you are.
          </h2>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {segments.map((s) => {
            const key = s.label as SegmentKey;
            const isActive = active === key;
            return (
              <button
                key={s.label}
                onClick={() => setActive(key)}
                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? "border-dark bg-dark text-white"
                    : "border-line bg-white text-subtle hover:border-line-strong hover:text-dark"
                }`}
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featuresBySegment[active].map((f) => (
              <div key={f.title} className="card card-hover p-6">
                <span className="grid h-11 w-11 place-items-center rounded-card bg-primary">
                  <f.icon className="h-5 w-5 text-dark" />
                </span>
                <h3 className="mt-4 text-base font-extrabold text-dark">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-subtle">
                  {f.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
