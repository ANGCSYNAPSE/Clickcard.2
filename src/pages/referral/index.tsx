import { useEffect, useState } from "react";
import Head from "next/head";
import { Gift, Copy, Check, Share2, Users, UserCheck } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { pushToast } from "@/store/slices/uiSlice";
import { referralService } from "@/services/referralService";
import { SITE_URL } from "@/lib/config";
import type { ReferralStats, ReferredUser } from "@/types";

export default function ReferralPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const code = user?.referral_code || "";
  const inviteLink = code ? `${SITE_URL}/signup?ref=${code}` : "";

  const [referrals, setReferrals] = useState<ReferredUser[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    referralService
      .myReferrals()
      .then(({ data }) => {
        if (cancelled) return;
        setReferrals(data.data?.referrals || []);
        setStats(data.data?.stats || null);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    dispatch(pushToast("Invite link copied to clipboard", "success"));
    setTimeout(() => setCopied(false), 1500);
  };

  const shareLink = async () => {
    if (!inviteLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on ClickCard",
          text: `Use my referral code ${code} to sign up on ClickCard`,
          url: inviteLink,
        });
      } catch {
        /* user cancelled the share sheet — nothing to do */
      }
    } else {
      copyLink();
    }
  };

  const stat = [
    { label: "Total referrals", value: Number(stats?.total_referrals ?? 0), icon: Users, tint: "bg-brand-500" },
    { label: "Completed profiles", value: Number(stats?.completed_profiles ?? 0), icon: UserCheck, tint: "bg-candy-pink" },
  ];

  return (
    <AppShell title="Referral">
      <Head>
        <title>Referral · ClickCard</title>
      </Head>

      {/* code + invite link */}
      <div className="rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#262626]">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-500 text-white">
            <Gift size={22} />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-black text-ink dark:text-white">
              Invite friends, grow together
            </h2>
            <p className="text-sm text-ink/55 dark:text-white/55">
              Share your referral code — anyone who signs up with it shows up here.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-xl bg-brand-50 px-4 py-2.5 font-display text-xl font-black tracking-[0.15em] text-brand-600 dark:bg-white/5 dark:text-white">
            {code || "······"}
          </span>
          <span className="text-sm text-ink/55 dark:text-white/55">Your referral code</span>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 truncate rounded-xl border border-ink/[0.07] bg-mist px-3.5 py-2.5 text-sm font-medium text-ink/70 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-white/70">
            {inviteLink || "Loading your invite link…"}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              disabled={!inviteLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink/[0.07] bg-white px-3.5 py-2.5 text-sm font-bold text-ink transition hover:bg-ink/5 disabled:opacity-50 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-white"
            >
              {copied ? <Check size={16} className="text-candy-pink" /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={shareLink}
              disabled={!inviteLink}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {stat.map((s) => (
          <div key={s.label} className="rounded-3xl border border-ink/[0.06] bg-white p-5 dark:border-white/[0.06] dark:bg-[#262626]">
            <span className={`grid h-11 w-11 place-items-center rounded-2xl ${s.tint} text-white`}>
              <s.icon size={20} />
            </span>
            <p className="mt-4 font-display text-2xl font-black text-ink dark:text-white">
              {s.value.toLocaleString()}
            </p>
            <p className="text-sm text-ink/55 dark:text-white/55">{s.label}</p>
          </div>
        ))}
      </div>

      {/* referred users */}
      <div className="mt-6 rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#262626]">
        <h2 className="font-display text-lg font-bold text-ink dark:text-white">
          People you've referred
        </h2>

        {loading ? (
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-ink/5 dark:bg-white/5" />
            ))}
          </div>
        ) : referrals.length === 0 ? (
          <div className="mt-4 grid place-items-center py-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-white/5">
              <Gift size={26} />
            </span>
            <p className="mt-3 text-sm text-ink/55 dark:text-white/55">
              No referrals yet — share your invite link to get started.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {referrals.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-ink/[0.06] px-4 py-3 dark:border-white/[0.06]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink dark:text-white">
                    @{r.username}
                  </p>
                  <p className="truncate text-xs text-ink/50 dark:text-white/50">{r.email}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                    r.status === "profile_completed"
                      ? "bg-candy-pink/15 text-candy-pink"
                      : "bg-ink/5 text-ink/60 dark:bg-white/10 dark:text-white/60"
                  }`}
                >
                  {r.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
