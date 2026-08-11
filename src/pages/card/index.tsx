import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import {
  Download,
  Share2,
  Palette as PaletteIcon,
  Sun,
  Moon,
  Save,
  Check,
  Sparkles,
  CreditCard,
  Smartphone,
  Eye,
  Loader2,
} from "lucide-react";
import AppShell from "@/components/app/AppShell";
import CardPreview from "@/components/app/CardPreview";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile, saveProfile } from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { useRequireAuth } from "@/lib/authGuards";
import { SITE_URL } from "@/lib/config";
import {
  profileService,
  CardTemplate,
  CardRenderInput,
} from "@/services/profileService";

/**
 * Template ids are contract with the backend renderer (CardTemplateService.js) —
 * only the display copy below is ours to change.
 */
const FALLBACK_TEMPLATES: CardTemplate[] = [
  { id: "gradient-classic", name: "Classic Retro", description: "Bold 4-colour header with retro vibes." },
  { id: "minimal-mono", name: "Minimal Mono", description: "Simple & clean monochrome style." },
  { id: "split-modern", name: "Split Layout", description: "Two-column information layout." },
  { id: "neon-dark", name: "Neon Edge", description: "Dark background with neon accents." },
  { id: "corporate-premium", name: "Corporate Gold", description: "Premium look with gold highlights." },
  { id: "playful-rounded", name: "Playful Rounded", description: "Soft shapes & friendly look." },
];

/** `swatch` drives the preview stripes; 4 stops render as blocks, 2 as a gradient. */
const PALETTES: {
  name: string;
  primary: string;
  accent: string;
  swatch: string[];
}[] = [
  { name: "Retro Sunset", primary: "#BE5103", accent: "#069494", swatch: ["#BE5103", "#FFCE1B", "#069494", "#B7410E"] },
  { name: "Sunset Glow", primary: "#FF6A3D", accent: "#FFB400", swatch: ["#FF6A3D", "#FFB400"] },
  { name: "Ocean Breeze", primary: "#0EA5E9", accent: "#22D3EE", swatch: ["#0EA5E9", "#22D3EE"] },
  { name: "Forest Calm", primary: "#10B981", accent: "#84CC16", swatch: ["#10B981", "#84CC16"] },
  { name: "Royal Indigo", primary: "#1E40AF", accent: "#A855F7", swatch: ["#1E40AF", "#A855F7"] },
  { name: "Midnight Fade", primary: "#1F2937", accent: "#F472B6", swatch: ["#1F2937", "#F472B6"] },
];

type ViewMode = "card" | "mobile" | "preview";

const VIEW_MODES: { id: ViewMode; label: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "preview", label: "Preview", icon: Eye },
];

