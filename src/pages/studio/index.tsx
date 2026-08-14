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
  ChevronDown,
  Type,
  Image as ImageIcon,
  Video,
  Zap,
  ArrowUp,
  ArrowDown,
  Target,
  Save,
} from "lucide-react";
import AppShell from "@/components/app/AppShell";
import Button from "@/components/ui/Button";
import LiveProfileCard from "@/components/app/LiveProfileCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { updateDesign, designSaved, STUDIO_DESIGN_KEY } from "@/store/slices/designSlice";
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

const FONT_OPTIONS = ["Inter", "Poppins", "Roboto", "Playfair Display", "Space Grotesk", "DM Sans"];

const GOOGLE_FONTS_HREF = `https://fonts.googleapis.com/css2?${FONT_OPTIONS.map(
  (f) => `family=${f.replace(/ /g, "+")}:wght@400;600;700;800;900`,
).join("&")}&display=swap`;

export default function StudioPage() {
  const guard = useRequireAuth();
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.profile.draft);
  const user = useAppSelector((s) => s.auth.user);
  const design = useAppSelector((s) => s.design);
  const {
    primary,
    accent,
    theme,
    wallpaperType,
    backgroundColor,
    gradientColor,
    gradientDirection,
    noise,
    patternIndex,
    pageFont,
    pageTextColor,
    matchTitleFont,
    titleFont,
    titleColor,
    dirty,
  } = design;
  const set = (patch: Partial<typeof design>) => dispatch(updateDesign(patch));

  const [category, setCategory] = useState<StudioCategory>("resume");
  const [templates, setTemplates] = useState<StudioTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [exporting, setExporting] = useState<StudioFormat | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("palette");
  const [detailView, setDetailView] = useState<string | null>(null);
  const [gradientStyle, setGradientStyle] = useState<"custom" | "premade">("custom");

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const saveDesign = () => {
    try {
      localStorage.setItem(STUDIO_DESIGN_KEY, JSON.stringify(design));
    } catch {
      /* ignore blocked storage */
    }
    dispatch(designSaved());
    dispatch(pushToast("Design saved", "success"));
  };

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={GOOGLE_FONTS_HREF} rel="stylesheet" />
      </Head>

      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-black text-ink dark:text-white">Studio</h1>
        {dirty && (
          <Button onClick={saveDesign} className="text-xs sm:text-sm">
            <Save size={16} /> Save changes
          </Button>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_720px] h-[calc(100vh-200px)]">
        {/* preview + gallery */}
        <div className="space-y-5 h-full flex flex-col">
          {/* live preview */}
          <div className="grid place-items-center rounded-3xl border border-ink/5 bg-mist p-6 dark:border-white/5 dark:bg-white/[0.02] flex-1">
            <LiveProfileCard
              primary={primary}
              accent={accent}
              theme={theme}
              name={draft.personal?.fullName || "Your name"}
              username={user?.username}
              avatarUrl={draft.personal?.profilePicture}
              tagline={draft.personal?.tagline}
              bio={draft.personal?.bio}
              socialLinks={(draft.social || []).filter((s) => s.url)}
              contact={draft.contact}
              experience={draft.experience}
              education={draft.education}
              products={draft.products}
              business={draft.business}
              wallpaperType={wallpaperType}
              backgroundColor={backgroundColor}
              gradientColor={gradientColor}
              gradientDirection={gradientDirection}
              noise={noise}
              patternIndex={patternIndex}
              pageFont={pageFont}
              pageTextColor={pageTextColor}
              matchTitleFont={matchTitleFont}
              titleFont={titleFont}
              titleColor={titleColor}
            />
            {!selected && (
              <p className="mt-3 text-xs text-ink/45 dark:text-white/45">
                {loading ? "Loading templates…" : "No export templates published yet."}
              </p>
            )}
          </div>

        </div>

        {/* controls */}
        <div className="rounded-3xl border border-ink/5 bg-mist dark:border-white/5 dark:bg-[#12403c] h-full overflow-y-auto">
          {/* Design Heading */}
          <div className="px-5 py-4">
            <h3 className="font-display text-lg font-black text-ink dark:text-white">Design</h3>
          </div>

          {detailView === null && (
            <div className="px-4 pb-4 space-y-3">
               {/* Templates Option */}
              <button
                onClick={() => setDetailView("templates")}
                className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04]"
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

              {/* Customize Heading */}
              <p className="px-1 pt-2 text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                Customize
              </p>

              {/* Palette Option */}
              <button
                onClick={() => setDetailView("palette")}
                className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04]"
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

              {/* Theme Option */}
              <button
                onClick={() => setDetailView("theme")}
                className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04]"
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

              {/* Text Option */}
              <button
                onClick={() => setDetailView("text")}
                className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-white">
                      <Type size={16} />
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Text</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink/60 dark:text-white/60">{pageFont}</span>
                    <ChevronRight size={16} className="text-ink/40 dark:text-white/40" />
                  </div>
                </div>
              </button>

              {/* Export Option */}
              <button
                onClick={() => setDetailView("export")}
                className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04]"
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
            </div>
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
                {/* Wallpaper Type */}
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                    Palette
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { key: "fill", label: "Fill" },
                        { key: "gradient", label: "Gradient" },
                        { key: "blur", label: "Blur" },
                        { key: "pattern", label: "Pattern" },
                        { key: "image", label: "Image", locked: true },
                        { key: "video", label: "Video", locked: true },
                      ] as { key: typeof wallpaperType; label: string; locked?: boolean }[]
                    ).map((w) => {
                      const active = wallpaperType === w.key;
                      return (
                        <button
                          key={w.key}
                          onClick={() => set({ wallpaperType: w.key })}
                          className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-2 transition ${
                            active
                              ? "border-ink dark:border-white"
                              : "border-transparent"
                          }`}
                        >
                          <span
                            className="relative grid h-14 w-full place-items-center rounded-xl"
                            style={{
                              background:
                                w.key === "fill"
                                  ? backgroundColor
                                  : w.key === "gradient"
                                  ? `linear-gradient(135deg, ${primary}, ${accent})`
                                  : w.key === "blur"
                                  ? `linear-gradient(135deg, ${backgroundColor}, ${primary})`
                                  : w.key === "pattern"
                                  ? `repeating-linear-gradient(45deg, ${backgroundColor}, ${backgroundColor} 4px, ${primary} 4px, ${primary} 8px)`
                                  : undefined,
                            }}
                          >
                            {w.key === "blur" && (
                              <span
                                className="absolute inset-0 rounded-xl backdrop-blur-sm"
                                style={{ background: `${backgroundColor}66` }}
                              />
                            )}
                            {w.key === "image" && (
                              <span className="grid h-full w-full place-items-center rounded-xl bg-ink/5 dark:bg-white/10">
                                <ImageIcon size={18} className="text-ink/40 dark:text-white/40" />
                              </span>
                            )}
                            {w.key === "video" && (
                              <span className="grid h-full w-full place-items-center rounded-xl bg-ink/5 dark:bg-white/10">
                                <Video size={18} className="text-ink/40 dark:text-white/40" />
                              </span>
                            )}
                            {w.locked && (
                              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/70 text-white dark:bg-white/30">
                                <Zap size={10} />
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] font-semibold text-ink/70 dark:text-white/70">
                            {w.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Background color */}
                {wallpaperType !== "gradient" && (
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-ink dark:text-white">Background color</p>
                    <label className="flex w-40 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                      <span
                        className="h-6 w-6 shrink-0 rounded-md border border-ink/10"
                        style={{ background: backgroundColor }}
                      />
                      <span className="text-sm font-medium uppercase text-ink dark:text-white">{backgroundColor}</span>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => set({ backgroundColor: e.target.value })}
                        className="sr-only"
                      />
                    </label>
                  </div>
                )}

                {/* Gradient controls */}
                {wallpaperType === "gradient" && (
                  <>
                    {/* Gradient style */}
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-ink dark:text-white">Gradient style</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setGradientStyle("custom")}
                          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                            gradientStyle === "custom"
                              ? "border-ink text-ink dark:border-white dark:text-white"
                              : "border-ink/10 text-ink/40 dark:border-white/10 dark:text-white/40"
                          }`}
                        >
                          Custom
                        </button>
                        <button
                          disabled
                          className="flex items-center gap-1.5 rounded-xl border border-ink/10 px-4 py-2 text-sm font-semibold text-ink/40 dark:border-white/10 dark:text-white/40"
                        >
                          Pre-made
                          <span className="grid h-4 w-4 place-items-center rounded-full bg-ink/50 text-white dark:bg-white/30">
                            <Zap size={9} />
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Gradient color */}
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-ink dark:text-white">Gradient color</p>
                      <label className="flex w-40 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                        <span
                          className="h-6 w-6 shrink-0 rounded-md border border-ink/10"
                          style={{ background: gradientColor }}
                        />
                        <span className="text-sm font-medium uppercase text-ink dark:text-white">{gradientColor}</span>
                        <input
                          type="color"
                          value={gradientColor}
                          onChange={(e) => set({ gradientColor: e.target.value })}
                          className="sr-only"
                        />
                      </label>
                    </div>

                    {/* Gradient direction */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-ink dark:text-white">Gradient direction</p>
                        <p className="text-xs text-ink/50 dark:text-white/50">How the colors transition</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => set({ gradientDirection: "up" })}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                            gradientDirection === "up"
                              ? "border-ink text-ink dark:border-white dark:text-white"
                              : "border-ink/10 text-ink/40 dark:border-white/10 dark:text-white/40"
                          }`}
                        >
                          <ArrowUp size={16} />
                          Linear up
                        </button>
                        <button
                          onClick={() => set({ gradientDirection: "down" })}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                            gradientDirection === "down"
                              ? "border-ink text-ink dark:border-white dark:text-white"
                              : "border-ink/10 text-ink/40 dark:border-white/10 dark:text-white/40"
                          }`}
                        >
                          <ArrowDown size={16} />
                          Linear down
                        </button>
                        <button
                          disabled
                          className="relative flex flex-col items-center gap-1.5 rounded-xl border border-ink/10 px-3 py-2.5 text-xs font-semibold text-ink/40 dark:border-white/10 dark:text-white/40"
                        >
                          <Target size={16} />
                          Radial
                          <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-ink/50 text-white dark:bg-white/30">
                            <Zap size={9} />
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Noise */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-ink dark:text-white">Noise</p>
                        <p className="text-xs text-ink/50 dark:text-white/50">Add a subtle grain texture</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={noise}
                        onClick={() => set({ noise: !noise })}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                          noise ? "bg-emerald-500" : "bg-ink/15 dark:bg-white/15"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                            noise ? "left-5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </>
                )}

                {/* Pattern swatches */}
                {wallpaperType === "pattern" && (
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-ink dark:text-white">Pattern</p>
                    <div className="flex items-center gap-2">
                      {[
                        `repeating-linear-gradient(45deg, ${backgroundColor}, ${backgroundColor} 3px, #ffffff33 3px, #ffffff33 6px)`,
                        `linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)`,
                        `radial-gradient(#ffffff33 1.5px, transparent 1.5px)`,
                        `linear-gradient(135deg, ${primary}, ${accent})`,
                      ].map((bg, i) => (
                        <button
                          key={i}
                          onClick={() => set({ patternIndex: i })}
                          className={`relative grid h-10 w-10 place-items-center rounded-xl border-2 bg-ink/10 dark:bg-white/10 ${
                            patternIndex === i ? "border-ink dark:border-white" : "border-transparent"
                          }`}
                          style={{ backgroundImage: bg, backgroundSize: i === 1 ? "6px 6px" : undefined }}
                        >
                          {i === 3 && <Zap size={12} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                    onClick={() => set({ theme: "light" })}
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
                    onClick={() => set({ theme: "dark" })}
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

          {/* Text Detail View */}
          {detailView === "text" && (
            <div className="space-y-1">
              {/* Back Button */}
              <button
                onClick={() => setDetailView(null)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-ink dark:text-white transition"
              >
                ← Text
              </button>

              <div className="px-5 py-2 space-y-5">
                {/* Page font */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">Page font</p>
                  <div className="relative">
                    <select
                      value={pageFont}
                      onChange={(e) => set({ pageFont: e.target.value })}
                      style={{ fontFamily: `"${pageFont}", sans-serif` }}
                      className="w-40 appearance-none rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-medium text-ink dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f} value={f} style={{ fontFamily: `"${f}", sans-serif` }}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-white/40"
                    />
                  </div>
                </div>

                {/* Page text color */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">Page text color</p>
                  <label className="flex w-40 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                    <span
                      className="h-6 w-6 shrink-0 rounded-md border border-ink/10"
                      style={{ background: pageTextColor }}
                    />
                    <span className="text-sm font-medium uppercase text-ink dark:text-white">{pageTextColor}</span>
                    <input
                      type="color"
                      value={pageTextColor}
                      onChange={(e) => set({ pageTextColor: e.target.value })}
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* Alternative title font */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">Alternative title font</p>
                    <p className="text-xs text-ink/50 dark:text-white/50">Matches page font by default</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-ink/60 text-white dark:bg-white/20">
                      <Sparkles size={12} />
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={matchTitleFont}
                      onClick={() => set({ matchTitleFont: !matchTitleFont })}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        matchTitleFont ? "bg-emerald-500" : "bg-ink/15 dark:bg-white/15"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                          matchTitleFont ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Title font */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">Title font</p>
                  <div className="relative">
                    <select
                      value={titleFont}
                      disabled={matchTitleFont}
                      onChange={(e) => set({ titleFont: e.target.value })}
                      style={{ fontFamily: `"${titleFont}", sans-serif` }}
                      className="w-40 appearance-none rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-medium text-ink disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f} value={f} style={{ fontFamily: `"${f}", sans-serif` }}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-white/40"
                    />
                  </div>
                </div>

                {/* Title color */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">Title color</p>
                  <label className="flex w-40 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                    <span
                      className="h-6 w-6 shrink-0 rounded-md border border-ink/10"
                      style={{ background: titleColor }}
                    />
                    <span className="text-sm font-medium uppercase text-ink dark:text-white">{titleColor}</span>
                    <input
                      type="color"
                      value={titleColor}
                      onChange={(e) => set({ titleColor: e.target.value })}
                      className="sr-only"
                    />
                  </label>
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
