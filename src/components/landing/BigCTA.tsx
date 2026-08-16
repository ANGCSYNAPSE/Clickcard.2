"use client";
import { motion } from "framer-motion";
import ClaimBar from "./ClaimBar";

export default function BigCTA() {
  return (
    <section data-nav-theme="dark" className="relative overflow-hidden bg-dark px-4 py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-[26rem] w-[26rem] rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-0 h-[22rem] w-[22rem] rounded-full bg-secondary/15 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
        className="relative mx-auto flex max-w-6xl flex-col items-center text-center"
      >
        <h2 className="text-3xl font-extrabold leading-relaxed tracking-tight text-white sm:text-5xl sm:leading-[1.25] lg:text-6xl">
          Your name is probably still{" "}
          <span className="inline-block rounded-card bg-primary px-3.5 py-1 text-white align-baseline sm:px-4 sm:py-1.5">
            free
          </span>
        </h2>
        <p className="mt-6 max-w-md text-lg font-medium text-white/70">
          Claim your handle before someone else does. Two minutes from now,
          you&apos;ll have a link worth sharing.
        </p>
        <div className="mt-9 flex w-full justify-center">
          <ClaimBar variant="dark" />
        </div>
      </motion.div>
    </section>
  );
}
