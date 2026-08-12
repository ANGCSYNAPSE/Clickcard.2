import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import {
  FileText,
  CreditCard,
  QrCode,
  Download,
  Sparkles,
  Sun,
  Moon,
  Palette,
  ChevronRight,
} from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { useRequireAuth } from "@/lib/authGuards";
import {
  studioService,
  StudioCategory,
  StudioFormat,
  StudioTemplate,
} from "@/services/studioService";

const CATEGORIES: { key: StudioCategory; label: string; icon: typeof FileText; description: string }[] = [
  { key: "resume", label: "Resumes", icon: FileText, description: "Recruiter-ready" },
  { key: "visiting_card", label: "Visiting Cards", icon: CreditCard, description: "Print-perfect" },
  { key: "qr_poster", label: "QR Posters", icon: QrCode, description: "Scan to connect" },
];

const PALETTES = [
  { name: "Brand", primary: "#BE5103", accent: "#069494" },
  { name: "Sunset", primary: "#FF6A3D", accent: "#FFB400" },
  { name: "Ocean", primary: "#0EA5E9", accent: "#22D3EE" },
  { name: "Forest", primary: "#10B981", accent: "#84CC16" },
];

export default function StudioPage() {
  const guard = useRequireAuth();
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.profile.draft);
  const user = useAppSelector((s) => s.auth.user);

  const [category, setCategory] = useState<StudioCategory>("resume");
  const [templates, setTemplates] = useState<StudioTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [primary, setPrimary] = useState(PALETTES[0].primary);
  const [accent, setAccent] = useState(PALETTES[0].accent);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [exporting, setExporting] = useState<StudioFormat | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("palette");
  const [detailView, setDetailView] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    studioService
      .list(category)
      .then((r) => {
        const items = r.data?.data ?? [];
        setTemplates(items);
        if (items.length && !items.find((t) => t.slug === selectedSlug)) {
          setSelectedSlug(items[0].slug);
        }
      })
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const selected = useMemo(
    () => templates.find((t) => t.slug === selectedSlug) || templates[0] || null,
    [templates, selectedSlug],
  );

  const exportFile = async (format: StudioFormat) => {
    if (!selected) return;
    setExporting(format);
    try {
      const res = await studioService.render({
        slug: selected.slug,
        format,
        theme,
        primary,
        accent,
      });
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selected.slug}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      dispatch(pushToast(`${format.toUpperCase()} downloaded`, "success"));
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 503) {
        dispatch(pushToast("Server-side rendering not configured yet.", "info"));
      } else {
        dispatch(pushToast(`${format.toUpperCase()} export failed`, "error"));
      }
    } finally {
      setExporting(null);
    }
  };

  if (!guard) return null;

  return (
    <AppShell>
      <Head>
        <title>Studio · ClickCard</title>
      </Head>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-black text-ink dark:text-white">Studio</h1>
        <p className="text-sm text-ink/55 dark:text-white/55">
          Design your profile with live preview and export options.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_720px] h-[calc(100vh-200px)]">
        {/* preview + gallery */}
        <div className="space-y-5 h-full flex flex-col">
          {/* live preview */}
          <div className="grid place-items-center rounded-3xl border border-ink/5 bg-mist p-6 dark:border-white/5 dark:bg-white/[0.02] flex-1">
            {selected ? (
              <PreviewCard
                primary={primary}
                accent={accent}
                theme={theme}
                name={draft.personal?.fullName || "Your name"}
                username={user?.username}
              />
            ) : (
              <p className="text-sm text-ink/55 dark:text-white/55">
                {loading ? "Loading templates…" : "No templates published yet."}
              </p>
            )}
          </div>

        </div>

        {/* controls */}
        <div className="space-y-0 rounded-3xl border border-ink/5 bg-white dark:border-white/5 dark:bg-[#12403c] h-full overflow-y-auto">
          {/* Design Heading */}
          <div className="border-b border-ink/5 px-5 py-4 dark:border-white/5">
            <h3 className="font-display text-lg font-black text-ink dark:text-white">Design</h3>
          </div>

          {detailView === null && (
            <>
              {/* Palette Option */}
              <button
                onClick={() => setDetailView("palette")}
                className="w-full border-b border-ink/5 px-5 py-4 transition hover:bg-mist dark:border-white/5 dark:hover:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white">
                      <Palette size={16} />
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Palette</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink/60 dark:text-white/60">
                      {PALETTES.find((p) => p.primary === primary && p.accent === accent)?.name || "Custom"}
                    </span>
                    <ChevronRight size={16} className="text-ink/40 dark:text-white/40" />
                  </div>
                </div>
              </button>

          {/* Customize Heading */}
          <div className="border-b border-ink/5 px-5 py-3 dark:border-white/5">
            <p className="text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">Customize</p>
          </div>

              {/* Templates Option */}
              <button
                onClick={() => setDetailView("templates")}
                className="w-full border-b border-ink/5 px-5 py-4 transition hover:bg-mist dark:border-white/5 dark:hover:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-white">
                      <QrCode size={16} />
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Templates</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink/60 dark:text-white/60">
                      {templates.length} {templates.length === 1 ? "template" : "templates"}
                    </span>
                    <ChevronRight size={16} className="text-ink/40 dark:text-white/40" />
                  </div>
                </div>
              </button>

              {/* Theme Option */}
              <button
                onClick={() => setDetailView("theme")}
                className="w-full border-b border-ink/5 px-5 py-4 transition hover:bg-mist dark:border-white/5 dark:hover:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-white">
                      {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Theme</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink/60 dark:text-white/60 capitalize">{theme}</span>
                    <ChevronRight size={16} className="text-ink/40 dark:text-white/40" />
                  </div>
                </div>
              </button>

              {/* Export Option */}
              <button
                onClick={() => setDetailView("export")}
                className="w-full px-5 py-4 transition hover:bg-mist dark:hover:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-white">
                      <Download size={16} />
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Export</p>
                  </div>
                  <ChevronRight size={16} className="text-ink/40 dark:text-white/40" />
                </div>
              </button>
            </>
          )}

          {/* Palette Detail View */}
          {detailView === "palette" && (
            <div className="space-y-4">
              {/* Back Button */}
              <button
                onClick={() => setDetailView(null)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white transition"
              >
                ← Palette
              </button>

              {/* Palette Options */}
              <div className="px-5 py-4 space-y-4">
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                    Select Palette
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {PALETTES.map((p) => {
                      const active = p.primary === primary && p.accent === accent;
                      return (
                        <button
                          key={p.name}
                          onClick={() => {
                            setPrimary(p.primary);
                            setAccent(p.accent);
                          }}
                          className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition ${
                            active
                              ? "border-brand-400 shadow-soft"
                              : "border-ink/10 hover:border-brand-200 dark:border-white/10"
                          }`}
                          title={p.name}
                        >
                          <div
                            className="h-10 w-full rounded-lg"
                            style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.accent})` }}
                          />
                          <span className="text-[10px] font-bold text-ink/60 dark:text-white/60">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Templates Detail View */}
          {detailView === "templates" && (
            <div className="space-y-4">
              {/* Back Button */}
              <button
                onClick={() => setDetailView(null)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white transition"
              >
                ← Templates
              </button>

              {/* Templates List */}
              <div className="px-5 py-4">
                <p className="mb-3 text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                  {templates.length} {templates.length === 1 ? "template available" : "templates available"}
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {templates.map((t) => (
                    <button
                      key={t.slug}
                      onClick={() => setSelectedSlug(t.slug)}
                      className={`rounded-xl border p-2 text-left text-xs transition ${
                        selectedSlug === t.slug
                          ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10"
                          : "border-ink/10 hover:border-brand-200 dark:border-white/10"
                      }`}
                    >
                      <div
                        className="h-14 w-full rounded-lg mb-2"
                        style={{ background: `linear-gradient(135deg, ${t.primary_color}, ${t.accent_color})` }}
                      />
                      <p className="font-bold text-ink dark:text-white text-[10px]">{t.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Theme Detail View */}
          {detailView === "theme" && (
            <div className="space-y-4">
              {/* Back Button */}
              <button
                onClick={() => setDetailView(null)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white transition"
              >
                ← Theme
              </button>

              {/* Theme Options */}
              <div className="px-5 py-4">
                <p className="mb-4 text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                  Select Theme
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center gap-3 rounded-2xl border p-4 transition ${
                      theme === "light"
                        ? "border-brand-400 shadow-soft"
                        : "border-ink/10 hover:border-brand-200 dark:border-white/10"
                    }`}
                  >
                    <Sun size={24} className="text-brand-500" />
                    <span className="text-xs font-bold text-ink dark:text-white">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center gap-3 rounded-2xl border p-4 transition ${
                      theme === "dark"
                        ? "border-brand-400 shadow-soft"
                        : "border-ink/10 hover:border-brand-200 dark:border-white/10"
                    }`}
                  >
                    <Moon size={24} className="text-brand-500" />
                    <span className="text-xs font-bold text-ink dark:text-white">Dark</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Export Detail View */}
          {detailView === "export" && (
            <div className="space-y-4">
              {/* Back Button */}
              <button
                onClick={() => setDetailView(null)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white transition"
              >
                ← Export
              </button>

              {/* Export Options */}
              <div className="px-5 py-4">
                <p className="mb-4 text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                  Export Format
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(["pdf", "png", "svg"] as StudioFormat[]).map((f) => (
                    <button
                      key={f}
                      disabled={!selected || exporting !== null}
                      onClick={() => exportFile(f)}
                      className="inline-flex flex-col items-center gap-2 rounded-xl bg-brand-500 px-3 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-soft transition hover:bg-brand-600 disabled:opacity-60"
                    >
                      <Download size={16} />
                      {exporting === f ? "…" : f}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-ink/45 dark:text-white/45">
                  SVG renders without server Chromium. PDF/PNG require it on the host.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function PreviewCard({
  primary,
  accent,
  theme,
  name,
  username,
}: {
  primary: string;
  accent: string;
  theme: "light" | "dark";
  name: string;
  username?: string | null;
}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#000000" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";

  return (
    <div
      className="relative rounded-3xl shadow-card overflow-hidden flex flex-col items-center justify-between"
      style={{
        width: 320,
        height: 520,
        background: bg,
        color: textColor,
      }}
    >
      {/* Header with icons */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
        <div
          className="grid h-8 w-8 place-items-center rounded-full text-white"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
        >
          ✦
        </div>
        <div className="grid h-8 w-8 place-items-center rounded text-white" style={{ background: textColor }}>
          ↗
        </div>
      </div>

      {/* Gradient background area */}
      <div
        className="w-full h-32"
        style={{
          background: `linear-gradient(135deg, ${primary}, ${accent})`,
        }}
      />

      {/* Profile section */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-8">
        {/* Avatar */}
        <div
          className="grid h-24 w-24 place-items-center rounded-full text-2xl font-black text-white -mt-16 mb-6 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
        >
          {name[0]?.toUpperCase() || "Y"}
        </div>

        {/* Username */}
        <p className="text-xl font-black text-center" style={{ color: textColor }}>
          @{username || "username"}
        </p>

        {/* Name */}
        <p className="text-sm font-semibold text-center mt-2 opacity-75" style={{ color: textColor }}>
          {name}
        </p>
      </div>

      {/* Action Button */}
      <button
        className="mb-6 px-8 py-2.5 rounded-full font-bold text-sm transition hover:opacity-90"
        style={{
          background: textColor,
          color: bg,
        }}
      >
        Join on Linktree
      </button>

      {/* Footer */}
      <div className="pb-4 px-6 text-center text-[10px] opacity-60" style={{ color: textColor }}>
        <p>Report • Privacy</p>
        <p>More from Linktree</p>
      </div>
    </div>
  );
}
