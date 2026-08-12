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

      <div className="mb-4">
        <h1 className="font-display text-2xl font-black text-ink dark:text-white">Studio</h1>
        <p className="text-sm text-ink/55 dark:text-white/55">
          Build resumes, visiting cards & QR posters from admin-published templates with a live preview, then export PDF/PNG/SVG.
        </p>
      </div>

      {/* category tabs */}
      <div className="mb-6 grid gap-2 sm:grid-cols-3">
        {CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-brand-400 bg-brand-50 shadow-soft dark:bg-brand-500/10"
                  : "border-ink/10 bg-white hover:border-brand-200 dark:border-white/10 dark:bg-[#12403c]"
              }`}
            >
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? "bg-brand-500 text-white" : "bg-mist text-brand-500 dark:bg-white/5"}`}>
                <c.icon size={18} />
              </span>
              <div>
                <p className="font-bold text-ink dark:text-white">{c.label}</p>
                <p className="text-xs text-ink/55 dark:text-white/55">{c.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* preview + gallery */}
        <div className="space-y-5">
          {/* live preview */}
          <div className="grid place-items-center rounded-3xl border border-ink/5 bg-mist p-6 dark:border-white/5 dark:bg-white/[0.02]">
            {selected ? (
              <PreviewCard
                template={selected}
                primary={primary}
                accent={accent}
                theme={theme}
                name={draft.personal?.fullName || "Your name"}
                tagline={draft.personal?.tagline || ""}
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
        <div className="space-y-0 rounded-3xl border border-ink/5 bg-white dark:border-white/5 dark:bg-[#12403c]">
          {/* Design Heading */}
          <div className="border-b border-ink/5 px-5 py-4 dark:border-white/5">
            <h3 className="font-display text-lg font-black text-ink dark:text-white">Design</h3>
          </div>

          {/* Palette Option */}
          <button
            onClick={() => setExpandedSection(expandedSection === "palette" ? null : "palette")}
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
                <ChevronRight
                  size={16}
                  className={`transition dark:text-white/40 text-ink/40 ${
                    expandedSection === "palette" ? "rotate-90" : ""
                  }`}
                />
              </div>
            </div>
          </button>

          {/* Palette Options (Expanded) */}
          {expandedSection === "palette" && (
            <div className="border-b border-ink/5 bg-mist px-5 py-4 dark:border-white/5 dark:bg-white/[0.02]">
              <div className="grid grid-cols-4 gap-2">
                {PALETTES.map((p) => {
                  const active = p.primary === primary && p.accent === accent;
                  return (
                    <button
                      key={p.name}
                      onClick={() => {
                        setPrimary(p.primary);
                        setAccent(p.accent);
                      }}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition ${
                        active
                          ? "border-brand-400 shadow-soft"
                          : "border-ink/10 hover:border-brand-200 dark:border-white/10"
                      }`}
                      title={p.name}
                    >
                      <div
                        className="h-6 w-full rounded-lg"
                        style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.accent})` }}
                      />
                      <span className="text-[9px] font-bold text-ink/60 dark:text-white/60">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customize Heading */}
          <div className="border-b border-ink/5 px-5 py-3 dark:border-white/5">
            <p className="text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">Customize</p>
          </div>

          {/* Templates Option */}
          <button
            onClick={() => setExpandedSection(expandedSection === "templates" ? null : "templates")}
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
                <ChevronRight
                  size={16}
                  className={`transition dark:text-white/40 text-ink/40 ${
                    expandedSection === "templates" ? "rotate-90" : ""
                  }`}
                />
              </div>
            </div>
          </button>

          {/* Templates List (Expanded) */}
          {expandedSection === "templates" && (
            <div className="border-b border-ink/5 bg-mist px-5 py-4 dark:border-white/5 dark:bg-white/[0.02]">
              <p className="text-xs text-ink/60 dark:text-white/60 mb-3">
                {templates.length} {templates.length === 1 ? "template available" : "templates available"} for{" "}
                <span className="font-bold capitalize">{category.replace("_", " ")}</span>
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {templates.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => setSelectedSlug(t.slug)}
                    className={`rounded-lg border p-2 text-left text-xs transition ${
                      selectedSlug === t.slug
                        ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10"
                        : "border-ink/10 hover:border-brand-200 dark:border-white/10"
                    }`}
                  >
                    <div
                      className="h-12 w-full rounded-lg mb-1"
                      style={{ background: `linear-gradient(135deg, ${t.primary_color}, ${t.accent_color})` }}
                    />
                    <p className="font-bold text-ink dark:text-white text-[10px]">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Theme Option */}
          <button
            onClick={() => setExpandedSection(expandedSection === "theme" ? null : "theme")}
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
                <ChevronRight
                  size={16}
                  className={`transition dark:text-white/40 text-ink/40 ${
                    expandedSection === "theme" ? "rotate-90" : ""
                  }`}
                />
              </div>
            </div>
          </button>

          {/* Theme Options (Expanded) */}
          {expandedSection === "theme" && (
            <div className="border-b border-ink/5 bg-mist px-5 py-4 dark:border-white/5 dark:bg-white/[0.02]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-bold transition ${
                    theme === "light"
                      ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10"
                      : "border-ink/10 hover:border-brand-200 dark:border-white/10 dark:hover:bg-white/5"
                  }`}
                >
                  <Sun size={14} /> Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-bold transition ${
                    theme === "dark"
                      ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10"
                      : "border-ink/10 hover:border-brand-200 dark:border-white/10 dark:hover:bg-white/5"
                  }`}
                >
                  <Moon size={14} /> Dark
                </button>
              </div>
            </div>
          )}

          {/* Export Option */}
          <button
            onClick={() => setExpandedSection(expandedSection === "export" ? null : "export")}
            className="w-full px-5 py-4 transition hover:bg-mist dark:hover:bg-white/[0.02]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-white">
                  <Download size={16} />
                </span>
                <p className="text-sm font-bold text-ink dark:text-white">Export</p>
              </div>
              <ChevronRight
                size={16}
                className={`transition dark:text-white/40 text-ink/40 ${
                  expandedSection === "export" ? "rotate-90" : ""
                }`}
              />
            </div>
          </button>

          {/* Export Options (Expanded) */}
          {expandedSection === "export" && (
            <div className="bg-mist px-5 py-4 dark:bg-white/[0.02]">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {(["pdf", "png", "svg"] as StudioFormat[]).map((f) => (
                  <button
                    key={f}
                    disabled={!selected || exporting !== null}
                    onClick={() => exportFile(f)}
                    className="inline-flex flex-col items-center gap-1 rounded-lg bg-brand-500 px-2.5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-soft transition hover:bg-brand-600 disabled:opacity-60"
                  >
                    <Download size={14} />
                    {exporting === f ? "…" : f}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-ink/45 dark:text-white/45">
                SVG renders without server Chromium. PDF/PNG require it on the host.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function PreviewCard({
  template,
  primary,
  accent,
  theme,
  name,
  tagline,
  username,
}: {
  template: StudioTemplate;
  primary: string;
  accent: string;
  theme: "light" | "dark";
  name: string;
  tagline: string;
  username?: string | null;
}) {
  const ratio = template.height / template.width;
  const w = 340;
  const h = w * ratio;
  const isDark = theme === "dark";
  const bg = isDark ? "#0b0820" : "#ffffff";
  const fg = isDark ? "#f7f5ff" : "#1a1138";

  return (
    <div
      className="rounded-2xl border border-ink/10 shadow-card dark:border-white/10"
      style={{ width: w, height: h, background: bg, color: fg, overflow: "hidden", position: "relative" }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${primary}, ${accent})`,
          height: template.category === "qr_poster" ? "100%" : "30%",
          color: "#fff",
          padding: 18,
          display: "flex",
          flexDirection: "column",
          justifyContent: template.category === "qr_poster" ? "center" : "flex-start",
          alignItems: template.category === "qr_poster" ? "center" : "flex-start",
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 900, opacity: 0.9 }}>
          {template.name}
        </div>
        <div style={{ fontSize: template.category === "qr_poster" ? 26 : 20, fontWeight: 900, marginTop: 6, textAlign: template.category === "qr_poster" ? "center" : "left" }}>
          {name}
        </div>
        {tagline && (
          <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>{tagline}</div>
        )}
        {template.category === "qr_poster" && (
          <div style={{ marginTop: 16, background: "#fff", borderRadius: 12, padding: 8 }}>
            <div style={{ width: 110, height: 110, background: "#0a0a0a", borderRadius: 4 }} />
          </div>
        )}
      </div>
      {template.category !== "qr_poster" && (
        <div style={{ padding: 16, fontSize: 11 }}>
          <p style={{ color: primary, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            About
          </p>
          <p style={{ marginTop: 6, opacity: 0.75 }}>
            Live preview of your {template.category.replace("_", " ")} — the exported file uses the full server-rendered template.
          </p>
          <p style={{ marginTop: 14, fontSize: 10, opacity: 0.5 }}>
            clickcard.app/{username || "you"}
          </p>
        </div>
      )}
    </div>
  );
}
