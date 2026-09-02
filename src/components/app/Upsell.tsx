import Link from "next/link";
import { Crown, Lock, Sparkles } from "lucide-react";

/** Small inline upgrade pill — drop next to a gated control. */
export function UpgradeHint({ label }: { label?: string }) {
  return (
    <Link
      href="/billing"
      className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-bold text-white shadow-soft transition hover:bg-brand-600"
    >
      <Crown size={13} /> {label || "Upgrade"}
    </Link>
  );
}

/** Full-width banner shown when a plan limit is reached. */
export function LimitReachedBanner({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-brand-500/25 bg-brand-50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500 text-white">
          <Sparkles size={20} />
        </span>
        <div>
          <p className="font-bold text-ink dark:text-white">{title}</p>
          <p className="text-sm text-ink/60 dark:text-white/60">{description}</p>
        </div>
      </div>
      <Link
        href="/billing"
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-600"
      >
        <Crown size={15} /> Upgrade
      </Link>
    </div>
  );
}

/** Wraps a premium feature: blurs + locks it for users without the entitlement. */
export function Locked({
  locked,
  label,
  children,
}: {
  locked: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="pointer-events-none select-none opacity-40 blur-[2px]">{children}</div>
      <div className="absolute inset-0 grid place-items-center bg-white/40 backdrop-blur-[1px] dark:bg-[#1a1a1a]/40">
        <Link
          href="/billing"
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:scale-105"
        >
          <Lock size={15} /> Unlock {label}
        </Link>
      </div>
    </div>
  );
}
