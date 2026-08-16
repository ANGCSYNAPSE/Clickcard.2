"use client";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { stats, WEBAPP_URL } from "@/lib/site";
import TemplateCarousel from "./TemplateCarousel";
import ShareCardStack from "./ShareCardStack";

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55 },
};

const eyebrow =
  "inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]";

const TAP_DATA = [
  { day: "Mon", pct: 30, taps: 90 },
  { day: "Tue", pct: 48, taps: 145 },
  { day: "Wed", pct: 38, taps: 115 },
  { day: "Thu", pct: 62, taps: 185 },
  { day: "Fri", pct: 55, taps: 165 },
  { day: "Sat", pct: 78, taps: 235 },
  { day: "Sun", pct: 100, taps: 300 },
];

export default function ShowcaseBlocks() {
  return (
    <div id="showcase">
      {/* ── 01 · CREATE ── */}
      <section className="relative bg-paper-soft px-4 py-24 lg:h-[590px]">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <motion.div {...reveal}>
            <span className={`${eyebrow} bg-yellow text-dark`}>
              01 · Create
            </span>
            <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-dark sm:text-5xl">
              Look like you hired a designer.
            </h2>
            <p className="mt-5 max-w-md text-lg font-medium leading-relaxed text-subtle">
              Pick a template in the Studio and generate a branded card, resume
              or poster in minutes. Every design stays in sync with your profile
              — change once, updated everywhere.
            </p>
            <a
              href={WEBAPP_URL}
              className="btn btn-primary group mt-8 px-7 py-3.5 text-sm"
            >
              Open the Studio
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
          </motion.div>

          <div className="mx-auto mt-10 w-full max-w-xl overflow-hidden lg:absolute lg:right-40 lg:top-0 lg:mt-0">
            <TemplateCarousel />
          </div>
        </div>
      </section>

      {/* ── 02 · SHARE ── */}
      <section data-nav-theme="dark" className="bg-dark px-4 py-24 text-white lg:h-[590px]">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <motion.div
            {...reveal}
            className="relative order-2 mx-auto w-fit pb-4 pl-6 pt-4 lg:order-1"
          >
            <ShareCardStack />
          </motion.div>

          <motion.div {...reveal} className="order-1 lg:order-2">
            <span className={`${eyebrow} bg-yellow text-dark`}>
              02 · Share
            </span>
            <h2 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Share it anywhere people look.
            </h2>
            <p className="mt-5 max-w-md text-lg font-medium leading-relaxed text-white/70">
              Drop the link in a bio, tap an NFC card, print the QR on a menu or
              flyer, or add it to your email signature. The other person needs
              nothing — no app, no account.
            </p>
            <a
              href={WEBAPP_URL}
              className="btn btn-accent group mt-8 px-7 py-3.5 text-sm"
            >
              Get your QR
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── 03 · GROW ── */}
      <section className="bg-paper px-4 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <motion.div {...reveal}>
            <span className={`${eyebrow} bg-yellow text-dark`}>
              03 · Grow
            </span>
            <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-dark sm:text-5xl">
              Know exactly what&apos;s working.
            </h2>
            <p className="mt-5 max-w-md text-lg font-medium leading-relaxed text-subtle">
              Every view, tap and scan is tracked live. See which links your
              audience loves, where they found you, and double down on what
              converts.
            </p>
            <a
              href={WEBAPP_URL}
              className="group mt-8 inline-flex items-center gap-2 text-sm font-bold text-dark underline-offset-4 hover:underline"
            >
              Explore analytics
              <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </motion.div>

          <motion.div {...reveal}>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                  Link taps · last 7 days
                </p>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-extrabold text-white">
                  +32%
                </span>
              </div>
              <div className="mt-6 flex h-40 items-end gap-2.5">
                {TAP_DATA.map((d, i) => (
                  <div
                    key={i}
                    style={{ height: `${d.pct}%` }}
                    className={`group relative flex-1 origin-bottom cursor-pointer rounded-t-lg transition-transform duration-200 hover:scale-y-105 ${
                      i === 6 ? "bg-dark" : "bg-secondary"
                    }`}
                  >
                    <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-dark px-2.5 py-1.5 text-center opacity-0 shadow-soft transition-opacity duration-200 group-hover:opacity-100">
                      <span className="block text-xs font-extrabold text-white">
                        {d.taps}
                      </span>
                      <span className="block text-[9px] font-semibold text-white/60">
                        {d.day}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="card p-4 text-center">
                  <p className="text-2xl font-extrabold text-dark">{s.value}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-muted">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
