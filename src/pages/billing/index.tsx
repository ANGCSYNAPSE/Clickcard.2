import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Check,
  Crown,
  Zap,
  Loader2,
} from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchPlans,
  fetchSubscription,
  upgradePlan,
  cancelPlan,
} from "@/store/slices/billingSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { pricing as PRICING } from "@/lib/site";

const rupees = (paise: number) => `₹${Math.round(paise / 100).toLocaleString()}`;

type Feature = { emoji: string; title: string; desc?: string };
type Group = { label?: string; items: Feature[] };
type PlanDisplay = {
  id: string;
  name: string;
  blurb: string;
  priceNote: string;
  cta: string;
  recommended?: boolean;
  intro: string;
  groups: Group[];
};

const PLAN_DISPLAY: PlanDisplay[] = [
  {
    id: "free",
    name: "Free",
    blurb: "Get started with your own personal ClickCard",
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
    id: "pro",
    name: "Pro",
    blurb: "For professionals & creators looking to grow",
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
    id: "business",
    name: "Business",
    blurb: "For teams & storefronts that sell",
    priceNote: "INR/mo · cancel anytime",
    cta: "Scale up",
    intro: "Everything in Pro, plus:",
    groups: [
      {
        label: "Sell",
        items: [
          { emoji: "🛍️", title: "Product catalogue", desc: "Showcase products with images and prices" },
          { emoji: "🕐", title: "Business hours & maps", desc: "Help customers find and visit you" },
          { emoji: "🏢", title: "Business profile", desc: "A dedicated page for your brand or storefront" },
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

export default function BillingPage() {
  const dispatch = useAppDispatch();
  const { plans, subscription, status, upgrading } = useAppSelector((s) => s.billing);
  const user = useAppSelector((s) => s.auth.user);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchSubscription());
  }, [dispatch]);

  const currentPlanId = subscription?.planId || "free";

  const onUpgrade = async (planId: string) => {
    const res = await dispatch(
      upgradePlan({
        planId,
        billingCycle: cycle,
        userEmail: user?.email,
        userName: user?.username,
      }),
    );
    if (upgradePlan.fulfilled.match(res)) {
      dispatch(pushToast(`You're on ${planId.toUpperCase()} now 🎉`, "success"));
    } else {
      const msg = (res.payload as string) || "Upgrade failed";
      dispatch(pushToast(msg, msg === "Payment cancelled" ? "info" : "error"));
    }
  };

  const onCancel = async () => {
    const res = await dispatch(cancelPlan());
    if (cancelPlan.fulfilled.match(res))
      dispatch(pushToast("Subscription canceled — back to Free.", "info"));
  };

  return (
    <AppShell title="Billing & plans">
      <Head>
        <title>Billing · ClickCard</title>
      </Head>

      {/* current plan */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#262626]">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-white">
            <Crown size={22} />
          </span>
          <div>
            <p className="font-display text-lg font-black text-ink dark:text-white">
              {subscription?.planName || "Free"} plan
            </p>
            <p className="text-sm text-ink/55 dark:text-white/55">
              {currentPlanId === "free"
                ? "Upgrade to unlock premium features."
                : `Renews ${subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "—"} · ${subscription?.billingCycle}`}
            </p>
          </div>
        </div>
        {currentPlanId !== "free" && (
          <button
            onClick={onCancel}
            className="rounded-xl bg-ink/5 px-4 py-2 text-sm font-bold text-ink/60 transition hover:bg-rose-50 hover:text-rose-500 dark:bg-white/5 dark:text-white/60"
          >
            Cancel
          </button>
        )}
      </div>

      {/* cycle toggle */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <span className={`text-sm font-bold ${cycle === "monthly" ? "text-ink dark:text-white" : "text-ink/40 dark:text-white/40"}`}>Monthly</span>
        <button
          onClick={() => setCycle((c) => (c === "monthly" ? "yearly" : "monthly"))}
          className={`relative h-7 w-12 rounded-full transition ${cycle === "yearly" ? "bg-brand-500" : "bg-ink/20 dark:bg-white/20"}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${cycle === "yearly" ? "left-6" : "left-1"}`} />
        </button>
        <span className={`text-sm font-bold ${cycle === "yearly" ? "text-ink dark:text-white" : "text-ink/40 dark:text-white/40"}`}>
          Yearly <span className="text-brand-500">· save ~2 months</span>
        </span>
      </div>

      {/* plans */}
      {status === "loading" && plans.length === 0 ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {PLAN_DISPLAY.map((display, idx) => {
            const pricingConfig = PRICING[idx] || PRICING[0];
            const basePrice = parseInt(pricingConfig.price.replace("₹", "").replace(/,/g, "")) || 0;
            const price = cycle === "yearly" ? basePrice * 12 * 100 : basePrice * 100;
            const isCurrent = display.id === currentPlanId;
            const isFree = display.id === "free";
            const isRec = display.recommended;

            return (
              <div
                key={display.id}
                className={`relative flex flex-col overflow-hidden rounded-[28px] ${
                  isRec
                    ? "bg-ink text-white dark:bg-white dark:text-ink"
                    : "border border-ink/[0.06] bg-white text-ink dark:border-white/[0.06] dark:bg-[#262626] dark:text-white"
                }`}
              >
                {/* header */}
                <div className="px-7 pb-4 pt-7">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-2xl font-extrabold tracking-tight">
                      {display.name}
                    </p>
                    {isRec && (
                      <span className="mt-1 shrink-0 rounded-full bg-brand-400 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
                        Best value
                      </span>
                    )}
                  </div>
                  <p className={`mt-1 text-sm font-medium ${isRec ? "text-white/60 dark:text-ink/60" : "opacity-55"}`}>
                    {display.blurb}
                  </p>
                </div>

                {/* body */}
                <div className="flex flex-1 flex-col px-7 pb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {isFree ? "₹0" : rupees(price)}
                    </span>
                    <span className={`text-sm font-semibold ${isRec ? "text-white/45 dark:text-ink/45" : "opacity-45"}`}>
                      {display.priceNote}
                    </span>
                  </div>

                  <button
                    disabled={isCurrent || isFree || upgrading === display.id}
                    onClick={() => !isFree && !isCurrent && onUpgrade(display.id)}
                    className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition ${
                      isCurrent
                        ? "cursor-default bg-ink/10 text-ink/40 dark:bg-white/10 dark:text-white/40"
                        : isFree
                          ? "cursor-default bg-ink/5 text-ink/40 dark:bg-white/5 dark:text-white/40"
                          : isRec
                            ? "bg-brand-500 text-white hover:bg-brand-600"
                            : "bg-ink text-white hover:bg-ink/80 dark:bg-white dark:text-ink dark:hover:bg-white/90"
                    }`}
                  >
                    {upgrading === display.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : isCurrent ? (
                      <><Check size={15} /> Current plan</>
                    ) : isFree ? (
                      display.cta
                    ) : (
                      <><Zap size={15} /> {display.cta}</>
                    )}
                  </button>

                  <p className="mt-7 text-sm font-bold">
                    {display.intro}
                  </p>

                  <div className="mt-4 space-y-5">
                    {display.groups.map((group, gi) => (
                      <div key={gi}>
                        {group.label && (
                          <p className={`mb-3 text-xs font-bold uppercase tracking-[0.15em] ${isRec ? "text-white/40 dark:text-ink/40" : "opacity-40"}`}>
                            {group.label}
                          </p>
                        )}
                        <ul className="space-y-3">
                          {group.items.map((f) => (
                            <li key={f.title} className="flex items-start gap-3">
                              <span aria-hidden className="mt-0.5 text-lg leading-none">{f.emoji}</span>
                              <span>
                                <span className={`block text-sm font-bold ${isRec ? "text-white dark:text-ink" : "text-ink dark:text-white"}`}>
                                  {f.title}
                                </span>
                                {f.desc && (
                                  <span className={`mt-0.5 block text-xs font-medium leading-relaxed ${isRec ? "text-white/55 dark:text-ink/55" : "text-ink/55 dark:text-white/55"}`}>
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
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center text-sm font-semibold text-ink/45 dark:text-white/45">
        Prices in INR. Cancel anytime — your free profile stays live forever.
      </p>
    </AppShell>
  );
}