export default function CardPage() {
  const guard = useRequireAuth();
  const dispatch = useAppDispatch();
  // Separate selectors — a single selector returning an object literal creates a
  // new reference every call, which react-redux v9 flags and re-renders on.
  const draft = useAppSelector((s) => s.profile.draft);
  const profileUser = useAppSelector((s) => s.auth.user);
  const saving = useAppSelector((s) => s.profile.saving);

  const [templates, setTemplates] = useState<CardTemplate[]>(FALLBACK_TEMPLATES);
  const [templateId, setTemplateId] = useState<string>(
    draft.digitalCard?.templateId || "gradient-classic",
  );
  const [primary, setPrimary] = useState<string>(
    draft.digitalCard?.primaryColor || PALETTES[0].primary,
  );
  const [accent, setAccent] = useState<string>(
    draft.digitalCard?.accentColor || PALETTES[0].accent,
  );
  const [theme, setTheme] = useState<"light" | "dark">(
    (draft.digitalCard?.theme as "light" | "dark") || "light",
  );
  const [downloading, setDownloading] = useState(false);
  const [view, setView] = useState<ViewMode>("card");

  useEffect(() => {
    dispatch(fetchProfile());
    profileService
      .listCardTemplates()
      .then((r) => {
        if (r.data?.data?.templates?.length) setTemplates(r.data.data.templates);
      })
      .catch(() => {
        /* keep fallback list */
      });
  }, [dispatch]);

  // Sync editor controls with whatever profile finishes loading
  useEffect(() => {
    if (draft.digitalCard?.templateId) setTemplateId(draft.digitalCard.templateId);
    if (draft.digitalCard?.primaryColor) setPrimary(draft.digitalCard.primaryColor);
    if (draft.digitalCard?.accentColor) setAccent(draft.digitalCard.accentColor);
    if (draft.digitalCard?.theme) setTheme(draft.digitalCard.theme as "light" | "dark");
  }, [draft.digitalCard]);

  const renderInput: CardRenderInput = useMemo(
    () => ({ templateId, primary, accent, theme }),
    [templateId, primary, accent, theme],
  );

  /** Stripes follow the picked palette; custom colours fall back to primary/accent. */
  const stripes = useMemo(() => {
    const hit = PALETTES.find((p) => p.primary === primary && p.accent === accent);
    return hit?.swatch ?? [primary, accent, primary, accent];
  }, [primary, accent]);

  const onSave = async () => {
    const next = {
      ...draft,
      digitalCard: {
        templateId,
        primaryColor: primary,
        accentColor: accent,
        theme,
      },
    };
    const res = await dispatch(saveProfile({ profile: next }));
    if (saveProfile.fulfilled.match(res)) {
      dispatch(pushToast("Card design saved", "success"));
    } else {
      dispatch(pushToast("Save failed", "error"));
    }
  };

  const onDownload = async () => {
    setDownloading(true);
    try {
      const res = await profileService.downloadCardPdf(renderInput);
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `card-${templateId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      dispatch(pushToast("PDF downloaded", "success"));
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 503) {
        dispatch(pushToast("Server PDF rendering not configured yet — coming online soon.", "info"));
      } else {
        dispatch(pushToast("PDF download failed", "error"));
      }
    } finally {
      setDownloading(false);
    }
  };

  const publicUrl =
    typeof window !== "undefined"
      ? `${SITE_URL}/${profileUser?.username || ""}`
      : "";

  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "My ClickCard", url: publicUrl });
        dispatch(pushToast("Shared", "success"));
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(publicUrl);
      dispatch(pushToast("Link copied", "success"));
    } catch {
      dispatch(pushToast(publicUrl, "info"));
    }
  };

  if (!guard) return null;

  const card = (
    <CardPreview
      templateId={templateId}
      primary={primary}
      accent={accent}
      stripes={stripes}
      theme={theme}
      profile={draft}
      username={profileUser?.username}
    />
  );

  return (
    <AppShell fullHeight>
      <Head>
        <title>Digital Card · ClickCard</title>
      </Head>

      {/* ── header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 lg:shrink-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-black text-ink dark:text-white">
            Digital Card
          </h1>
          <p className="text-sm text-ink/55 dark:text-white/55">
            Pick a template, customise colours, then share or download as PDF.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onShare}
            className="inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-brand-300 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <Share2 size={16} /> Share
          </button>
          <button
            onClick={onDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {downloading ? "Rendering…" : "Download PDF"}
          </button>
        </div>
      </div>

      {/* ── body ───────────────────────────────────────────── */}
      <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
        {/* stage */}
        <section className="flex flex-col rounded-3xl border border-ink/[0.06] bg-mist p-4 dark:border-white/[0.06] dark:bg-white/[0.02] lg:min-h-0">
          <div className="flex min-h-[420px] flex-1 items-center justify-center py-2 lg:min-h-0 lg:overflow-y-auto">
            {view === "card" && <div className="w-full max-w-[340px]">{card}</div>}

            {view === "mobile" && (
              <div className="w-full max-w-[300px] rounded-[2.2rem] bg-ink p-2.5 shadow-float">
                <div className="overflow-hidden rounded-[1.8rem] bg-white dark:bg-[#12403c]">
                  <div className="flex items-center justify-between px-4 pb-1.5 pt-2 text-[10px] font-bold text-ink/70 dark:text-white/70">
                    <span>9:41</span>
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 dark:bg-white/10">
                      LIVE
                    </span>
                  </div>
                  <div className="p-3">{card}</div>
                </div>
              </div>
            )}

            {view === "preview" && (
              <div className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-card dark:bg-[#12403c]">
                <div className="flex items-center gap-2 border-b border-ink/[0.06] px-3 py-2 dark:border-white/[0.06]">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-candy-yellow" />
                  <span className="h-2.5 w-2.5 rounded-full bg-candy-pink" />
                  <span className="ml-2 truncate rounded-md bg-mist px-2 py-1 text-[10px] font-semibold text-ink/50 dark:bg-white/5 dark:text-white/50">
                    {publicUrl || "clickcard.app"}
                  </span>
                </div>
                <div className="p-4">{card}</div>
              </div>
            )}
          </div>

          {/* view switcher */}
          <div className="mt-3 flex justify-center lg:shrink-0">
            <div className="inline-flex items-center gap-1 rounded-xl bg-white p-1 dark:bg-white/5">
              {VIEW_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setView(m.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    view === m.id
                      ? "bg-brand-50 text-brand-600 dark:bg-white/10 dark:text-white"
                      : "text-ink/50 hover:text-brand-600 dark:text-white/50"
                  }`}
                >
                  <m.icon size={14} /> {m.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* control rail */}
        <aside className="flex flex-col gap-3">
          <div className="space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-0.5">
            {/* templates */}
            <Panel icon={Sparkles} label="Template">
              <div className="grid grid-cols-2 gap-2">
                {templates.map((t) => {
                  const active = templateId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplateId(t.id)}
                      className={`relative rounded-xl border p-2.5 text-left transition ${
                        active
                          ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10"
                          : "border-ink/10 hover:border-brand-200 hover:bg-brand-50/50 dark:border-white/10 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      {active && (
                        <Check
                          size={13}
                          className="absolute right-2 top-2 text-brand-500"
                        />
                      )}
                      <p className="pr-4 text-[11px] font-bold leading-tight text-ink dark:text-white">
                        {t.name}
                      </p>
                      <p className="mt-1 text-[10px] leading-snug text-ink/50 dark:text-white/50">
                        {t.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Panel>

            {/* palette */}
            <Panel icon={PaletteIcon} label="Palette">
              <div className="grid grid-cols-3 gap-2">
                {PALETTES.map((p) => {
                  const active = p.primary === primary && p.accent === accent;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setPrimary(p.primary);
                        setAccent(p.accent);
                      }}
                      className={`rounded-xl border p-1.5 transition ${
                        active
                          ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10"
                          : "border-ink/10 hover:border-brand-200 dark:border-white/10"
                      }`}
                    >
                      <Swatch colors={p.swatch} />
                      <span className="mt-1 block truncate text-[9px] font-bold text-ink/70 dark:text-white/70">
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <ColorChip label="Primary" value={primary} onChange={setPrimary} />
                <ColorChip label="Accent" value={accent} onChange={setAccent} />
              </div>
            </Panel>

            {/* theme */}
            <Panel label="Theme">
              <div className="grid grid-cols-2 gap-2">
                {(["light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold capitalize transition ${
                      theme === t
                        ? "border-brand-400 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-white"
                        : "border-ink/10 text-ink/60 hover:border-brand-200 dark:border-white/10 dark:text-white/60"
                    }`}
                  >
                    {t === "light" ? <Sun size={14} /> : <Moon size={14} />} {t}
                  </button>
                ))}
              </div>
            </Panel>
          </div>

          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60 lg:shrink-0"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving…" : "Save card design"}
          </button>
        </aside>
      </div>
    </AppShell>
  );
}

