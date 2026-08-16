import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import {
  FileText,
  CreditCard,
  QrCode,
  Download,
  Sparkles,
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
  PanelTop,
  CaseSensitive,
  Camera,
  User as UserIcon,
  Plus,
  Minus,
  X,
} from "lucide-react";
import AppShell from "@/components/app/AppShell";
import Button from "@/components/ui/Button";
import LiveProfileCard from "@/components/app/LiveProfileCard";
import ImageCropModal from "@/components/app/ImageCropModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile, saveProfile, updateSection } from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/uiSlice";
import {
  updateDesign,
  designSaved,
  STUDIO_DESIGN_KEY,
  HeaderLayout,
  ButtonStyle as ButtonStyleT,
  ButtonRoundness as ButtonRoundnessT,
  ButtonShadow as ButtonShadowT,
} from "@/store/slices/designSlice";
import { useRequireAuth } from "@/lib/authGuards";
import { STYLE_PRESETS, type StylePreset } from "@/lib/stylePresets";
import { FONT_ITEMS, loadGoogleFont } from "@/lib/fonts";
import { getContrastText } from "@/lib/color";
import {
  studioService,
  StudioCategory,
  StudioFormat,
  StudioTemplate,
} from "@/services/studioService";

const PALETTES = [
  { name: "Brand", primary: "#BE5103", accent: "#069494" },
  { name: "Sunset", primary: "#FF6A3D", accent: "#FFB400" },
  { name: "Ocean", primary: "#0EA5E9", accent: "#22D3EE" },
  { name: "Forest", primary: "#10B981", accent: "#84CC16" },
];


const HEADER_LAYOUTS: { key: HeaderLayout; label: string }[] = [
  { key: "classic", label: "Classic" },
  { key: "hero", label: "Hero" },
  { key: "banner", label: "Banner" },
  { key: "cutout", label: "Cutout" },
  { key: "shape", label: "Shape" },
];

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 72;

