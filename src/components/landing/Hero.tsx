"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import ClaimBar from "./ClaimBar";
import { heroAvatars } from "@/lib/site";
import Img1 from "../../images/img1.png";
import Img2 from "../../images/img2.png";
import Img3 from "../../images/img3.png";
import Img4 from "../../images/img4.png";
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
  { id: 1, img: Img1.src, accent: "before:bg-emerald-500", svg: "fill-gray-800 group-hover:fill-gray-800" },
  { id: 2, img: Img2.src, accent: "before:bg-violet-500",  svg: "fill-gray-800 group-hover:fill-gray-800" },
  { id: 3, img: Img3.src, accent: "before:bg-rose-500",    svg: "fill-gray-800 group-hover:fill-gray-800" },
  { id: 4, img: Img4.src, accent: "before:bg-amber-500",   svg: "fill-gray-800 group-hover:fill-gray-800" },
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
  const plugin = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
    })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      orientation="vertical"
      opts={{ loop: true, align: "start" }}
      className="absolute top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[36px] mt-5"
      style={{ height: 720 }}
      onMouseEnter={() => plugin.current.stop()}
      onMouseLeave={() => plugin.current.reset()}
    >
      <CarouselContent className="-mt-0" style={{ height: 820 }}>
        {HERO_PROFILES.map((profile) => (
          <CarouselItem key={profile.id} className="basis-full pt-0">
            <div
              className="relative flex h-full items-center justify-center overflow-hidden rounded-[36px]"
              style={{ height: 750 }}
            >
              <img
                src={profile.img}
                alt={`Profile ${profile.id}`}
                className="h-full w-full object-cover"
              />
             
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
            {/* <div className="absolute -right-5 top-1/2 z-10 rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-dark shadow-soft">
              Free!
            </div>
            <div className="absolute -bottom-4 -left-5 z-10 grid h-14 w-14 place-items-center rounded-full bg-white text-xl shadow-soft">
              🔗
            </div> */}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
