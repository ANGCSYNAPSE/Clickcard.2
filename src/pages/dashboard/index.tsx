import { useEffect, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Eye,
  MousePointerClick,
  Download,
  Sparkles,
  Share2,
  BarChart3,
  Pencil,
  ArrowRight,
  Plus,
} from "lucide-react";
import AppShell from "@/components/app/AppShell";
import LiveProfileFeed from "@/components/app/LiveProfileFeed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/profileSlice";
import { fetchShareTotals, fetchShareLinks } from "@/store/slices/shareSlice";
import { fetchDashboardAnalytics } from "@/store/slices/analyticsSlice";

/** Solid retro-sunset tiles — icon, title, one-line hint. */
const QUICK = [
  {
    label: "Edit profile",
    hint: "Update your details",
    href: "/profile",
    icon: Pencil,
    tint: "bg-brand-500",
  },
  {
    label: "Design card",
    hint: "Customize your card",
    href: "/customize",
    icon: Sparkles,
    tint: "bg-candy-yellow",
  },
  {
    label: "Share profile",
    hint: "Share your link",
    href: "/share",
    icon: Share2,
    tint: "bg-candy-pink",
  },
  {
    label: "View analytics",
    hint: "Track performance",
    href: "/analytics",
    icon: BarChart3,
    tint: "bg-ink",
  },
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { draft, isPublic } = useAppSelector((s) => s.profile);
  const { links } = useAppSelector((s) => s.share);
  const { dashboard } = useAppSelector((s) => s.analytics);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchShareTotals());
    dispatch(fetchShareLinks());
    dispatch(fetchDashboardAnalytics());
  }, [dispatch]);

  const completion = useMemo(() => {
    const checks = [
      draft.personal?.fullName,
      draft.personal?.tagline,
      draft.personal?.profilePicture,
      draft.contact?.email || draft.contact?.phone,
      (draft.social?.length ?? 0) > 0,
      (draft.experience?.length ?? 0) > 0 || (draft.education?.length ?? 0) > 0,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [draft]);

  const totals = dashboard?.totals;
  const today = dashboard?.today;
  const stats = [
    {
      label: "Profile views",
      value: totals?.profileViews ?? 0,
      delta: today?.profileViews ?? 0,
      icon: Eye,
      tint: "bg-brand-500",
    },
    {
      label: "Link taps",
      value: totals?.linkTaps ?? 0,
      delta: today?.linkTaps ?? 0,
      icon: MousePointerClick,
      tint: "bg-candy-yellow",
    },
    {
      label: "Active links",
      value: totals?.activeLinks ?? links.length,
      delta: 0,
      icon: Share2,
      tint: "bg-candy-pink",
    },
    {
      label: "PDF downloads",
      value: totals?.pdfDownloads ?? 0,
      delta: today?.pdfDownloads ?? 0,
      icon: Download,
      tint: "bg-candy-pink/55",
    },
  ];

  return (
    <AppShell>
      <Head>
        <title>Dashboard · ClickCard</title>
      </Head>

      {/* hero */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-500 p-6 text-white sm:p-8">
        {/* Flat geometric shapes, per the retro-sunset design. Confined to the
            right half and sized in % so they scale with the hero instead of
            creeping under the copy; dropped entirely on small screens. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 overflow-hidden md:block">
          <div className="absolute left-[20%] top-1/2 aspect-square w-[125%] -translate-y-1/2 rounded-full bg-candy-yellow" />
          <div className="absolute left-[62%] top-1/2 aspect-square w-[125%] -translate-y-1/2 rounded-full bg-candy-pink" />
        </div>
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 md:max-w-[52%]">
            <p className="text-sm font-semibold text-white/80">
              {greeting()}, welcome back 👋
            </p>
            <h1 className="mt-1 break-words font-display text-2xl font-black sm:text-3xl">
              {user?.username ? `@${user.username}` : "Your ClickCard"}
            </h1>
            <p className="mt-1 break-words text-sm text-white/80">
              {isPublic ? "Your profile is live & public" : "Your profile is private"} ·{" "}
              clickcard.app/{user?.username ?? "you"}
            </p>
          </div>
          <Link
            href="/profile"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-brand-600 shadow-soft transition hover:scale-105"
          >
            <Plus size={18} /> Build my profile
          </Link>
        </div>
      </div>

      {/* completion + live phone preview side-by-side on lg */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl border border-ink/5 bg-white p-6 dark:border-white/5 dark:bg-[#12403c]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink dark:text-white">
              Profile completion
            </h2>
            <span className="font-display text-2xl font-black text-brand-600">
              {completion}%
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-brand-50 dark:bg-white/5">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-ink/55 dark:text-white/55">
            {completion < 100
              ? "Add more details to make your page shine and rank better."
              : "Nice! Your profile looks complete. 🎉"}
          </p>
        </div>

        <LiveProfileFeed profile={draft} username={user?.username} />
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-3xl border border-ink/5 bg-white p-5 dark:border-white/5 dark:bg-[#12403c]"
          >
            <span
              className={`grid h-11 w-11 place-items-center rounded-2xl ${s.tint} text-white`}
            >
              <s.icon size={20} />
            </span>
            <p className="mt-4 font-display text-2xl font-black text-ink dark:text-white">
              {s.value.toLocaleString()}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <p className="text-sm text-ink/55 dark:text-white/55">{s.label}</p>
              {s.delta > 0 && (
                <span className="rounded-full bg-candy-pink/10 px-1.5 py-0.5 text-[10px] font-bold text-candy-pink dark:bg-candy-pink/20">
                  +{s.delta} today
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* quick actions */}
      <h2 className="mb-3 mt-8 font-display text-lg font-bold text-ink dark:text-white">
        Quick actions
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK.map((q) => (
          <Link
            key={q.label}
            href={q.href}
            className={`group flex items-center gap-3 rounded-2xl p-4 text-white transition hover:-translate-y-1 hover:shadow-card ${q.tint}`}
          >
            <q.icon size={20} className="shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{q.label}</span>
              <span className="block truncate text-xs text-white/75">
                {q.hint}
              </span>
            </span>
            <ArrowRight
              size={16}
              className="shrink-0 transition group-hover:translate-x-1"
            />
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
