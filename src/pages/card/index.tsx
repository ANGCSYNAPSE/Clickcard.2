import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import {
  Download,
  Share2,
  Palette as PaletteIcon,
  CaseSensitive,
  Save,
  Check,
  Sparkles,
  CreditCard,
  Smartphone,
  Eye,
  Loader2,
  ChevronRight,
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

type ViewMode = "card" | "mobile" | "preview";

const VIEW_MODES: { id: ViewMode; label: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "preview", label: "Preview", icon: Eye },
];

type PaletteStyle = "fill" | "gradient" | "blur";

export default function CardPage() {
  const guard = useRequireAuth();
  const dispatch = useAppDispatch();
  // Separate selectors — a single selector returning an object literal creates a
  // new reference every call, which react-redux v9 flags and re-renders on.
  const draft = useAppSelector((s) => s.profile.draft);
  const profileUser = useAppSelector((s) => s.auth.user);
  const saving = useAppSelector((s) => s.profile.saving);

  const [templateId, setTemplateId] = useState<string>(
    draft.digitalCard?.templateId || "wave-bold",
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
    draft.digitalCard?.cardBusiness || draft.business || {},
  );
  const [cardContact, setCardContact] = useState<ContactSection>(
    draft.digitalCard?.cardContact || draft.contact || {},
  );
  const [downloading, setDownloading] = useState(false);
  const [view, setView] = useState<ViewMode>("card");
  const [detailView, setDetailView] = useState<string | null>(null);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Sync editor controls with whatever profile finishes loading
  useEffect(() => {
    if (draft.digitalCard?.templateId) setTemplateId(draft.digitalCard.templateId);
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

  const publicUrl =
    typeof window !== "undefined"
      ? `${SITE_URL}/${profileUser?.username || ""}`
      : "";

  const onShare = () => setShowSharePopup(true);

  if (!guard) return null;

  // The card renders its own copy of personal/business/contact — Details
  // edits made here layer on top of the main profile without ever writing
  // back to it.
  const cardProfile = {
    ...draft,
    personal: { ...draft.personal, ...cardPersonal },
    business: { ...draft.business, ...cardBusiness },
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

  return (
    <AppShell fullHeight>
      <Head>
        <title>Digital Card · ClickCard</title>
      </Head>

      {/* Hidden full-size copy for PDF export — independent of whichever
          responsive layout (mobile/desktop) is currently visible on screen,
          so downloading always captures the real card regardless of
          viewport. */}
      <div ref={exportRef} aria-hidden style={{ position: "fixed", top: 0, left: -99999, width: isPortraitTemplate ? 900 : 460 }}>
        {stage}
      </div>

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
      <div className="flex min-w-0 flex-col gap-5 lg:min-h-0 lg:flex-1 lg:flex-row">
        {/* stage */}
        <section className="flex min-w-0 flex-col rounded-3xl border border-ink/[0.06] bg-mist p-4 dark:border-white/[0.06] dark:bg-white/[0.02] lg:min-h-0 lg:flex-1">
          <div className="flex min-h-[420px] min-w-0 flex-1 items-center justify-center overflow-x-auto py-2 no-scrollbar lg:min-h-0 lg:overflow-y-auto">
            {view === "card" && (
              <div
                className={`w-full rounded-2xl bg-white p-6 shadow-sm dark:bg-white/[0.04] ${
                  isPortraitTemplate ? "max-w-[760px]" : "max-w-[460px]"
                }`}
              >
                {stage}
              </div>
            )}

            {view === "mobile" && (
              <div className="w-full max-w-[300px] rounded-[2.2rem] bg-ink p-2.5">
                <div className="flex h-[600px] flex-col overflow-hidden rounded-[1.8rem] bg-white dark:bg-[#12403c]">
                  <div className="flex shrink-0 items-center justify-between px-4 pb-1.5 pt-2 text-[10px] font-bold text-ink/70 dark:text-white/70">
                    <span>9:41</span>
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 dark:bg-white/10">
                      LIVE
                    </span>
                  </div>
                  <div className="no-scrollbar flex-1 overflow-auto p-3">{stage}</div>
                </div>
              </div>
            )}

            {view === "preview" && (
              <div
                className={`flex h-[680px] w-full flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#12403c] ${
                  isPortraitTemplate ? "max-w-[720px]" : "max-w-[480px]"
                }`}
              >
                <div className="flex shrink-0 items-center gap-2 border-b border-ink/[0.06] px-3 py-2 dark:border-white/[0.06]">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-candy-yellow" />
                  <span className="h-2.5 w-2.5 rounded-full bg-candy-pink" />
                  <span className="ml-2 truncate rounded-md bg-mist px-2 py-1 text-[10px] font-semibold text-ink/50 dark:bg-white/5 dark:text-white/50">
                    {publicUrl || "clickcard.app"}
                  </span>
                </div>
                <div className="no-scrollbar flex-1 overflow-auto p-4">{stage}</div>
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

        {/* control rail — same shell/list/detail-view pattern as the Customize page */}
        <aside className="rounded-3xl border border-ink/5 bg-mist dark:border-white/5 dark:bg-[#12403c] no-scrollbar lg:w-[380px] lg:h-full lg:shrink-0 lg:overflow-y-auto xl:w-[440px]">
          <div className="px-5 py-4">
            <h3 className="font-display text-lg font-black text-ink dark:text-white">Edit Card</h3>
          </div>

          {detailView === null && (
            <div className="px-4 pb-4 space-y-3">

              {/* Template Option — business/visiting-card layouts */}
              <button
                onClick={() => setDetailView("template")}
                className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-white">
                      <Sparkles size={16} />
                    </span>
                    <p className="text-sm font-bold text-ink dark:text-white">Template</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="max-w-[110px] truncate text-xs font-semibold text-ink/60 dark:text-white/60">
                      {CARD_TEMPLATES.find((t) => t.id === templateId)?.name || "None selected"}
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
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-white">
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
                    <span
                      className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 dark:border-white/10"
                      style={{ background: primary, color: "#fff" }}
                    >
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
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-white">
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
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-ink dark:text-white transition"
              >
                ← Details
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
                        className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-white text-brand-600 shadow-card ring-1 ring-ink/5 dark:bg-[#12403c] dark:text-white"
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
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-ink dark:text-white transition"
              >
                ← Template
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
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-ink dark:text-white transition"
              >
                ← Palette
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
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-ink dark:text-white transition"
              >
                ← Text
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

      {showSharePopup && publicUrl && (
        <SharePopup profileUrl={publicUrl} onClose={() => setShowSharePopup(false)} />
      )}
    </AppShell>
  );
}
