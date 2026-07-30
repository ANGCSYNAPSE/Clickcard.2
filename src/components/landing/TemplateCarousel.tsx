"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TEMPLATES = [
  {
    title: "Social Worker",
    tagline: "Support. Empower. Advocate.",
    image: "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=600&h=400&fit=crop",
    tabs: ["Resources", "Support Groups", "Get Involved"],
    features: ["Find Help", "Upcoming Events"],
    cta: "Get in Touch",
    miniTitle: "Social Work Services",
    miniDesc: "Providing support for individuals, families, and communities.",
    miniCta: "Learn More",
    accent: "#C8956C",
    bg: "bg-[#FDF6EE]",
    miniBg: "from-[#2C2418] to-[#4A3828]",
  },
  {
    title: "Perfume",
    tagline: "Scent. Elegance. Passion.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=400&fit=crop",
    tabs: ["Shop", "Behind the Scents", "Our Story"],
    features: ["Luxury", "Refined Ingredients"],
    cta: "Explore Now",
    miniTitle: "Discover Your Signature Scent",
    miniDesc: "Find the perfect fragrance that matches your personality.",
    miniCta: "Take the Quiz",
    accent: "#C8A96C",
    bg: "bg-[#FDF8F0]",
    miniBg: "from-[#2A2418] to-[#4A3C28]",
  },
  {
    title: "Cloth Designer",
    tagline: "Design. Create. Inspire.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
    tabs: ["Design", "Sketch", "Create"],
    features: ["Live Sessions", "Project Based"],
    cta: "Book a Session",
    miniTitle: "Fashion Design Fundamentals",
    miniDesc: "Learn the art of clothing design from sketch to creation.",
    miniCta: "Enroll in Course",
    accent: "#B8868A",
    bg: "bg-[#FAF5F2]",
    miniBg: "from-[#1A1418] to-[#3A2C30]",
  },
  {
    title: "Web Designer",
    tagline: "Design. Create. Inspire.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
    tabs: ["Design", "Build", "Launch"],
    features: ["Live Sessions", "Project Based"],
    cta: "Book a Session",
    miniTitle: "Web Design Fundamentals",
    miniDesc: "Learn the basics of web design and create stunning websites.",
    miniCta: "Enroll in Course",
    accent: "#6366F1",
    bg: "bg-[#F0F0FF]",
    miniBg: "from-[#0A0A1A] to-[#1A1A30]",
  },
  {
    title: "Photographer",
    tagline: "Capture. Memories. Forever.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop",
    tabs: ["Portfolio", "Services", "Book"],
    features: ["High Quality", "Professional"],
    cta: "Book a Shoot",
    miniTitle: "Professional Photography",
    miniDesc: "Capture your best moments with our professional photography services.",
    miniCta: "View Portfolio",
    accent: "#E11D48",
    bg: "bg-[#FFF1F2]",
    miniBg: "from-[#4C0519] to-[#881337]",
  },
  {
    title: "Fitness Coach",
    tagline: "Train. Sweat. Achieve.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
    tabs: ["Workouts", "Nutrition", "Plans"],
    features: ["Personalized", "Effective"],
    cta: "Start Training",
    miniTitle: "Fitness Coaching",
    miniDesc: "Get in shape with our personalized fitness plans.",
    miniCta: "Join Now",
    accent: "#16A34A",
    bg: "bg-[#F0FDF4]",
    miniBg: "from-[#052E16] to-[#14532D]",
  },
];

export default function TemplateCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % TEMPLATES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const t = TEMPLATES[index];

  return (
    <div className="relative w-full mx-auto" style={{ perspective: "1200px" }}>
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-5">
        {TEMPLATES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Show template ${i + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-dark" : "w-2.5 bg-line-strong"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ rotateY: 90, opacity: 0, x: 100 }}
          animate={{ rotateY: 0, opacity: 1, x: 0 }}
          exit={{ rotateY: -90, opacity: 0, x: -100 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Main phone mockup card */}
          <div className={`relative overflow-hidden rounded-[28px] border border-line shadow-soft-lg ${t.bg}`}>
            <div className="p-5 pb-3">
              {/* Title */}
              <h3
                className="text-2xl font-extrabold leading-tight tracking-tight"
                style={{ color: t.accent }}
              >
                {t.title}
              </h3>
              <p className="mt-1 text-sm italic text-subtle">{t.tagline}</p>

              {/* Hero image */}
              <div className="mt-4 overflow-hidden rounded-card border border-line">
                <img
                  src={t.image}
                  alt={t.title}
                  className="h-40 w-full object-cover"
                />
              </div>

              {/* Tabs */}
              <div className="mt-4 flex gap-2">
                {t.tabs.map((tab, i) => (
                  <span
                    key={tab}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                      i === 0
                        ? "text-white"
                        : "border border-line bg-transparent text-subtle"
                    }`}
                    style={i === 0 ? { backgroundColor: t.accent } : {}}
                  >
                    {tab}
                  </span>
                ))}
              </div>

              {/* Features */}
              <div className="mt-3 flex gap-4">
                {t.features.map((f) => (
                  <span key={f} className="text-[11px] font-medium text-muted">
                    {f}
                  </span>
                ))}
              </div>

              {/* CTA button */}
              <div
                className="mt-4 rounded-full py-2.5 text-center text-sm font-bold text-white"
                style={{ backgroundColor: t.accent }}
              >
                {t.cta}
              </div>
            </div>

            {/* Mini dark card overlay */}
            <div className="mx-3 mb-4 rounded-card bg-dark p-4">
              <p className="text-base font-extrabold text-white">{t.miniTitle}</p>
              <p className="mt-1 text-[11px] text-white/60">{t.miniDesc}</p>
              <div
                className="mt-3 rounded-full py-2 text-center text-xs font-bold text-white"
                style={{ backgroundColor: t.accent }}
              >
                {t.miniCta}
              </div>
            </div>
          </div>

          {/* Floating social icons */}
          <div className="absolute -right-8 top-1/3 flex flex-col gap-3">
            {["📷", "🎵", "🔗"].map((emoji, i) => (
              <motion.div
                key={emoji}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-sm shadow-soft-sm"
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
