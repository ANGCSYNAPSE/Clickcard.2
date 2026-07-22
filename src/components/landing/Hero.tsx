"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import ClaimBar from "./ClaimBar";
import { heroAvatars } from "@/lib/site";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const SERVICES = [
  "creator",
  "freelancer",
  "designer",
  "founder",
  "musician",
  "coach",
  "student",
  "business",
];

const HERO_PROFILES = [
  {
    name: "Arjun Mehta",
    handle: "clickcard.app/arjun",
    avatar: "https://i.pravatar.cc/160?img=12",
    bg: "bg-dark",
    text: "text-white",
    links: ["Portfolio", "Instagram", "Book a call", "My shop"],
  },
  {
    name: "Priya Sharma",
    handle: "clickcard.app/priya",
    avatar: "https://i.pravatar.cc/160?img=45",
    bg: "bg-primary",
    text: "text-dark",
    links: ["My Music", "YouTube", "Spotify", "Merch store"],
  },
  {
    name: "Rohan Kapoor",
    handle: "clickcard.app/rohan",
    avatar: "https://i.pravatar.cc/160?img=33",
    bg: "bg-paper-tint",
    text: "text-dark",
    links: ["Designs", "Dribbble", "Hire me", "Resume"],
  },
  {
    name: "Sneha Iyer",
    handle: "clickcard.app/sneha",
    avatar: "https://i.pravatar.cc/160?img=47",
    bg: "bg-secondary",
    text: "text-dark",
    links: ["Courses", "LinkedIn", "Newsletter", "Coaching"],
  },
];

function RotatingService() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % SERVICES.length), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-block">
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          className="inline-block rounded-card bg-primary px-4 py-0.5 text-dark"
        >
          {SERVICES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function ProfileCarousel() {
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));

  return (
    <Carousel
      plugins={[plugin.current]}
      orientation="vertical"
      opts={{ loop: true, align: "start" }}
      className="w-full"
      style={{ height: 620 }}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent className="-mt-0" style={{ height: 620 }}>
        {HERO_PROFILES.map((p) => (
          <CarouselItem key={p.name} className="pt-0 basis-full">
            <div
              className={`${p.bg} ${p.text} flex items-center justify-center rounded-[36px] border border-line p-8 shadow-soft-lg`}
              style={{ height: 620 }}
            >
              <div className="w-full text-center">
                <div className="mx-auto h-24 w-24 overflow-hidden rounded-full ring-4 ring-white/60">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-4 text-xl font-extrabold tracking-tight">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm font-medium opacity-60">
                  {p.handle}
                </p>
                <div className="mt-6 space-y-3">
                  {p.links.map((l) => (
                    <div
                      key={l}
                      className="rounded-full bg-white/90 px-4 py-3 text-sm font-bold text-dark shadow-soft-sm"
                    >
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper-soft px-4 pb-20 pt-28 lg:pb-28 lg:pt-36">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 h-[24rem] w-[24rem] rounded-full bg-secondary/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_400px]">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-xs font-bold text-subtle shadow-soft-sm">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              Free forever · no credit card
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-dark sm:text-6xl lg:text-7xl">
              Everything you are.
              <br />
              In one simple link.
            </h1>

            <p className="mt-6 max-w-lg text-lg font-medium leading-relaxed text-subtle">
              One link for every <RotatingService /> — portfolio, socials,
              business card, resume, QR code and storefront, all in one
              beautiful page.
            </p>

            <div className="mt-9">
              <ClaimBar />
              <p className="mt-4 text-sm font-semibold text-muted">
                Join 50,000+ people already sharing with ClickCard.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex items-center gap-4"
            >
              <div className="flex -space-x-3">
                {heroAvatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-11 w-11 rounded-full border-[3px] border-white object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-dark text-dark"
                    />
                  ))}
                </div>
                <p className="mt-1 text-sm font-semibold text-subtle">
                  Rated 4.9/5 by creators
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT — vertical profile carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block"
          >
            <ProfileCarousel />
            <div className="absolute -right-5 top-10 z-10 rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-dark shadow-soft">
              Free!
            </div>
            <div className="absolute -bottom-4 -left-5 z-10 grid h-14 w-14 place-items-center rounded-full bg-white text-xl shadow-soft">
              🔗
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
