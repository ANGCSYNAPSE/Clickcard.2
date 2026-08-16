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
        <h2 className=" text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl ">
          Your name is probably still
          <span className=" ml-2 rounded-card bg-primary px-4 py-2 text-white">
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
