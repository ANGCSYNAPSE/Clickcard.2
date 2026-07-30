"use client";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { stats, WEBAPP_URL } from "@/lib/site";
import TemplateCarousel from "./TemplateCarousel";

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55 },
};

const eyebrow =
  "inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]";

export default function ShowcaseBlocks() {
  return (
    <div id="showcase">
      {/* ── 01 · CREATE ── */}
      <section className="relative bg-paper-soft px-4 py-24 h-[590px]">
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

          <div className="absolute right-40 top-0 mx-auto w-full max-w-xl overflow-hidden ">
            <TemplateCarousel />
          </div>
        </div>
      </section>

      {/* ── 02 · SHARE ── */}
      <section className="bg-dark px-4 py-24 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <motion.div
            {...reveal}
            className="relative order-2 mx-auto w-fit lg:order-1"
          >
            <div className="rounded-[28px] bg-white p-8 shadow-soft-lg">
              <QRCodeSVG
                value="https://clickcard.app/you"
                size={180}
                bgColor="#ffffff"
                fgColor="#0B2E2B"
              />
              <p className="mt-4 rounded-full bg-primary px-4 py-1.5 text-center text-sm font-bold text-white">
                clickcard.app/you
              </p>
            </div>
            {[
              { label: "Tap · NFC", cls: "-right-6 -top-4" },
              { label: "In your bio", cls: "-left-8 top-1/3" },
              { label: "On print", cls: "-bottom-4 -right-2" },
            ].map((chip) => (
              <span
                key={chip.label}
                className={`absolute rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur ${chip.cls}`}
              >
                {chip.label}
              </span>
            ))}
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
                {[30, 48, 38, 62, 55, 78, 100].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`flex-1 rounded-t-lg ${
                      i === 6 ? "bg-dark" : "bg-secondary"
                    }`}
                  />
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
