import { useEffect, useMemo } from "react";
import Head from "next/head";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Eye, Users, Share2, MousePointerClick, BarChart3 } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchShareTotals, fetchShareLinks } from "@/store/slices/shareSlice";

export default function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const { totals, links } = useAppSelector((s) => s.share);

  useEffect(() => {
    dispatch(fetchShareTotals());
    dispatch(fetchShareLinks());
  }, [dispatch]);

  // Use real byDate if present, otherwise a graceful 14-day zero series.
  const series = useMemo(() => {
    if (totals?.byDate?.length) return totals.byDate;
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return { date: d.toISOString().slice(5, 10), visits: 0 };
    });
  }, [totals]);

  const stats = [
    { label: "Total visits", value: totals?.totalVisits ?? 0, icon: Eye, tint: "bg-brand-500" },
    { label: "Unique visitors", value: totals?.uniqueVisitors ?? 0, icon: Users, tint: "bg-candy-yellow" },
    { label: "Active links", value: links.length, icon: Share2, tint: "bg-candy-pink" },
    { label: "Link taps", value: links.reduce((a, l) => a + (l.visits ?? 0), 0), icon: MousePointerClick, tint: "bg-candy-pink/55" },
  ];

  return (
    <AppShell title="Analytics">
      <Head>
        <title>Analytics · ClickCard</title>
      </Head>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-ink/[0.06] bg-white p-5 dark:border-white/[0.06] dark:bg-[#12403c]">
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

      {/* trend chart */}
      <div className="mt-6 rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#12403c]">
        <h2 className="font-display text-lg font-bold text-ink dark:text-white">
          Visits over time
        </h2>
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="visits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#069494" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#069494" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,148,148,0.08)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 40px -12px rgba(6,148,148,0.35)", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="visits" stroke="#069494" strokeWidth={2.5} fill="url(#visits)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* per-link breakdown */}
      <div className="mt-6 rounded-3xl border border-ink/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-[#12403c]">
        <h2 className="font-display text-lg font-bold text-ink dark:text-white">
          Top links
        </h2>
        {links.length === 0 ? (
          <div className="mt-4 grid place-items-center py-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-white/5">
              <BarChart3 size={26} />
            </span>
            <p className="mt-3 text-sm text-ink/55 dark:text-white/55">
              Create a share link to start collecting analytics.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {[...links]
              .sort((a, b) => (b.visits ?? 0) - (a.visits ?? 0))
              .map((l) => {
                const max = Math.max(1, ...links.map((x) => x.visits ?? 0));
                return (
                  <div key={l.id} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 truncate text-sm font-semibold text-ink/70 dark:text-white/70">
                      {l.custom_slug || l.short_code || `link #${l.id}`}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/5 dark:bg-white/5">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${((l.visits ?? 0) / max) * 100}%` }} />
                    </div>
                    <span className="w-10 text-right text-sm font-bold text-ink dark:text-white">
                      {l.visits ?? 0}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
