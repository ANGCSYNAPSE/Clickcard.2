import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Check,
  Crown,
  Zap,
  Sparkles,
  Fingerprint,
  Store,
  LineChart,
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

const VERTICAL_ICON: Record<string, typeof Crown> = {
  pro_identity: Fingerprint,
  studio_pro: Sparkles,
  business_storefront: Store,
  analytics_growth: LineChart,
};
const VERTICAL_TINT: Record<string, string> = {
  pro_identity: "bg-brand-500",
  studio_pro: "bg-candy-yellow",
  business_storefront: "bg-candy-pink",
  analytics_growth: "bg-ink",
};

const rupees = (paise: number) => `₹${Math.round(paise / 100).toLocaleString()}`;

export default function BillingPage() {
  const dispatch = useAppDispatch();
  const { plans, verticals, subscription, status, upgrading } = useAppSelector(
    (s) => s.billing,
  );
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#12403c]">
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
                ? "Upgrade to unlock premium verticals."
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

      {/* verticals */}
      <h2 className="mb-3 mt-8 font-display text-lg font-bold text-ink dark:text-white">
        What you unlock
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {verticals.map((v) => {
          const Icon = VERTICAL_ICON[v.id] || Sparkles;
          const active = subscription?.verticals?.includes(v.id);
          return (
            <div
              key={v.id}
              className={`rounded-3xl border bg-white p-5 dark:bg-[#12403c] ${
                active
                  ? "border-transparent ring-2 ring-brand-400"
                  : "border-ink/[0.06] dark:border-white/[0.06]"
              }`}
            >
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${VERTICAL_TINT[v.id]} text-white`}>
                <Icon size={20} />
              </span>
              <p className="mt-3 font-bold text-ink dark:text-white">{v.name}</p>
              <p className="text-xs text-ink/55 dark:text-white/55">{v.tagline}</p>
              {active && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-candy-pink">
                  <Check size={13} /> Active
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* cycle toggle */}
      <div className="mt-10 flex items-center justify-center gap-3">
        <span className={`text-sm font-bold ${cycle === "monthly" ? "text-ink dark:text-white" : "text-ink/40"}`}>Monthly</span>
        <button
          onClick={() => setCycle((c) => (c === "monthly" ? "yearly" : "monthly"))}
          className={`relative h-7 w-12 rounded-full transition ${cycle === "yearly" ? "bg-brand-500" : "bg-ink/20 dark:bg-white/20"}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${cycle === "yearly" ? "left-6" : "left-1"}`} />
        </button>
        <span className={`text-sm font-bold ${cycle === "yearly" ? "text-ink dark:text-white" : "text-ink/40"}`}>
          Yearly <span className="text-candy-pink">· save ~2 months</span>
        </span>
      </div>

      {/* plans */}
      {status === "loading" && plans.length === 0 ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((p, idx) => {
            // Use shared pricing from site config (PRICING array)
            const pricingConfig = PRICING[idx] || PRICING[0];
            const basePrice = parseInt(pricingConfig.price.replace("₹", "").replace(/,/g, ""));
            const price = cycle === "yearly" ? (basePrice * 12) * 100 : basePrice * 100; // Convert to paise for rupees function
            const isCurrent = p.id === currentPlanId;
            const isFree = p.id === "free";
            return (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-3xl border bg-white p-6 dark:bg-[#12403c] ${
                  p.popular
                    ? "border-transparent shadow-soft ring-2 ring-brand-400"
                    : "border-ink/[0.06] dark:border-white/[0.06]"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-soft">
                    Most popular
                  </span>
                )}
                <p className="font-display text-lg font-black text-ink dark:text-white">{p.name}</p>
                <p className="text-sm text-ink/55 dark:text-white/55">{p.tagline}</p>
                <p className="mt-3">
                  <span className="font-display text-3xl font-black text-ink dark:text-white">{rupees(price)}</span>
                  <span className="text-sm text-ink/50 dark:text-white/50">
                    {isFree ? " forever" : cycle === "yearly" ? " /yr" : " /mo"}
                  </span>
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {(isFree
                    ? ["1 profile", "5 links", "Standard QR", "Basic analytics"]
                    : verticals.filter((v) => p.verticals.includes(v.id)).map((v) => v.name)
                  ).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink/70 dark:text-white/70">
                      <Check size={16} className="mt-0.5 shrink-0 text-candy-pink" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent || isFree || upgrading === p.id}
                  onClick={() => onUpgrade(p.id)}
                  className={`mt-6 inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition ${
                    isCurrent
                      ? "cursor-default bg-ink/5 text-ink/40 dark:bg-white/5 dark:text-white/40"
                      : isFree
                        ? "cursor-default bg-ink/5 text-ink/40 dark:bg-white/5 dark:text-white/40"
                        : p.popular
                          ? "bg-brand-500 text-white hover:bg-brand-600"
                          : "bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-white/5 dark:text-white"
                  }`}
                >
                  {upgrading === p.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : isCurrent ? (
                    "Current plan"
                  ) : isFree ? (
                    "Free forever"
                  ) : (
                    <><Zap size={15} /> Upgrade to {p.name}</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
