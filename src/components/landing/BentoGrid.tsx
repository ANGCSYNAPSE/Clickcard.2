"use client";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowUpRight,
  BarChart3,
  FileText,
  Gift,
  Link2,
  Smartphone,
  Sparkles,
  Store,
} from "lucide-react";

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

const tile = "card card-hover p-6";
const iconBox = "grid h-11 w-11 place-items-center rounded-card";

export default function BentoGrid() {
  return (
    <section id="features" className="bg-paper px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div {...reveal} className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-subtle">
            What we do
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-dark sm:text-5xl">
            Everything you need.
            <br />
            <span className="text-subtle">Nothing you don&apos;t.</span>
          </h2>
        </motion.div>

        <motion.div
          {...reveal}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Smart link — hero tile */}
          <div
            className={`${tile} bg-dark text-white sm:col-span-2 lg:row-span-2`}
            style={{ borderColor: "transparent" }}
          >
            <div className="flex items-center gap-3">
              <span className={`${iconBox} bg-primary text-dark`}>
                <Link2 className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-extrabold">One smart link</h3>
            </div>
            <p className="mt-4 text-sm font-medium leading-relaxed text-white/70">
              Claim <strong className="text-primary">clickcard.app/you</strong>{" "}
              and route people to everything — socials, work, shop, contact —
              from a single URL.
            </p>
            <div className="mt-6 space-y-2.5">
              {[
                "Instagram",
                "My resume",
                "Book a meeting",
                "Shop my products",
              ].map((l) => (
                <div
                  key={l}
                  className="group flex cursor-pointer items-center justify-between rounded-full bg-white px-5 py-3 text-sm font-bold text-dark transition hover:bg-primary"
                >
                  {l}
                  <ArrowUpRight className="h-4 w-4 opacity-40 transition group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic QR */}
          <div className={`${tile} bg-paper-soft`}>
            <div className="flex justify-center rounded-card bg-white p-4">
              <QRCodeSVG
                value="https://clickcard.app/you"
                size={86}
                bgColor="#ffffff"
                fgColor="#1E2330"
              />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-dark">
              Dynamic QR
            </h3>
            <p className="mt-1 text-sm font-medium text-subtle">
              Auto-generated for every profile. Print once — update forever.
            </p>
          </div>

          {/* Card Studio */}
          <div className={`${tile} bg-primary`} style={{ borderColor: "transparent" }}>
            <span className={`${iconBox} bg-dark text-primary`}>
              <Sparkles className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-extrabold text-dark">
              Card Studio
            </h3>
            <p className="mt-1 text-sm font-medium text-dark/70">
              Branded business cards, resumes &amp; flyers from 120+ templates.
            </p>
          </div>

          {/* Analytics — wide tile */}
          <div className={`${tile} sm:col-span-2`}>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-[16rem]">
                <span className={`${iconBox} bg-secondary text-dark`}>
                  <BarChart3 className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-extrabold text-dark">
                  Live analytics
                </h3>
                <p className="mt-1 text-sm font-medium text-subtle">
                  Views, taps &amp; scans in real time. Know exactly what works.
                </p>
              </div>
              <div className="flex items-end gap-1.5 pb-1">
                {[28, 44, 36, 58, 50, 72, 88].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}px` }}
                    className={`w-5 rounded-t-lg ${
                      i === 6 ? "bg-dark" : "bg-primary"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* PDF resume */}
          <div className={`${tile} bg-paper-soft`}>
            <span className={`${iconBox} bg-dark text-primary`}>
              <FileText className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-extrabold text-dark">
              PDF resume
            </h3>
            <p className="mt-1 text-sm font-medium text-subtle">
              A recruiter-ready PDF of your profile, exported in one tap.
            </p>
          </div>

          {/* Referrals */}
          <div className={`${tile} bg-secondary`} style={{ borderColor: "transparent" }}>
            <span className={`${iconBox} bg-dark text-secondary`}>
              <Gift className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-extrabold text-dark">
              Referral rewards
            </h3>
            <p className="mt-1 text-sm font-medium text-dark/70">
              Share your code, grow the network, unlock premium perks.
            </p>
          </div>

          {/* Storefront */}
          <div className={tile}>
            <span className={`${iconBox} bg-paper-tint text-dark`}>
              <Store className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-extrabold text-dark">
              Storefront
            </h3>
            <p className="mt-1 text-sm font-medium text-subtle">
              Products, services, hours &amp; maps — a mini shop inside your
              link.
            </p>
          </div>

          {/* Offline-ready */}
          <div className={`${tile} bg-dark text-white`} style={{ borderColor: "transparent" }}>
            <span className={`${iconBox} bg-primary text-dark`}>
              <Smartphone className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-extrabold">Works offline</h3>
            <p className="mt-1 text-sm font-medium text-white/60">
              NFC taps, wallet passes &amp; printed QR — no app needed to
              receive.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
