"use client";
import { motion } from "framer-motion";
import { WEBAPP_URL } from "@/lib/site";

type Feature = { emoji: string; title: string; desc?: string };
type Group = { label?: string; items: Feature[] };
type Plan = {
  name: string;
  blurb: string;
  price: string;
  priceNote: string;
  cta: string;
  recommended?: boolean;
  intro: string;
  groups: Group[];
};

const PLANS: Plan[] = [
  {
    name: "Free",
    blurb: "Get started with your own personal ClickCard",
    price: "₹0",
    priceNote: "Free, forever",
    cta: "Get started",
    intro: "Key features:",
    groups: [
      {
        items: [
          { emoji: "🪪", title: "1 digital profile", desc: "Your whole identity on one clean, shareable page" },
          { emoji: "🔗", title: "5 links", desc: "Route people to your socials, work and contact" },
          { emoji: "📱", title: "Standard QR code", desc: "Scannable from screens, print and packaging" },
          { emoji: "🎨", title: "1 card template", desc: "A polished business card, ready in minutes" },
          { emoji: "📊", title: "Basic analytics", desc: "See views and taps on your profile" },
        ],
      },
    ],
  },
  {
    name: "Pro",
    blurb: "For professionals & creators looking to grow",
    price: "₹299",
    priceNote: "INR/mo · cancel anytime",
    cta: "Go Pro",
    recommended: true,
    intro: "Everything in Free, plus:",
    groups: [
      {
        label: "Link in bio",
        items: [
          { emoji: "♾️", title: "Unlimited links", desc: "No caps — add everything you make and sell" },
          { emoji: "✨", title: "All Studio templates", desc: "120+ card, resume and poster designs" },
          { emoji: "📄", title: "PDF resume export", desc: "A recruiter-ready PDF in one tap" },
        ],
      },
      {
        label: "Grow",
        items: [
          { emoji: "📈", title: "Custom QR & analytics", desc: "Branded QR codes with live scan tracking" },
          { emoji: "🎁", title: "Referral rewards", desc: "Share your code and unlock premium perks" },
        ],
      },
    ],
  },
  {
    name: "Business",
    blurb: "For teams & storefronts that sell",
    price: "₹599",
    priceNote: "INR/mo · cancel anytime",
    cta: "Scale up",
    intro: "Everything in Pro, plus:",
    groups: [
      {
        label: "Sell",
        items: [
          { emoji: "🛍️", title: "Product catalogue", desc: "Showcase products with images and prices" },
          { emoji: "🕐", title: "Business hours & maps", desc: "Help customers find and visit you" },
        ],
      },
      {
        label: "Team",
        items: [
          { emoji: "👥", title: "Team profiles", desc: "A consistent card for every teammate" },
          { emoji: "⭐", title: "Priority support", desc: "Real answers from real humans, fast" },
        ],
      },
    ],
  },
];

export default function Plans() {
  return (
    <section id="pricing" className="bg-paper-soft px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-yellow px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-dark">
            Pricing
          </span>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-dark sm:text-5xl">
            Start free. Stay free.
            <br />
            <span className="text-subtle">Upgrade when you grow.</span>
          </h2>
        </motion.div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => {
            const isRec = plan.recommended;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`flex flex-col overflow-hidden rounded-[28px] ${
                  isRec
                    ? "bg-dark text-white shadow-soft-lg lg:scale-[1.03]"
                    : "border border-line bg-white shadow-soft"
                }`}
              >
                {/* header */}
                <div className="px-7 pb-4 pt-7">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-2xl font-extrabold tracking-tight">
                      {plan.name}
                    </p>
                    {isRec && (
                      <span className="mt-1 shrink-0 rounded-full bg-yellow px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-dark">
                        Best value
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-1 text-sm font-medium ${
                      isRec ? "text-white/60" : "text-subtle"
                    }`}
                  >
                    {plan.blurb}
                  </p>
                </div>

                {/* body */}
                <div className="flex flex-1 flex-col px-7 pb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        isRec ? "text-white/45" : "text-muted"
                      }`}
                    >
                      {plan.priceNote}
                    </span>
                  </div>

                  <a
                    href={WEBAPP_URL}
                    className={`btn mt-6 w-full py-3.5 text-sm ${
                      isRec ? "btn-accent" : "btn-primary"
                    }`}
                  >
                    {plan.cta}
                  </a>

                  <p className="mt-7 text-sm font-bold">{plan.intro}</p>

                  <div className="mt-4 space-y-5">
                    {plan.groups.map((group, gi) => (
                      <div key={gi}>
                        {group.label && (
                          <p
                            className={`mb-3 text-xs font-bold uppercase tracking-[0.15em] ${
                              isRec ? "text-white/40" : "text-muted"
                            }`}
                          >
                            {group.label}
                          </p>
                        )}
                        <ul className="space-y-3">
                          {group.items.map((f) => (
                            <li key={f.title} className="flex items-start gap-3">
                              <span
                                aria-hidden
                                className="mt-0.5 text-lg leading-none"
                              >
                                {f.emoji}
                              </span>
                              <span>
                                <span className="block text-sm font-bold">
                                  {f.title}
                                </span>
                                {f.desc && (
                                  <span
                                    className={`mt-0.5 block text-xs font-medium leading-relaxed ${
                                      isRec ? "text-white/55" : "text-subtle"
                                    }`}
                                  >
                                    {f.desc}
                                  </span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm font-semibold text-muted">
          Prices in INR. Cancel anytime — your free profile stays live forever.
        </p>
      </div>
    </section>
  );
}