/** A Word-style font-size box: type a point size directly, or nudge it with +/-. */
function FontSizeInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const clamp = (v: number) => Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, v));
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Decrease size"
        onClick={() => onChange(clamp(value - 1))}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ink/10 text-ink/60 transition hover:bg-ink/5 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10"
      >
        <Minus size={13} />
      </button>
      <input
        type="number"
        min={MIN_FONT_SIZE}
        max={MAX_FONT_SIZE}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        className="h-8 w-14 rounded-lg border border-ink/10 bg-white text-center text-sm font-bold text-ink outline-none transition focus:border-brand-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
      />
      <button
        type="button"
        aria-label="Increase size"
        onClick={() => onChange(clamp(value + 1))}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ink/10 text-ink/60 transition hover:bg-ink/5 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

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
    backgroundImageUrl,
    backgroundColor,
    gradientColor,
    gradientColorEnd,
    gradientDirection,
    noise,
    patternIndex,
    buttonColor,
    buttonTextColor,
    buttonStyle,
    buttonRoundness,
    buttonShadow,
    socialLinksStyle,
    pageFont,
    pageTextColor,
    matchTitleFont,
    titleFont,
    titleColor,
    headerLayout,
    titleStyle,
    titleFontSize,
    bioFontSize,
    bodyFontSize,
    dirty,
  } = design;
  const set = (patch: Partial<typeof design>) => dispatch(updateDesign(patch));
  const profileDirty = useAppSelector((s) => s.profile.dirty);
  const savingProfile = useAppSelector((s) => s.profile.saving);

  const [category, setCategory] = useState<StudioCategory>("resume");
  const [templates, setTemplates] = useState<StudioTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [exporting, setExporting] = useState<StudioFormat | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("palette");
  const [detailView, setDetailView] = useState<string | null>(null);
  const [gradientStyle, setGradientStyle] = useState<"custom" | "premade">("custom");
  const [picture, setPicture] = useState<File | null>(null);
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const [cutoutAvatarUrl, setCutoutAvatarUrl] = useState<string | null>(null);
  const [removingBg, setRemovingBg] = useState(false);
  const cutoutProcessedFor = useRef<string | null>(null);

  const [fontPickerTarget, setFontPickerTarget] = useState<"page" | "title" | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const applyPreset = (preset: StylePreset) => {
    set(preset.values);
    setActivePreset(preset.key);
  };

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Preload every preset's title font so the "Aa" swatch previews render
  // correctly the first time the Templates panel opens.
  useEffect(() => {
    STYLE_PRESETS.forEach((p) => p.values.titleFont && loadGoogleFont(p.values.titleFont));
  }, []);

  const onPickPicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setCropSource(URL.createObjectURL(f));
  };

  const onCropConfirm = (file: File) => {
    setPicture(file);
    setPictureUrl(URL.createObjectURL(file));
    setCropSource(null);
  };

  const onPickBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBannerImageUrl(URL.createObjectURL(f));
  };

  const previewAvatar = pictureUrl || draft.personal?.profilePicture;

  // Cutout layout: automatically cut the subject out of the photo (client-side,
  // in-browser ML — the photo never leaves the device) so it reads as a sticker
  // over the wallpaper instead of a photo with a background.
  useEffect(() => {
    if (headerLayout !== "cutout" || !previewAvatar) return;
    if (cutoutProcessedFor.current === previewAvatar) return;
    let cancelled = false;
    setRemovingBg(true);
    import("@imgly/background-removal")
      .then(({ removeBackground }) => removeBackground(previewAvatar))
      .then((blob) => {
        if (cancelled) return;
        cutoutProcessedFor.current = previewAvatar;
        setCutoutAvatarUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        if (cancelled) return;
        cutoutProcessedFor.current = previewAvatar;
        dispatch(pushToast("Couldn't remove the background — showing the original photo", "info"));
      })
      .finally(() => {
        if (!cancelled) setRemovingBg(false);
      });
    return () => {
      cancelled = true;
    };
  }, [headerLayout, previewAvatar, dispatch]);

  const cutoutAvatar = cutoutProcessedFor.current === previewAvatar ? cutoutAvatarUrl : null;
  const displayAvatar = headerLayout === "cutout" ? cutoutAvatar || previewAvatar : previewAvatar;

  const saveAll = async () => {
    // Design changes also ride along on the profile save (embedded in
    // digitalCard.design) so the public page — viewed by anyone who scans
    // the QR — can render with the same look Studio shows here, not just
    // this browser's own localStorage cache.
    if (profileDirty || picture || dirty) {
      const profileToSave = dirty
        ? { ...draft, digitalCard: { ...draft.digitalCard, design: design as unknown as Record<string, unknown> } }
        : draft;
      const res = await dispatch(saveProfile({ profile: profileToSave, picture }));
      if (!saveProfile.fulfilled.match(res)) {
        dispatch(pushToast((res.payload as string) || "Could not save profile", "error"));
        return;
      }
      setPicture(null);
      setPictureUrl(null);
    }
    if (dirty) {
      try {
        localStorage.setItem(STUDIO_DESIGN_KEY, JSON.stringify(design));
      } catch {
        /* ignore blocked storage */
      }
      dispatch(designSaved());
    }
    dispatch(pushToast("Changes saved", "success"));
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
    <AppShell fullHeight>
      <Head>
        <title>Customize · ClickCard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      <div className="mb-4 flex items-center justify-between gap-3 lg:shrink-0">
        <h1 className="font-display text-2xl font-black text-ink dark:text-white">Customize</h1>
        {(dirty || profileDirty || !!picture) && (
          <Button onClick={saveAll} loading={savingProfile} className="text-xs sm:text-sm">
            <Save size={16} /> Save changes
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:min-h-0 lg:flex-1 lg:flex-row">
        {/* preview + gallery */}
        <div className="flex flex-col min-h-0 lg:flex-1">
          {/* live preview */}
          <div className="grid place-items-center rounded-3xl  bg-mist p-4 sm:p-6 dark:bg-white/[0.02] min-h-[340px] sm:min-h-[410px] lg:flex-1 lg:overflow-hidden">
            <LiveProfileCard
              primary={primary}
              accent={accent}
              theme={theme}
              name={draft.personal?.fullName || "Your name"}
              username={user?.username}
              avatarUrl={displayAvatar}
              bannerUrl={bannerImageUrl || undefined}
              bio={draft.personal?.bio}
              socialLinks={(draft.social || []).filter((s) => s.url)}
              contact={draft.contact}
              experience={draft.experience}
              education={draft.education}
              products={draft.products}
              business={draft.business}
              headerLayout={headerLayout}
              wallpaperType={wallpaperType}
              backgroundImageUrl={backgroundImageUrl}
              backgroundColor={backgroundColor}
              gradientColor={gradientColor}
              gradientColorEnd={gradientColorEnd}
              gradientDirection={gradientDirection}
              noise={noise}
              patternIndex={patternIndex}
              buttonColor={buttonColor}
              buttonTextColor={buttonTextColor}
              buttonStyle={buttonStyle}
              buttonRoundness={buttonRoundness}
              buttonShadow={buttonShadow}
              socialLinksStyle={socialLinksStyle}
              pageFont={pageFont}
              pageTextColor={pageTextColor}
              matchTitleFont={matchTitleFont}
              titleFont={titleFont}
              titleColor={titleColor}
              titleFontSize={titleFontSize}
              bioFontSize={bioFontSize}
              bodyFontSize={bodyFontSize}
            />
            {!selected && (
              <p className="mt-3 text-xs text-ink/45 dark:text-white/45">
                {loading ? "Loading templates…" : "No export templates published yet."}
              </p>
            )}
          </div>

        </div>

        {/* controls */}
        <div className="rounded-3xl border border-ink/5 bg-mist dark:border-white/5 dark:bg-[#12403c] no-scrollbar lg:w-[380px] lg:h-full lg:shrink-0 lg:overflow-y-auto xl:w-[440px] 2xl:w-[520px]">
          {/* Design Heading */}
          <div className="px-5 py-4">
            <h3 className="font-display text-lg font-black text-ink dark:text-white">Design</h3>
          </div>

          {detailView === null && (
            <div className="px-4 pb-4 space-y-3">
               {/* Templates Option — one-tap style presets (Aura, Sunset…) */}
              <button
                onClick={() => setDetailView("presets")}
                className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg border border-ink/10 dark:border-white/10"
                      style={
                        wallpaperType === "image" && backgroundImageUrl
                          ? {
                              backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.55)), url(${backgroundImageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : wallpaperType === "gradient"
                          ? {
                              background: `linear-gradient(${gradientDirection === "down" ? "to bottom" : "to top"}, ${gradientColor}, ${gradientColorEnd})`,
                            }
                          : { background: backgroundColor }
                      }
                    >
                      <span
                        className="text-xs font-black"
                        style={{ fontFamily: `"${titleFont}", sans-serif`, color: titleColor }}
                      >
                        Aa
                      </span>
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Templates</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold capitalize text-ink/60 dark:text-white/60">
                      {STYLE_PRESETS.find((p) => p.key === activePreset)?.label || "Custom"}
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
                    <span
                      className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 dark:border-white/10"
                      style={{ background: backgroundColor, color: getContrastText(backgroundColor) }}
                    >
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

              {/* Header Option */}
              <button
                onClick={() => setDetailView("header")}
                className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-white">
                      <PanelTop size={16} />
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Header</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink/60 dark:text-white/60 capitalize">
                      {headerLayout}
                    </span>
                    <ChevronRight size={16} className="text-ink/40 dark:text-white/40" />
                  </div>
                </div>
              </button>

              {/* Buttons Option */}
              <button
                onClick={() => setDetailView("buttons")}
                className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 bg-ink/5 dark:border-white/10 dark:bg-white/10">
                      <span
                        className="h-3 w-6 rounded-full border border-ink/15 dark:border-white/20"
                        style={{ background: buttonColor }}
                      />
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Buttons</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold capitalize text-ink/60 dark:text-white/60">
                      {buttonStyle}
                    </span>
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
                      <CaseSensitive size={18} />
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Text</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink/60 dark:text-white/60">{pageFont}</span>
                    <ChevronRight size={16} className="text-ink/40 dark:text-white/40" />
                  </div>
                </div>
              </button>

              {/* Colors Option */}
              <button
                onClick={() => setDetailView("colors")}
                className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg border border-ink/10 dark:border-white/10">
                      <span className="flex h-full w-full">
                        <span className="h-full w-1/2" style={{ background: backgroundColor }} />
                        <span className="h-full w-1/2" style={{ background: buttonColor }} />
                      </span>
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Colors</p>
                  </div>
                  <ChevronRight size={16} className="text-ink/40 dark:text-white/40" />
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

          {/* Style Templates Detail View */}
          {detailView === "presets" && (
            <div className="space-y-4">
              {/* Back Button */}
              <button
                onClick={() => setDetailView(null)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white transition"
              >
                ← Templates
              </button>

              <div className="px-5 pb-4">
                <div className="grid grid-cols-3 gap-2">
                  {STYLE_PRESETS.map((p) => {
                    const active = activePreset === p.key;
                    const v = p.values;
                    return (
                      <button
                        key={p.key}
                        disabled={p.locked}
                        onClick={() => applyPreset(p)}
                        className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-2 transition ${
                          active ? "border-ink dark:border-white" : "border-transparent"
                        } ${p.locked ? "opacity-70" : ""}`}
                      >
                        <span
                          className="relative grid h-16 w-full place-items-center overflow-hidden rounded-xl"
                          style={
                            v.wallpaperType === "image" && v.backgroundImageUrl
                              ? {
                                  backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.55)), url(${v.backgroundImageUrl})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              : {
                                  background:
                                    v.wallpaperType === "gradient"
                                      ? `linear-gradient(${v.gradientDirection === "down" ? "to bottom" : "to top"}, ${v.gradientColor}, ${v.gradientColorEnd})`
                                      : v.backgroundColor,
                                }
                          }
                        >
                          <span
                            className="text-lg font-black"
                            style={{ fontFamily: `"${v.titleFont}", sans-serif`, color: v.titleColor }}
                          >
                            Aa
                          </span>
                          {p.locked && (
                            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/70 text-white dark:bg-white/30">
                              <Zap size={10} />
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] font-semibold text-ink/70 dark:text-white/70">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-ink/45 dark:text-white/45">
                  Applies colors, wallpaper, header layout, buttons and fonts all at once — you can still fine-tune
                  anything afterward in the panels below.
                </p>
              </div>
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
                                  ? `linear-gradient(135deg, ${gradientColor}, ${gradientColorEnd})`
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
                      <p className="text-sm font-semibold text-ink dark:text-white">Gradient color (start)</p>
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

                    {/* Gradient end color */}
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-ink dark:text-white">Gradient color (end)</p>
                      <label className="flex w-40 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                        <span
                          className="h-6 w-6 shrink-0 rounded-md border border-ink/10"
                          style={{ background: gradientColorEnd }}
                        />
                        <span className="text-sm font-medium uppercase text-ink dark:text-white">{gradientColorEnd}</span>
                        <input
                          type="color"
                          value={gradientColorEnd}
                          onChange={(e) => set({ gradientColorEnd: e.target.value })}
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

          {/* Header Detail View */}
          {detailView === "header" && (
            <div className="space-y-1">
              {/* Back Button */}
              <button
                onClick={() => setDetailView(null)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-ink dark:text-white transition"
              >
                ← Header
              </button>

              <div className="px-5 py-2 space-y-5">
                {/* Layout */}
                <div>
                  <p className="mb-3 text-sm font-semibold text-ink dark:text-white">Layout</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {HEADER_LAYOUTS.map((l) => {
                      const active = headerLayout === l.key;
                      const avatarShape =
                        l.key === "cutout"
                          ? { clipPath: "polygon(18% 0%, 100% 0%, 100% 82%, 82% 100%, 0% 100%, 0% 18%)" }
                          : l.key === "shape"
                          ? { borderRadius: "42% 58% 70% 30% / 45% 45% 55% 55%" }
                          : { borderRadius: "9999px" };
                      return (
                        <button
                          key={l.key}
                          onClick={() => set({ headerLayout: l.key })}
                          className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-2 transition ${
                            active ? "border-ink dark:border-white" : "border-transparent"
                          }`}
                        >
                          <span
                            className="relative grid h-14 w-full place-items-center rounded-xl overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                          >
                            {l.key === "banner" && (
                              <span className="absolute inset-x-0 top-0 h-5" style={{ background: `${accent}99` }} />
                            )}
                            <span
                              className="relative grid h-7 w-7 place-items-center bg-white/30 text-white"
                              style={avatarShape}
                            >
                              <UserIcon size={14} />
                            </span>
                          </span>
                          <span className="text-[11px] font-semibold text-ink/70 dark:text-white/70">{l.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Profile image */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">Profile image</p>
                    {headerLayout === "cutout" && removingBg && (
                      <p className="text-xs text-ink/50 dark:text-white/50">Removing background…</p>
                    )}
                  </div>
                  <div className="relative shrink-0">
                    <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-ink/10 text-ink/40 dark:bg-white/10 dark:text-white/40">
                      {previewAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewAvatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon size={22} />
                      )}
                    </span>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-brand-600 shadow-card ring-1 ring-ink/5 dark:bg-[#12403c] dark:text-white"
                      aria-label="Upload photo"
                    >
                      <Camera size={12} />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickPicture} />
                  </div>
                </div>

                {/* Banner image — only used by the Banner layout, shows above the profile image */}
                {headerLayout === "banner" && (
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-ink dark:text-white">Banner image</p>
                    <button
                      onClick={() => bannerFileRef.current?.click()}
                      className="relative grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-ink/10 text-ink/40 dark:bg-white/10 dark:text-white/40"
                      aria-label="Upload banner image"
                    >
                      {bannerImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={bannerImageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon size={18} />
                      )}
                      <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-brand-600 shadow-card ring-1 ring-ink/5 dark:bg-[#12403c] dark:text-white">
                        <Plus size={12} />
                      </span>
                    </button>
                    <input ref={bannerFileRef} type="file" accept="image/*" hidden onChange={onPickBanner} />
                  </div>
                )}

                {/* Title — the @username shown on the card; set at signup, not editable here */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">Title</p>
                  <div
                    className="w-40 truncate rounded-xl border border-ink/10 bg-ink/[0.03] px-3 py-2.5 text-sm font-medium text-ink/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60"
                    title="Your username is set at signup and can't be changed here"
                  >
                    @{user?.username || "username"}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-ink dark:text-white">Bio</p>
                    <span className="text-[10px] font-medium text-ink/40 dark:text-white/40">
                      {(draft.personal?.bio || "").length}/160
                    </span>
                  </div>
                  <textarea
                    value={draft.personal?.bio || ""}
                    maxLength={160}
                    onChange={(e) =>
                      dispatch(updateSection({ section: "personal", value: { ...draft.personal, bio: e.target.value } }))
                    }
                    placeholder="Add a short bio"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                  />
                </div>

                {/* Title style */}
                <div>
                  <p className="mb-3 text-sm font-semibold text-ink dark:text-white">Title style</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => set({ titleStyle: "text" })}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                        titleStyle === "text"
                          ? "border-ink text-ink dark:border-white dark:text-white"
                          : "border-ink/10 text-ink/40 dark:border-white/10 dark:text-white/40"
                      }`}
                    >
                      <Type size={18} />
                      Text
                    </button>
                    <button
                      disabled
                      className="relative flex flex-col items-center gap-2 rounded-xl border border-ink/10 p-3 text-xs font-semibold text-ink/40 dark:border-white/10 dark:text-white/40"
                    >
                      <ImageIcon size={18} />
                      Logo
                      <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-ink/50 text-white dark:bg-white/30">
                        <Zap size={9} />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Colors Detail View */}
          {detailView === "colors" && (
            <div className="space-y-1">
              {/* Back Button */}
              <button
                onClick={() => setDetailView(null)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-ink dark:text-white transition"
              >
                ← Colors
              </button>

              <div className="px-5 py-2 space-y-5">
                {(
                  [
                    { key: "backgroundColor", label: "Background", value: backgroundColor },
                    { key: "buttonColor", label: "Buttons", value: buttonColor },
                    { key: "buttonTextColor", label: "Button text", value: buttonTextColor },
                    { key: "pageTextColor", label: "Page text", value: pageTextColor },
                    { key: "titleColor", label: "Title", value: titleColor },
                  ] as { key: keyof typeof design; label: string; value: string }[]
                ).map((c) => (
                  <div key={c.key} className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-ink dark:text-white">{c.label}</p>
                    <label className="flex w-40 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                      <span
                        className="h-6 w-6 shrink-0 rounded-md border border-ink/10"
                        style={{ background: c.value }}
                      />
                      <span className="text-sm font-medium uppercase text-ink dark:text-white">{c.value}</span>
                      <input
                        type="color"
                        value={c.value}
                        onChange={(e) => set({ [c.key]: e.target.value })}
                        className="sr-only"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons Detail View */}
          {detailView === "buttons" && (
            <div className="space-y-1">
              {/* Back Button */}
              <button
                onClick={() => setDetailView(null)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-ink dark:text-white transition"
              >
                ← Buttons
              </button>

              <div className="px-5 py-2 space-y-5">
                {/* Button style */}
                <div>
                  <p className="mb-3 text-sm font-semibold text-ink dark:text-white">Button style</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { key: "solid", label: "Solid" },
                        { key: "glass", label: "Glass" },
                        { key: "outline", label: "Outline" },
                      ] as { key: ButtonStyleT; label: string; locked?: boolean }[]
                    ).map((s) => {
                      const active = buttonStyle === s.key;
                      return (
                        <button
                          key={s.key}
                          disabled={s.locked}
                          onClick={() => set({ buttonStyle: s.key })}
                          className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-2 transition ${
                            active ? "border-ink dark:border-white" : "border-transparent"
                          } ${s.locked ? "opacity-70" : ""}`}
                        >
                          <span
                            className="relative grid h-14 w-full place-items-center overflow-hidden rounded-xl"
                            style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                          >
                            <span
                              className="h-4 w-14 rounded-full"
                              style={{
                                background:
                                  s.key === "outline"
                                    ? "transparent"
                                    : s.key === "glass"
                                    ? `linear-gradient(155deg, ${buttonColor}66, ${buttonColor}1a 60%, ${buttonColor}33)`
                                    : buttonColor,
                                border:
                                  s.key === "outline" ? `1.5px solid ${buttonColor}` : s.key === "glass" ? "1px solid #ffffff59" : undefined,
                                boxShadow: s.key === "glass" ? "inset 0 1px 0 rgba(255,255,255,0.5)" : undefined,
                                backdropFilter: s.key === "glass" ? "blur(6px) saturate(180%)" : undefined,
                                WebkitBackdropFilter: s.key === "glass" ? "blur(6px) saturate(180%)" : undefined,
                              }}
                            />
                            {s.locked && (
                              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/70 text-white dark:bg-white/30">
                                <Zap size={10} />
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] font-semibold text-ink/70 dark:text-white/70">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Corner roundness */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">Corner roundness</p>
                  <div className="flex items-center gap-1.5">
                    {(
                      [
                        { key: "sharp", radius: 0 },
                        { key: "slight", radius: 5 },
                        { key: "medium", radius: 10 },
                        { key: "full", radius: 16 },
                      ] as { key: ButtonRoundnessT; radius: number }[]
                    ).map((r) => {
                      const active = buttonRoundness === r.key;
                      return (
                        <button
                          key={r.key}
                          onClick={() => set({ buttonRoundness: r.key })}
                          aria-label={r.key}
                          className={`grid h-9 w-9 place-items-center rounded-xl border-2 transition ${
                            active
                              ? "border-ink dark:border-white"
                              : "border-ink/10 dark:border-white/10"
                          }`}
                        >
                          <span
                            className="h-4 w-4 border-t-2 border-l-2 border-ink/60 dark:border-white/60"
                            style={{ borderTopLeftRadius: r.radius }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Button shadow */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">Button shadow</p>
                  <div className="flex items-center gap-1.5">
                    {(["none", "soft", "strong", "hard"] as ButtonShadowT[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => set({ buttonShadow: s })}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold capitalize transition ${
                          buttonShadow === s
                            ? "border-ink text-ink dark:border-white dark:text-white"
                            : "border-ink/10 text-ink/40 dark:border-white/10 dark:text-white/40"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button color */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">Button color</p>
                  <label className="flex w-40 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                    <span className="h-6 w-6 shrink-0 rounded-md border border-ink/10" style={{ background: buttonColor }} />
                    <span className="text-sm font-medium uppercase text-ink dark:text-white">{buttonColor}</span>
                    <input
                      type="color"
                      value={buttonColor}
                      onChange={(e) => set({ buttonColor: e.target.value })}
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* Button text color */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">Button text color</p>
                  <label className="flex w-40 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                    <span
                      className="h-6 w-6 shrink-0 rounded-md border border-ink/10"
                      style={{ background: buttonTextColor }}
                    />
                    <span className="text-sm font-medium uppercase text-ink dark:text-white">{buttonTextColor}</span>
                    <input
                      type="color"
                      value={buttonTextColor}
                      onChange={(e) => set({ buttonTextColor: e.target.value })}
                      className="sr-only"
                    />
                  </label>
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
                  <button
                    type="button"
                    onClick={() => setFontPickerTarget("page")}
                    className="flex w-44 items-center justify-between gap-2 rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-medium text-ink transition hover:border-brand-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  >
                    <span style={{ fontFamily: `"${pageFont}", sans-serif` }} className="truncate">
                      {pageFont}
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-ink/40 dark:text-white/40" />
                  </button>
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
                  <button
                    type="button"
                    disabled={matchTitleFont}
                    onClick={() => setFontPickerTarget("title")}
                    className="flex w-44 items-center justify-between gap-2 rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-medium text-ink disabled:opacity-50 transition hover:border-brand-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  >
                    <span style={{ fontFamily: `"${titleFont}", sans-serif` }} className="truncate">
                      {titleFont}
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-ink/40 dark:text-white/40" />
                  </button>
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

                {/* Title size */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">Title size</p>
                  <FontSizeInput value={titleFontSize} onChange={(v) => set({ titleFontSize: v })} />
                </div>

                {/* Bio size */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">Bio size</p>
                    <p className="text-xs text-ink/50 dark:text-white/50">The intro line under the title</p>
                  </div>
                  <FontSizeInput value={bioFontSize} onChange={(v) => set({ bioFontSize: v })} />
                </div>

                {/* Body text size */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">Body text size</p>
                    <p className="text-xs text-ink/50 dark:text-white/50">
                      Social links, experience, education, products &amp; business
                    </p>
                  </div>
                  <FontSizeInput value={bodyFontSize} onChange={(v) => set({ bodyFontSize: v })} />
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

      {cropSource && (
        <ImageCropModal
          imageSrc={cropSource}
          aspect={1}
          cropShape="round"
          title="Crop profile photo"
          onCancel={() => setCropSource(null)}
          onConfirm={onCropConfirm}
        />
      )}

      {fontPickerTarget && (
        <FontPickerModal
          title={fontPickerTarget === "page" ? "Page font" : "Title font"}
          selectedFont={fontPickerTarget === "page" ? pageFont : titleFont}
          onSelect={(font) => {
            if (fontPickerTarget === "page") set({ pageFont: font });
            else set({ titleFont: font });
          }}
          onClose={() => setFontPickerTarget(null)}
        />
      )}
    </AppShell>
  );
}

/* ---- "Font Picker" popup modal matching user design ---- */
function FontPickerModal({
  title,
  selectedFont,
  onSelect,
  onClose,
}: {
  title: string;
  selectedFont: string;
  onSelect: (font: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    FONT_ITEMS.forEach((f) => loadGoogleFont(f.name));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-lg max-h-[85vh] flex-col rounded-3xl bg-white shadow-soft-lg dark:bg-[#12403c] overflow-hidden border border-ink/5 dark:border-white/5"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/5 dark:border-white/5">
          <div className="w-8" />
          <h3 className="font-display text-base font-black text-ink dark:text-white text-center flex-1">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full border border-ink/15 text-ink/70 transition hover:bg-ink/5 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Font Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 gap-3 no-scrollbar">
          {FONT_ITEMS.map((item) => {
            const isSelected = item.name === selectedFont;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  loadGoogleFont(item.name);
                  onSelect(item.name);
                  onClose();
                }}
                className={`relative flex items-center justify-center rounded-2xl py-4 px-3 text-center transition ${
                  isSelected
                    ? "border-2 border-ink bg-white shadow-sm dark:border-white dark:bg-white/10"
                    : "border-2 border-transparent bg-ink/[0.04] hover:bg-ink/[0.08] dark:bg-white/[0.05] dark:hover:bg-white/[0.1]"
                }`}
              >
                <span
                  style={{ fontFamily: `"${item.name}", sans-serif` }}
                  className="text-sm font-semibold text-ink dark:text-white truncate"
                >
                  {item.name}
                </span>
                {item.pro && (
                  <span className="absolute top-2.5 right-2.5 grid h-5 w-5 place-items-center rounded-full bg-ink/70 text-white dark:bg-white/30">
                    <Zap size={10} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
