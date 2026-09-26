import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import {
  Download,
  Share2,
  Palette as PaletteIcon,
  CaseSensitive,
  Save,
  Check,
  LayoutTemplate,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  Camera,
  X,
} from "lucide-react";
import AppShell from "@/components/app/AppShell";
import Button from "@/components/ui/Button";
import SharePopup from "@/components/app/SharePopup";
import CardPreview from "@/components/app/CardPreview";
import FontPickerModal from "@/components/app/FontPickerModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile, saveProfile } from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { useRequireAuth } from "@/lib/authGuards";
import { SITE_URL } from "@/lib/config";
import { loadGoogleFont } from "@/lib/fonts";
import { CARD_TEMPLATES } from "@/lib/cardTemplates";
import { exportCardFacesToPdf } from "@/lib/exportPdf";
import type { PersonalSection, ContactSection, BusinessSection } from "@/types";

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

type PaletteStyle = "fill" | "gradient" | "blur";

const CARD_DETAIL_TITLES: Record<string, string> = {
  template: "Template",
  details: "Details",
  palette: "Palette",
  text: "Text",
};

export default function CardPage() {
  const guard = useRequireAuth();
  const dispatch = useAppDispatch();
  // Separate selectors — a single selector returning an object literal creates a
  // new reference every call, which react-redux v9 flags and re-renders on.
  const draft = useAppSelector((s) => s.profile.draft);
  const profileUser = useAppSelector((s) => s.auth.user);
  const saving = useAppSelector((s) => s.profile.saving);

  const [templateId, setTemplateId] = useState<string>(
    draft.digitalCard?.templateId !== undefined ? draft.digitalCard.templateId : "",
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
  const [fontFamily, setFontFamily] = useState<string>(
    draft.digitalCard?.fontFamily || "Inter",
  );
  const [textColor, setTextColor] = useState<string>(draft.digitalCard?.cardTextColor || "");
  const [paletteStyle, setPaletteStyle] = useState<PaletteStyle>(
    (draft.digitalCard?.paletteStyle as PaletteStyle) || "fill",
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    draft.digitalCard?.backgroundColor || "#FFFFFF",
  );
  const [headerColor, setHeaderColor] = useState<string>(draft.digitalCard?.headerColor || "");
  // Card-only overrides — start seeded from the main profile so a fresh card
  // isn't blank, but from here on they're independent: edits here never
  // dispatch to draft.personal/contact/business, and edits made to the main
  // Profile page elsewhere never overwrite these once the card has its own
  // saved values (see the sync effect below).
  const [cardPersonal, setCardPersonal] = useState<PersonalSection>(
    draft.digitalCard?.cardPersonal || draft.personal || {},
  );
  const [cardBusiness, setCardBusiness] = useState<BusinessSection>(
    draft.digitalCard?.cardBusiness || draft.business?.[0] || {},
  );
  const [cardContact, setCardContact] = useState<ContactSection>(
    draft.digitalCard?.cardContact || draft.contact || {},
  );
  const [downloading, setDownloading] = useState(false);
  const [detailView, setDetailView] = useState<string | null>(null);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Tracks unsaved edits — "dirty" whenever the current design differs from
  // the last known-saved snapshot. The snapshot re-baselines whenever
  // draft.digitalCard changes (initial load, or right after a successful
  // save re-fetches the canonical profile), so this never flashes dirty on
  // first load and clears itself as soon as a save completes.
  const savedSnapshotRef = useRef<string | null>(null);
  useEffect(() => {
    savedSnapshotRef.current = JSON.stringify({
      templateId, primary, accent, theme, fontFamily, textColor,
      paletteStyle, backgroundColor, headerColor, cardPersonal, cardBusiness, cardContact,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.digitalCard]);
  const currentSnapshot = JSON.stringify({
    templateId, primary, accent, theme, fontFamily, textColor,
    paletteStyle, backgroundColor, headerColor, cardPersonal, cardBusiness, cardContact,
  });
  const dirty = savedSnapshotRef.current !== null && currentSnapshot !== savedSnapshotRef.current;

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Sync editor controls with whatever profile finishes loading
  useEffect(() => {
    // `!== undefined`, not truthy — an explicitly saved "" (user unselected
    // the template) must stick after a refresh instead of falling back to
    // the default template, which a plain truthy check would do.
    if (draft.digitalCard?.templateId !== undefined) setTemplateId(draft.digitalCard.templateId);
    if (draft.digitalCard?.primaryColor) setPrimary(draft.digitalCard.primaryColor);
    if (draft.digitalCard?.accentColor) setAccent(draft.digitalCard.accentColor);
    if (draft.digitalCard?.theme) setTheme(draft.digitalCard.theme as "light" | "dark");
    if (draft.digitalCard?.fontFamily) setFontFamily(draft.digitalCard.fontFamily);
    if (draft.digitalCard?.cardTextColor) setTextColor(draft.digitalCard.cardTextColor);
    if (draft.digitalCard?.paletteStyle) setPaletteStyle(draft.digitalCard.paletteStyle as PaletteStyle);
    if (draft.digitalCard?.backgroundColor) setBackgroundColor(draft.digitalCard.backgroundColor);
    if (draft.digitalCard?.headerColor) setHeaderColor(draft.digitalCard.headerColor);
    // Only re-sync from the card's own saved overrides — deliberately not
    // watching draft.personal/business/contact here, so edits made to the
    // main Profile elsewhere don't leak into (or overwrite) the card.
    if (draft.digitalCard?.cardPersonal) setCardPersonal(draft.digitalCard.cardPersonal);
    if (draft.digitalCard?.cardBusiness) setCardBusiness(draft.digitalCard.cardBusiness);
    if (draft.digitalCard?.cardContact) setCardContact(draft.digitalCard.cardContact);
  }, [draft.digitalCard]);

  useEffect(() => {
    loadGoogleFont(fontFamily);
  }, [fontFamily]);


  // These patch the card-only copies above — never the shared profile — so
  // Details edits here stay scoped to the Digital Card.
  const updatePersonal = (patch: Partial<PersonalSection>) =>
    setCardPersonal((prev) => ({ ...prev, ...patch }));

  const updateContact = (patch: Partial<ContactSection>) =>
    setCardContact((prev) => ({ ...prev, ...patch }));

  const updateBusiness = (patch: Partial<BusinessSection>) =>
    setCardBusiness((prev) => ({ ...prev, ...patch }));

  // The business logo has no dedicated upload endpoint, so it's stored as a
  // data URL directly in cardBusiness.logo — it rides along inside the same
  // JSON blob as the rest of the card's details, no separate file host needed.
  // PNG/SVG only, and NOT run through the crop tool — that re-encodes to
  // JPEG, which would flatten a transparent logo onto a white background.
  const onPickLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.type !== "image/png" && f.type !== "image/svg+xml") {
      dispatch(pushToast("Logo must be a PNG or SVG file", "error"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateBusiness({ logo: reader.result as string });
    reader.readAsDataURL(f);
  };


  /** Phone/WhatsApp fields are exactly a 10-digit number — no country code, spaces, or symbols. */
  const onlyPhoneChars = (v: string) => v.replace(/\D/g, "").slice(0, 10);

  const onSave = async () => {
    const next = {
      ...draft,
      digitalCard: {
        // Preserve fields owned by the CV and Portfolio pages (skills,
        // projects, socialLinks) — this page only ever overrides the
        // fields below.
        ...draft.digitalCard,
        templateId,
        primaryColor: primary,
        accentColor: accent,
        theme,
        fontFamily,
        cardTextColor: textColor,
        paletteStyle,
        backgroundColor,
        headerColor,
        cardPersonal,
        cardBusiness,
        cardContact,
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
    const el = exportRef.current;
    if (!el) return;
    setDownloading(true);
    try {
      const faces = Array.from(el.querySelectorAll<HTMLElement>("[data-card-face]"));
      await exportCardFacesToPdf(faces.length ? faces : [el], `card-${templateId || "default"}.pdf`);
      dispatch(pushToast("PDF downloaded", "success"));
    } catch {
      dispatch(pushToast("PDF download failed", "error"));
    } finally {
      setDownloading(false);
    }
  };

  const cardUrl =
    typeof window !== "undefined"
      ? `${SITE_URL}/${profileUser?.username || ""}/card`
      : "";

  const onShare = () => setShowSharePopup(true);

  if (!guard) return null;

  // The card renders its own copy of personal/business/contact — Details
  // edits made here layer on top of the main profile without ever writing
  // back to it.
  const cardProfile = {
    ...draft,
    personal: { ...draft.personal, ...cardPersonal },
    business: [{ ...draft.business?.[0], ...cardBusiness }],
    contact: { ...draft.contact, ...cardContact },
  };

  // Portrait templates render both faces side-by-side (see CardPreview),
  // which needs a wider stage than a single landscape card does.
  const isPortraitTemplate = CARD_TEMPLATES.find((t) => t.id === templateId)?.card?.orientation === "portrait";

  const stage = (
    <CardPreview
      templateId={templateId}
      primary={primary}
      accent={accent}
      theme={theme}
      profile={cardProfile}
      username={profileUser?.username}
      fontFamily={fontFamily}
      textColor={textColor}
      paletteStyle={paletteStyle}
      backgroundColor={backgroundColor}
      headerColor={headerColor}
    />
  );

  // The stage body — shared between the inline lg+ stage section and the
  // below-lg mobile view so both stay in sync.
  const stageViewer = (
    <div className="flex min-h-[420px] min-w-0 flex-1 items-center justify-center overflow-x-auto py-2 no-scrollbar lg:min-h-0 lg:overflow-y-auto">
      <div
        className={`w-full min-w-0 overflow-hidden rounded-4xl bg-white p-2 py-4  shadow-sm dark:bg-white/[0.04]  md:p-6 ${
          isPortraitTemplate ? "max-w-[760px]" : "max-w-[460px]"
        }`}
      >
        {stage}
      </div>
    </div>
  );

  return (
    <AppShell fullHeight>
      <Head>
        <title>Business Card · ClickCard</title>
      </Head>

      {/* Hidden full-size copy for PDF export — independent of whichever
          responsive layout (mobile/desktop) is currently visible on screen,
          so downloading always captures the real card regardless of
          viewport. */}
      <div ref={exportRef} aria-hidden style={{ position: "fixed", top: 0, left: -99999, width: isPortraitTemplate ? 900 : 460 }}>
        {stage}
      </div>

      {/* ── header — desktop only; mobile shows the full-bleed preview
          instead, with Share/Download as floating buttons over it ── */}
      <div className="hidden flex-wrap items-center justify-between gap-3 pb-4 lg:flex lg:shrink-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-black text-ink dark:text-white">
            Business Card
          </h1>
          <p className="text-sm text-ink/55 dark:text-white/55">
            Pick a template, customise colours, then share or download as PDF.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button variant="outline" onClick={onShare}>
            <Share2 size={18} /> Share
          </Button>
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
      <div className="flex min-w-0 flex-col gap-5 md:min-h-0 md:flex-1 md:overflow-y-auto lg:flex-row">
        {/* stage — desktop only, boxed */}
        <section className="hidden min-w-0 flex-col rounded-3xl border border-ink/[0.06] bg-mist p-4 dark:border-white/[0.06] dark:bg-white/[0.02] lg:flex lg:min-h-0 lg:flex-1">
          {stageViewer}
        </section>

        {/* mobile stage — Share/Download live in the bottom bar, not floating;
            Save floats absolutely over the top-right corner of the preview,
            only while there are unsaved changes, so it never pushes the
            preview down when it appears. */}
        <div className="relative lg:hidden">
          {dirty && (
            <button
              onClick={onSave}
              disabled={saving}
              className="absolute right-4 top-0 z-10 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-soft ring-1 ring-ink/[0.06] transition hover:bg-ink/5 disabled:opacity-60 dark:bg-white/10 dark:text-white dark:ring-white/[0.06] sm:right-6"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : "Save"}
            </button>
          )}
          <div className={`-mx-4 sm:-mx-6 ${detailView === null ? "py-[4.2rem] md:py-10" : "py-[5vh] md:py-[4vh]"}`}>{stageViewer}</div>
        </div>

        {/* control rail — static sidebar on desktop, fixed bottom bar/sheet on
            mobile. Same options list + drilldown either way. */}
        <aside className="fixed inset-x-0 bottom-0 z-40 lg:static lg:z-auto lg:w-[380px] lg:h-full lg:shrink-0 xl:w-[440px]">
          <div
            className={`mx-auto rounded-t-3xl border border-b-0 border-ink/5 bg-mist shadow-soft-lg no-scrollbar dark:border-white/5 dark:bg-[#262626] lg:mx-0 lg:h-full lg:w-full lg:max-w-none lg:overflow-y-auto lg:rounded-3xl lg:border-b lg:shadow-none ${
              detailView === null ? "w-fit max-w-full" : "w-full max-w-lg"
            }`}
          >
          {detailView !== null && (
            <div className="flex items-center justify-between border-b border-ink/5 px-5 pt-4 pb-3 dark:border-white/5 lg:hidden">
              <h3 className="font-display text-lg font-black text-ink dark:text-white">
                {CARD_DETAIL_TITLES[detailView] || ""}
              </h3>
              <button
                onClick={() => setDetailView(null)}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/5 text-ink/60 transition hover:bg-ink/10 dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/20"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="hidden px-5 py-4 lg:block">
            <h3 className="font-display text-lg font-black text-ink dark:text-white">Edit Card</h3>
          </div>

          <div className="no-scrollbar max-h-[30vh] overflow-y-auto lg:max-h-none lg:overflow-visible">
          {detailView === null && (
            <div className="no-scrollbar flex items-start gap-3 overflow-x-auto px-5 py-4 lg:hidden">
              <button onClick={() => setDetailView("template")} className="flex shrink-0 flex-col items-center gap-1">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink/5 text-ink dark:bg-white/10 dark:text-white">
                  <LayoutTemplate size={16} />
                </span>
                <span className="text-[11px] font-bold text-ink dark:text-white">Template</span>
              </button>
              <button onClick={() => setDetailView("details")} className="flex shrink-0 flex-col items-center gap-1">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink/5 text-ink dark:bg-white/10 dark:text-white">
                  <Pencil size={16} />
                </span>
                <span className="text-[11px] font-bold text-ink dark:text-white">Details</span>
              </button>
              <button onClick={() => setDetailView("palette")} className="flex shrink-0 flex-col items-center gap-1">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink/5 text-ink dark:bg-white/10 dark:text-white">
                  <PaletteIcon size={16} />
                </span>
                <span className="text-[11px] font-bold text-ink dark:text-white">Palette</span>
              </button>
              <button onClick={() => setDetailView("text")} className="flex shrink-0 flex-col items-center gap-1">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink/5 text-ink dark:bg-white/10 dark:text-white">
                  <CaseSensitive size={18} />
                </span>
                <span className="text-[11px] font-bold text-ink dark:text-white">Text</span>
              </button>
              <button onClick={onShare} className="flex shrink-0 flex-col items-center gap-1">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink/5 text-ink dark:bg-white/10 dark:text-white">
                  <Share2 size={16} />
                </span>
                <span className="text-[11px] font-bold text-ink dark:text-white">Share</span>
              </button>
              <button onClick={onDownload} disabled={downloading} className="flex shrink-0 flex-col items-center gap-1">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink/5 text-ink dark:bg-white/10 dark:text-white">
                  {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                </span>
                <span className="text-[11px] font-bold text-ink dark:text-white">Download</span>
              </button>
            </div>
          )}

          {detailView === null && (
            <div className="hidden px-4 pb-4 space-y-3 lg:block">

              {/* Template Option — business/visiting-card layouts */}
              <button
                onClick={() => setDetailView("template")}
                className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 bg-ink/5 text-ink dark:border-white/10 dark:bg-white/10 dark:text-white">
                      <LayoutTemplate size={16} />
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Template</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="max-w-[110px] truncate text-xs font-semibold text-ink/60 dark:text-white/60">
                      {templateId ? (CARD_TEMPLATES.find((t) => t.id === templateId)?.name || "Custom") : "Default"}
                    </span>
                    <ChevronRight size={16} className="text-ink/40 dark:text-white/40" />
                  </div>
                </div>
              </button>

              {/* Details Option — name, business, contact info shown on the card */}
              <button
                onClick={() => setDetailView("details")}
                className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 bg-ink/5 text-ink dark:border-white/10 dark:bg-white/10 dark:text-white">
                      <Pencil size={16} />
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Details</p>
                  </div>
                  <ChevronRight size={16} className="text-ink/40 dark:text-white/40" />
                </div>
              </button>

              {/* Palette Option */}
              <button
                onClick={() => setDetailView("palette")}
                className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 bg-ink/5 text-ink dark:border-white/10 dark:bg-white/10 dark:text-white">
                      <PaletteIcon size={16} />
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Palette</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold capitalize text-ink/60 dark:text-white/60">
                      {paletteStyle}
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
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 bg-ink/5 text-ink dark:border-white/10 dark:bg-white/10 dark:text-white">
                      <CaseSensitive size={18} />
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Text</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="max-w-[110px] truncate text-xs font-semibold text-ink/60 dark:text-white/60"
                      style={{ fontFamily: `"${fontFamily}", sans-serif` }}
                    >
                      {fontFamily}
                    </span>
                    <ChevronRight size={16} className="text-ink/40 dark:text-white/40" />
                  </div>
                </div>
              </button>

              <button
                onClick={onSave}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving…" : "Save card design"}
              </button>
            </div>
          )}

          {/* Details Detail View — name, business, contact info shown on the card */}
          {detailView === "details" && (
            <div className="space-y-1">
              <button
                onClick={() => setDetailView(null)}
                className="hidden items-center gap-1 px-5 py-3 text-sm font-bold text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white transition lg:flex"
              >
                <ChevronLeft size={20} /> Details
              </button>
              <div className="space-y-6 px-5 pb-4">
                {/* Personal */}
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                    Personal
                  </p>
                  <input
                    type="text"
                    value={cardPersonal.fullName || ""}
                    onChange={(e) => updatePersonal({ fullName: e.target.value })}
                    placeholder="Full name"
                    className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                  />
                  <input
                    type="text"
                    value={cardPersonal.tagline || ""}
                    onChange={(e) => updatePersonal({ tagline: e.target.value })}
                    placeholder="Title / tagline"
                    className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                  />
                </div>


                {/* Business */}
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                    Business
                  </p>

                  {/* Logo — shown above the business name on any template with a logo slot */}
                  <div className="flex items-center gap-3 pb-1">
                    <div className="relative shrink-0">
                      <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl border border-ink/10 bg-white dark:border-white/10 dark:bg-white/[0.04]">
                        {cardBusiness.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cardBusiness.logo} alt="" className="h-full w-full object-contain p-1" />
                        ) : (
                          <Building2 size={20} className="text-ink/30 dark:text-white/30" />
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => logoFileRef.current?.click()}
                        className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-white text-brand-600 shadow-card ring-1 ring-ink/5 dark:bg-[#262626] dark:text-white"
                        aria-label="Upload business logo"
                      >
                        <Camera size={12} />
                      </button>
                      <input
                        ref={logoFileRef}
                        type="file"
                        accept="image/png,image/svg+xml"
                        hidden
                        onChange={onPickLogo}
                      />
                    </div>
                    <div className="min-w-0 text-xs text-ink/55 dark:text-white/55">
                      <p className="font-semibold text-ink dark:text-white">Business logo</p>
                      <p>Shown above the business name. PNG or SVG only.</p>
                      {cardBusiness.logo && (
                        <button
                          type="button"
                          onClick={() => updateBusiness({ logo: "" })}
                          className="mt-0.5 inline-flex items-center gap-1 font-semibold text-rose-500 hover:text-rose-600"
                        >
                          <X size={11} /> Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink/60 dark:text-white/60">
                      <Building2 size={12} /> Business name
                    </label>
                    <input
                      type="text"
                      value={cardBusiness.name || ""}
                      onChange={(e) => updateBusiness({ name: e.target.value })}
                      placeholder="Company or brand name"
                      className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                    />
                  </div>
                  <input
                    type="text"
                    value={cardBusiness.category || ""}
                    onChange={(e) => updateBusiness({ category: e.target.value })}
                    placeholder="Category (optional)"
                    className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                  />
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                    Contact
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink/60 dark:text-white/60">
                        <Mail size={12} /> Email
                      </label>
                      <input
                        type="email"
                        value={cardContact.email || ""}
                        onChange={(e) => updateContact({ email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                      />
                    </div>
                    <div>
                      <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink/60 dark:text-white/60">
                        <Phone size={12} /> Phone
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={cardContact.phone || ""}
                        onChange={(e) => updateContact({ phone: onlyPhoneChars(e.target.value) })}
                        placeholder="9876543210"
                        className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                      />
                    </div>
                    <div>
                      <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink/60 dark:text-white/60">
                        <Phone size={12} /> WhatsApp
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={cardContact.whatsapp || ""}
                        onChange={(e) => updateContact({ whatsapp: onlyPhoneChars(e.target.value) })}
                        placeholder="9876543210"
                        className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                      />
                    </div>
                    <div>
                      <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink/60 dark:text-white/60">
                        <Globe size={12} /> Website
                      </label>
                      <input
                        type="text"
                        value={cardContact.website || ""}
                        onChange={(e) => updateContact({ website: e.target.value })}
                        placeholder="https://…"
                        className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink/60 dark:text-white/60">
                        <MapPin size={12} /> Address
                      </label>
                      <input
                        type="text"
                        value={cardContact.address || ""}
                        onChange={(e) => updateContact({ address: e.target.value })}
                        placeholder="Street, area, city"
                        className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Template Detail View — business/visiting-card layout picker */}
          {detailView === "template" && (
            <div className="space-y-1">
              <button
                onClick={() => setDetailView(null)}
                className="hidden items-center gap-1 px-5 py-3 text-sm font-bold text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white transition lg:flex"
              >
                <ChevronLeft size={20} /> Template
              </button>
              <div className="grid grid-cols-2 gap-3 px-5 pb-4">
                {CARD_TEMPLATES.map((tpl) => {
                  const swatch = tpl.swatch;
                  const active = templateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setTemplateId((prev) => (prev === tpl.id ? "" : tpl.id))}
                      title={tpl.description}
                      className={`flex flex-col items-start gap-2 rounded-2xl border-2 bg-white p-2.5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.04] ${
                        active ? "border-ink dark:border-white" : "border-transparent"
                      }`}
                    >
                      {/* Mini visiting-card thumbnail */}
                      <span className="relative block h-16 w-full overflow-hidden rounded-lg">
                        <span
                          className="absolute inset-0"
                          style={{
                            background:
                              swatch.length > 1
                                ? `linear-gradient(135deg, ${swatch.join(", ")})`
                                : swatch[0],
                          }}
                        />
                        <span className="absolute left-2 top-2 h-4 w-4 rounded-full border-2 border-white/80 bg-white/40" />
                        <span className="absolute bottom-2 left-2 right-2 h-1.5 rounded-full bg-white/60" />
                        {active && (
                          <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white text-brand-600 shadow">
                            <Check size={12} />
                          </span>
                        )}
                      </span>
                      <span className="text-xs font-bold leading-tight text-ink dark:text-white">
                        {tpl.name}
                      </span>
                      <span className="line-clamp-2 text-[10px] leading-snug text-ink/50 dark:text-white/50">
                        {tpl.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Palette Detail View */}
          {detailView === "palette" && (
            <div className="space-y-1">
              <button
                onClick={() => setDetailView(null)}
                className="hidden items-center gap-1 px-5 py-3 text-sm font-bold text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white transition lg:flex"
              >
                <ChevronLeft size={20} /> Palette
              </button>
              <div className="px-5 pb-4">
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: "fill", label: "Fill" },
                      { key: "gradient", label: "Gradient" },
                      { key: "blur", label: "Blur" },
                    ] as { key: PaletteStyle; label: string }[]
                  ).map((w) => {
                    const active = paletteStyle === w.key;
                    return (
                      <button
                        key={w.key}
                        type="button"
                        onClick={() => setPaletteStyle(w.key)}
                        className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-2 transition ${
                          active ? "border-ink dark:border-white" : "border-transparent"
                        }`}
                      >
                        <span
                          className="relative grid h-14 w-full place-items-center overflow-hidden rounded-xl"
                          style={{
                            background:
                              w.key === "fill"
                                ? "#ffffff"
                                : `linear-gradient(135deg, ${primary}, ${accent})`,
                            border: w.key === "fill" ? "1px solid rgba(11,46,43,0.08)" : undefined,
                          }}
                        >
                          {w.key === "blur" && (
                            <span
                              className="absolute inset-0 backdrop-blur-md"
                              style={{ background: "rgba(255,255,255,0.35)" }}
                            />
                          )}
                        </span>
                        <span className="text-[11px] font-semibold text-ink/70 dark:text-white/70">
                          {w.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 space-y-4">
                  {paletteStyle === "fill" ? (
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-ink dark:text-white">Background color</p>
                      <label className="flex w-40 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                        <span
                          className="h-6 w-6 shrink-0 rounded-md border border-ink/10"
                          style={{ background: backgroundColor }}
                        />
                        <span className="text-sm font-medium uppercase text-ink dark:text-white">
                          {backgroundColor}
                        </span>
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-ink dark:text-white">Primary color</p>
                        <label className="flex w-40 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                          <span
                            className="h-6 w-6 shrink-0 rounded-md border border-ink/10"
                            style={{ background: primary }}
                          />
                          <span className="text-sm font-medium uppercase text-ink dark:text-white">{primary}</span>
                          <input
                            type="color"
                            value={primary}
                            onChange={(e) => setPrimary(e.target.value)}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-ink dark:text-white">Accent color</p>
                        <label className="flex w-40 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                          <span
                            className="h-6 w-6 shrink-0 rounded-md border border-ink/10"
                            style={{ background: accent }}
                          />
                          <span className="text-sm font-medium uppercase text-ink dark:text-white">{accent}</span>
                          <input
                            type="color"
                            value={accent}
                            onChange={(e) => setAccent(e.target.value)}
                            className="sr-only"
                          />
                        </label>
                      </div>
                    </>
                  )}

                  {/* Header color — applies to all three palette styles */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-ink dark:text-white">Header color</p>
                      <p className="text-xs text-ink/50 dark:text-white/50">
                        The band, header block or side panel
                      </p>
                    </div>
                    <label className="flex w-40 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                      <span
                        className="h-6 w-6 shrink-0 rounded-md border border-ink/10"
                        style={{ background: headerColor || primary }}
                      />
                      <span className="text-sm font-medium uppercase text-ink dark:text-white">
                        {headerColor || "Auto"}
                      </span>
                      <input
                        type="color"
                        value={headerColor || primary}
                        onChange={(e) => setHeaderColor(e.target.value)}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  {headerColor && (
                    <button
                      type="button"
                      onClick={() => setHeaderColor("")}
                      className="text-xs font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-white/70"
                    >
                      Reset to automatic colour
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Text Detail View */}
          {detailView === "text" && (
            <div className="space-y-1">
              <button
                onClick={() => setDetailView(null)}
                className="hidden items-center gap-1 px-5 py-3 text-sm font-bold text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white transition lg:flex"
              >
                <ChevronLeft size={20} /> Text
              </button>
              <div className="space-y-5 px-5 pb-4">
                {/* Font family */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">Font</p>
                  <button
                    type="button"
                    onClick={() => setFontPickerOpen(true)}
                    className="flex w-44 items-center justify-between gap-2 rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-medium text-ink transition hover:border-brand-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  >
                    <span style={{ fontFamily: `"${fontFamily}", sans-serif` }} className="truncate">
                      {fontFamily}
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-ink/40 dark:text-white/40" />
                  </button>
                </div>

                {/* Font colour */}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-ink dark:text-white">Font colour</p>
                  <label className="flex w-40 cursor-pointer items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                    <span
                      className="h-6 w-6 shrink-0 rounded-md border border-ink/10"
                      style={{ background: textColor || (theme === "dark" ? "#ffffff" : "#0b2e2b") }}
                    />
                    <span className="text-sm font-medium uppercase text-ink dark:text-white">
                      {textColor || "Auto"}
                    </span>
                    <input
                      type="color"
                      value={textColor || (theme === "dark" ? "#ffffff" : "#0b2e2b")}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="sr-only"
                    />
                  </label>
                </div>

                {textColor && (
                  <button
                    type="button"
                    onClick={() => setTextColor("")}
                    className="text-xs font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-white/70"
                  >
                    Reset to automatic colour
                  </button>
                )}
              </div>
            </div>
          )}
          </div>
          </div>
        </aside>
      </div>

      {fontPickerOpen && (
        <FontPickerModal
          title="Font"
          selectedFont={fontFamily}
          onSelect={setFontFamily}
          onClose={() => setFontPickerOpen(false)}
        />
      )}

      {showSharePopup && cardUrl && (
        <SharePopup profileUrl={cardUrl} shareType="card" onClose={() => setShowSharePopup(false)} />
      )}
    </AppShell>
  );
}