function Panel({
  icon: Icon,
  label,
  children,
}: {
  icon?: typeof Sparkles;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink/[0.06] bg-white p-3 dark:border-white/[0.06] dark:bg-[#12403c]">
      <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-ink/50 dark:text-white/50">
        {Icon && <Icon size={12} className="text-brand-500" />}
        {label}
      </h3>
      {children}
    </section>
  );
}

/** 4-stop palettes render as hard blocks, 2-stop ones as a gradient. */
function Swatch({ colors }: { colors: string[] }) {
  if (colors.length >= 3) {
    return (
      <span className="flex h-7 w-full overflow-hidden rounded-md">
        {colors.map((c) => (
          <span key={c} className="flex-1" style={{ background: c }} />
        ))}
      </span>
    );
  }
  return (
    <span
      className="block h-7 w-full rounded-md"
      style={{ background: `linear-gradient(90deg, ${colors.join(", ")})` }}
    />
  );
}

function ColorChip({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="relative flex cursor-pointer items-center gap-2 rounded-xl border border-ink/10 px-2 py-1.5 transition hover:border-brand-200 dark:border-white/10">
      <span
        className="h-6 w-6 shrink-0 rounded-full ring-1 ring-ink/10"
        style={{ background: value }}
      />
      <span className="min-w-0">
        <span className="block text-[9px] font-black uppercase tracking-wider text-ink/45 dark:text-white/45">
          {label}
        </span>
        <span className="block truncate text-[10px] font-bold uppercase text-ink/70 dark:text-white/70">
          {value}
        </span>
      </span>
      {/* Transparent overlay rather than sr-only: the native colour popover
          anchors to the input's box, which a clipped 1px element misplaces. */}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label={`${label} colour`}
      />
    </label>
  );
}
