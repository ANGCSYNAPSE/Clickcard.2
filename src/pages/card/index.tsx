import { useEffect, useMemo, useState } from "react";
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
  FileText,
  LayoutGrid,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  X,
  Mail,
  Phone,
  Globe,
  MapPin,
} from "lucide-react";
import AppShell from "@/components/app/AppShell";
import Button from "@/components/ui/Button";
import SharePopup from "@/components/app/SharePopup";
import CardPreview from "@/components/app/CardPreview";
import ResumePreview from "@/components/app/ResumePreview";
import PortfolioPreview from "@/components/app/PortfolioPreview";
import FontPickerModal from "@/components/app/FontPickerModal";
import SkillPickerModal from "@/components/app/SkillPickerModal";
import SocialIconPickerModal from "@/components/app/SocialIconPickerModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile, saveProfile, updateSection } from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { useRequireAuth } from "@/lib/authGuards";
import { SITE_URL } from "@/lib/config";
import { loadGoogleFont } from "@/lib/fonts";
import { CARD_TEMPLATES } from "@/lib/cardTemplates";
import { SOCIAL_QUICK_ADD, getSocialIcon } from "@/lib/socialPlatforms";
import { profileService, CardRenderInput } from "@/services/profileService";
import type {
  PersonalSection,
  ContactSection,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  SocialLink,
} from "@/types";

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

type CreateMode = "card" | "resume" | "portfolio";
type PaletteStyle = "fill" | "gradient" | "blur";

const CREATE_MODES: {
  id: CreateMode;
  label: string;
  description: string;
  icon: typeof CreditCard;
}[] = [
  { id: "card", label: "Card", description: "Business card", icon: CreditCard },
  { id: "resume", label: "CV", description: "Professional resume maker", icon: FileText },
  { id: "portfolio", label: "Portfolio", description: "Short portfolio", icon: LayoutGrid },
];

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
  const [textColor, setTextColor] = useState<string>(draft.digitalCard?.textColor || "");
  const [paletteStyle, setPaletteStyle] = useState<PaletteStyle>(
    (draft.digitalCard?.paletteStyle as PaletteStyle) || "fill",
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    draft.digitalCard?.backgroundColor || "#FFFFFF",
  );
  const [headerColor, setHeaderColor] = useState<string>(draft.digitalCard?.headerColor || "");
  const [skills, setSkills] = useState<string[]>(draft.digitalCard?.skills || []);
  const [projects, setProjects] = useState<ProjectItem[]>(draft.digitalCard?.projects || []);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(draft.digitalCard?.socialLinks || []);
  const [downloading, setDownloading] = useState(false);
  const [view, setView] = useState<ViewMode>("card");
  const [createMode, setCreateMode] = useState<CreateMode>("card");
  const [detailView, setDetailView] = useState<string | null>(null);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const [skillPickerOpen, setSkillPickerOpen] = useState(false);
  const [socialPickerOpen, setSocialPickerOpen] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [editingSocial, setEditingSocial] = useState<string | null>(null);

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
    if (draft.digitalCard?.textColor) setTextColor(draft.digitalCard.textColor);
    if (draft.digitalCard?.paletteStyle) setPaletteStyle(draft.digitalCard.paletteStyle as PaletteStyle);
    if (draft.digitalCard?.backgroundColor) setBackgroundColor(draft.digitalCard.backgroundColor);
    if (draft.digitalCard?.headerColor) setHeaderColor(draft.digitalCard.headerColor);
    if (draft.digitalCard?.skills) setSkills(draft.digitalCard.skills);
    if (draft.digitalCard?.projects) setProjects(draft.digitalCard.projects);
    if (draft.digitalCard?.socialLinks) setSocialLinks(draft.digitalCard.socialLinks);
  }, [draft.digitalCard]);

  useEffect(() => {
    loadGoogleFont(fontFamily);
  }, [fontFamily]);

  // Template picker is Card-only — leave its detail view if the mode changes.
  useEffect(() => {
    if (createMode !== "card" && detailView === "template") setDetailView(null);
  }, [createMode, detailView]);

  const renderInput: CardRenderInput = useMemo(
    () => ({ templateId, primary, accent, theme }),
    [templateId, primary, accent, theme],
  );

  // Resume/CV detail editing — patches the same profile.experience/education
  // sections the rest of the app reads from, via the generic updateSection reducer.
  const experience = draft.experience || [];
  const education = draft.education || [];

  const onlyDigits = (v: string) => v.replace(/\D/g, "");
  const onlyPhoneChars = (v: string) => v.replace(/[^\d+ ]/g, "");

  const updatePersonal = (patch: Partial<PersonalSection>) =>
    dispatch(updateSection({ section: "personal", value: { ...draft.personal, ...patch } }));

  const updateContact = (patch: Partial<ContactSection>) =>
    dispatch(updateSection({ section: "contact", value: { ...draft.contact, ...patch } }));

  // Portfolio/CV social links are their own list — kept out of profile.social
  // on purpose, so editing them here doesn't touch the Share page, public
  // profile, or anywhere else that reads the main profile.
  const findSocial = (platform: string) =>
    socialLinks.find((s) => s.platform?.toLowerCase() === platform.toLowerCase());
  const socialIconRow = [
    ...SOCIAL_QUICK_ADD,
    { platform: "GitHub", icon: getSocialIcon("GitHub") },
    ...socialLinks
      .filter(
        (s) =>
          !SOCIAL_QUICK_ADD.some((q) => q.platform.toLowerCase() === s.platform?.toLowerCase()) &&
          s.platform?.toLowerCase() !== "github",
      )
      .map((s) => ({ platform: s.platform, icon: getSocialIcon(s.platform) })),
  ];

  /** Ensures a (possibly blank) entry exists for the platform, then opens its editor. */
  const openSocialEditor = (platform: string) => {
    if (!findSocial(platform)) {
      setSocialLinks((prev) => [...prev, { platform, username: "", url: "", visible: true }]);
    }
    setEditingSocial(platform);
    setSocialPickerOpen(false);
  };
  const updateSocial = (platform: string, patchValue: Partial<SocialLink>) =>
    setSocialLinks((prev) =>
      prev.map((s) => (s.platform?.toLowerCase() === platform.toLowerCase() ? { ...s, ...patchValue } : s)),
    );
  const removeSocial = (platform: string) => {
    setSocialLinks((prev) => prev.filter((s) => s.platform?.toLowerCase() !== platform.toLowerCase()));
    setEditingSocial(null);
  };

  const addExperience = () =>
    dispatch(
      updateSection({
        section: "experience",
        value: [...experience, { company: "", role: "" } as ExperienceItem],
      }),
    );
  const updateExperience = (index: number, patch: Partial<ExperienceItem>) =>
    dispatch(
      updateSection({
        section: "experience",
        value: experience.map((item, i) => (i === index ? { ...item, ...patch } : item)),
      }),
    );
  const removeExperience = (index: number) =>
    dispatch(updateSection({ section: "experience", value: experience.filter((_, i) => i !== index) }));

  const addEducation = () =>
    dispatch(
      updateSection({
        section: "education",
        value: [...education, { institution: "" } as EducationItem],
      }),
    );
  const updateEducation = (index: number, patch: Partial<EducationItem>) =>
    dispatch(
      updateSection({
        section: "education",
        value: education.map((item, i) => (i === index ? { ...item, ...patch } : item)),
      }),
    );
  const removeEducation = (index: number) =>
    dispatch(updateSection({ section: "education", value: education.filter((_, i) => i !== index) }));

  const addProject = () => setProjects((prev) => [...prev, { name: "" } as ProjectItem]);
  const updateProject = (index: number, patch: Partial<ProjectItem>) =>
    setProjects((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const removeProject = (index: number) =>
    setProjects((prev) => prev.filter((_, i) => i !== index));

  const onSave = async () => {
    const next = {
      ...draft,
      digitalCard: {
        templateId,
        primaryColor: primary,
        accentColor: accent,
        theme,
        fontFamily,
        textColor,
        paletteStyle,
        backgroundColor,
        headerColor,
        skills,
        projects,
        socialLinks,
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

  const onShare = () => setShowSharePopup(true);

  if (!guard) return null;

  const card = (
    <CardPreview
      templateId={templateId}
      primary={primary}
      accent={accent}
      theme={theme}
      profile={draft}
      username={profileUser?.username}
      fontFamily={fontFamily}
      textColor={textColor}
      paletteStyle={paletteStyle}
      backgroundColor={backgroundColor}
      headerColor={headerColor}
    />
  );

  const stage =
    createMode === "resume" ? (
      <ResumePreview
        profile={draft}
        primary={primary}
        accent={accent}
        fontFamily={fontFamily}
        textColor={textColor}
        skills={skills}
        projects={projects}
      />
    ) : createMode === "portfolio" ? (
      <PortfolioPreview
        profile={draft}
        primary={primary}
        accent={accent}
        fontFamily={fontFamily}
        textColor={textColor}
        skills={skills}
        projects={projects}
        socialLinks={socialLinks}
      />
    ) : (
      card
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
          <div
            className={`flex min-h-[420px] min-w-0 flex-1 justify-center overflow-x-auto py-2 no-scrollbar lg:min-h-0 lg:overflow-y-auto ${
              (createMode === "resume" || createMode === "portfolio") && view === "card" ? "items-start" : "items-center"
            }`}
          >
            {view === "card" && (
              <div
                className={`w-full ${
                  createMode === "resume" ? "max-w-[820px]" : createMode === "portfolio" ? "max-w-[600px]" : "max-w-[340px]"
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
                className={`flex h-[560px] w-full flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#12403c] ${
                  createMode === "resume" || createMode === "portfolio" ? "max-w-[480px]" : "max-w-[400px]"
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
              {VIEW_MODES.map((m) => {
                const isCardTab = m.id === "card";
                const label = isCardTab
                  ? createMode === "resume"
                    ? "CV"
                    : createMode === "portfolio"
                    ? "Portfolio"
                    : m.label
                  : m.label;
                const ModeIcon = isCardTab
                  ? createMode === "resume"
                    ? FileText
                    : createMode === "portfolio"
                    ? LayoutGrid
                    : m.icon
                  : m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setView(m.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      view === m.id
                        ? "bg-brand-50 text-brand-600 dark:bg-white/10 dark:text-white"
                        : "text-ink/50 hover:text-brand-600 dark:text-white/50"
                    }`}
                  >
                    <ModeIcon size={14} /> {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* control rail — same shell/list/detail-view pattern as the Customize page */}
        <aside className="rounded-3xl border border-ink/5 bg-mist dark:border-white/5 dark:bg-[#12403c] no-scrollbar lg:w-[380px] lg:h-full lg:shrink-0 lg:overflow-y-auto xl:w-[440px]">
          <div className="px-5 py-4">
            <h3 className="font-display text-lg font-black text-ink dark:text-white">Create</h3>
          </div>

          {detailView === null && (
            <div className="px-4 pb-4 space-y-3">
              {/* Create mode — Card / Resume-CV / Portfolio */}
              <div className="grid grid-cols-3 gap-2">
                {CREATE_MODES.map((m) => {
                  const active = createMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCreateMode(m.id)}
                      className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-2.5 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:bg-white/[0.04] ${
                        active ? "border-ink dark:border-white" : "border-transparent"
                      }`}
                    >
                      {active && (
                        <Check size={13} className="absolute right-2 top-2 text-brand-500" />
                      )}
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-600 dark:bg-white/10 dark:text-white">
                        <m.icon size={16} />
                      </span>
                      <span className="text-[11px] font-bold leading-tight text-ink dark:text-white">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="px-1 pt-2 text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                Customize
              </p>

              {/* Template Option — business/visiting-card layouts, Card mode only */}
              {createMode === "card" && (
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
                        {CARD_TEMPLATES.find((t) => t.id === templateId)?.name || "Classic"}
                      </span>
                      <ChevronRight size={16} className="text-ink/40 dark:text-white/40" />
                    </div>
                  </div>
                </button>
              )}

              {/* Details Option — resume/CV and portfolio only */}
              {(createMode === "resume" || createMode === "portfolio") && (
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink/60 dark:text-white/60">
                        {experience.length + projects.length + education.length} entries
                      </span>
                      <ChevronRight size={16} className="text-ink/40 dark:text-white/40" />
                    </div>
                  </div>
                </button>
              )}

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
                      onClick={() => setTemplateId(tpl.id)}
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

          {/* Details Detail View — resume/CV content editor */}
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
                    value={draft.personal?.fullName || ""}
                    onChange={(e) => updatePersonal({ fullName: e.target.value })}
                    placeholder="Full name"
                    className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                  />
                  <input
                    type="text"
                    value={draft.personal?.tagline || ""}
                    onChange={(e) => updatePersonal({ tagline: e.target.value })}
                    placeholder="Title / tagline"
                    className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                  />
                  <textarea
                    value={draft.personal?.bio || ""}
                    onChange={(e) => updatePersonal({ bio: e.target.value })}
                    placeholder="Summary — a short professional overview"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                  />
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                      Skills
                    </p>
                    <button
                      type="button"
                      onClick={() => setSkillPickerOpen(true)}
                      className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-white/80"
                    >
                      <Plus size={12} /> Add skill
                    </button>
                  </div>
                  {skills.length === 0 ? (
                    <p className="text-xs text-ink/40 dark:text-white/40">No skills added yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                            aria-label={`Remove ${s}`}
                            className="text-ink/40 hover:text-red-500 dark:text-white/40"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                        Experience
                      </p>
                      <button
                        type="button"
                        onClick={addExperience}
                        className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-white/80"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    {experience.length === 0 && (
                      <p className="text-xs text-ink/40 dark:text-white/40">No experience added yet.</p>
                    )}
                    <div className="space-y-3">
                      {experience.map((e, i) => (
                        <div
                          key={i}
                          className="space-y-2 rounded-xl border border-ink/10 p-3 dark:border-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={e.role || ""}
                              onChange={(ev) => updateExperience(i, { role: ev.target.value })}
                              placeholder="Role"
                              className="flex-1 rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                            />
                            <button
                              type="button"
                              onClick={() => removeExperience(i)}
                              aria-label="Remove experience"
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/40 transition hover:bg-ink/5 hover:text-red-500 dark:text-white/40 dark:hover:bg-white/10"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={e.company || ""}
                            onChange={(ev) => updateExperience(i, { company: ev.target.value })}
                            placeholder="Company"
                            className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={e.startDate || ""}
                              onChange={(ev) => updateExperience(i, { startDate: onlyDigits(ev.target.value) })}
                              placeholder="Start (e.g. 2021)"
                              className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                            />
                            <input
                              type="text"
                              inputMode="numeric"
                              value={e.endDate || ""}
                              disabled={!!e.current}
                              onChange={(ev) => updateExperience(i, { endDate: onlyDigits(ev.target.value) })}
                              placeholder="End (e.g. 2023)"
                              className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                            />
                          </div>
                          <label className="flex items-center gap-2 text-xs font-medium text-ink/70 dark:text-white/70">
                            <input
                              type="checkbox"
                              checked={!!e.current}
                              onChange={(ev) => updateExperience(i, { current: ev.target.checked })}
                            />
                            Currently working here
                          </label>
                          <textarea
                            value={e.description || ""}
                            onChange={(ev) => updateExperience(i, { description: ev.target.value })}
                            placeholder="Description"
                            rows={2}
                            className="w-full resize-none rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                {/* Projects */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                      Projects
                    </p>
                    <button
                      type="button"
                      onClick={addProject}
                      className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-white/80"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  {projects.length === 0 && (
                    <p className="text-xs text-ink/40 dark:text-white/40">No projects added yet.</p>
                  )}
                  <div className="space-y-3">
                    {projects.map((proj, i) => (
                      <div
                        key={i}
                        className="space-y-2 rounded-xl border border-ink/10 p-3 dark:border-white/10"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={proj.name || ""}
                            onChange={(ev) => updateProject(i, { name: ev.target.value })}
                            placeholder="Project name"
                            className="flex-1 rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                          />
                          <button
                            type="button"
                            onClick={() => removeProject(i)}
                            aria-label="Remove project"
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/40 transition hover:bg-ink/5 hover:text-red-500 dark:text-white/40 dark:hover:bg-white/10"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={proj.role || ""}
                          onChange={(ev) => updateProject(i, { role: ev.target.value })}
                          placeholder="Your role (optional)"
                          className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                        />
                        <input
                          type="text"
                          value={proj.link || ""}
                          onChange={(ev) => updateProject(i, { link: ev.target.value })}
                          placeholder="Link (optional)"
                          className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={proj.startDate || ""}
                            onChange={(ev) => updateProject(i, { startDate: onlyDigits(ev.target.value) })}
                            placeholder="Start (e.g. 2023)"
                            className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                          />
                          <input
                            type="text"
                            inputMode="numeric"
                            value={proj.endDate || ""}
                            onChange={(ev) => updateProject(i, { endDate: onlyDigits(ev.target.value) })}
                            placeholder="End (e.g. 2024)"
                            className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                          />
                        </div>
                        <textarea
                          value={proj.description || ""}
                          onChange={(ev) => updateProject(i, { description: ev.target.value })}
                          placeholder="Description"
                          rows={2}
                          className="w-full resize-none rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-wider text-ink/60 dark:text-white/60">
                        Education
                      </p>
                      <button
                        type="button"
                        onClick={addEducation}
                        className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-white/80"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    {education.length === 0 && (
                      <p className="text-xs text-ink/40 dark:text-white/40">No education added yet.</p>
                    )}
                    <div className="space-y-3">
                      {education.map((ed, i) => (
                        <div
                          key={i}
                          className="space-y-2 rounded-xl border border-ink/10 p-3 dark:border-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={ed.institution || ""}
                              onChange={(ev) => updateEducation(i, { institution: ev.target.value })}
                              placeholder="Institution"
                              className="flex-1 rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                            />
                            <button
                              type="button"
                              onClick={() => removeEducation(i)}
                              aria-label="Remove education"
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/40 transition hover:bg-ink/5 hover:text-red-500 dark:text-white/40 dark:hover:bg-white/10"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={ed.degree || ""}
                              onChange={(ev) => updateEducation(i, { degree: ev.target.value })}
                              placeholder="Degree"
                              className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                            />
                            <input
                              type="text"
                              value={ed.field || ""}
                              onChange={(ev) => updateEducation(i, { field: ev.target.value })}
                              placeholder="Field of study"
                              className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={ed.startYear || ""}
                              onChange={(ev) => updateEducation(i, { startYear: onlyDigits(ev.target.value) })}
                              placeholder="Start year"
                              className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                            />
                            <input
                              type="text"
                              inputMode="numeric"
                              value={ed.endYear || ""}
                              onChange={(ev) => updateEducation(i, { endYear: onlyDigits(ev.target.value) })}
                              placeholder="End year"
                              className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                            />
                          </div>
                          <textarea
                            value={ed.description || ""}
                            onChange={(ev) => updateEducation(i, { description: ev.target.value })}
                            placeholder="Description"
                            rows={2}
                            className="w-full resize-none rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                          />
                        </div>
                      ))}
                    </div>
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
                        value={draft.contact?.email || ""}
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
                        inputMode="tel"
                        value={draft.contact?.phone || ""}
                        onChange={(e) => updateContact({ phone: onlyPhoneChars(e.target.value) })}
                        placeholder="+91 82196 34560"
                        className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                      />
                    </div>
                    <div>
                      <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink/60 dark:text-white/60">
                        <Globe size={12} /> Portfolio / LinkedIn
                      </label>
                      <input
                        type="text"
                        value={draft.contact?.website || ""}
                        onChange={(e) => updateContact({ website: e.target.value })}
                        placeholder="https://…"
                        className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                      />
                    </div>
                    <div>
                      <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink/60 dark:text-white/60">
                        <MapPin size={12} /> City
                      </label>
                      <input
                        type="text"
                        value={draft.contact?.city || ""}
                        onChange={(e) => updateContact({ city: e.target.value })}
                        placeholder="City"
                        className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                      />
                    </div>
                  </div>

                  {/* Social links */}
                  <div className="mt-4">
                    <p className="mb-1.5 text-[11px] font-semibold text-ink/60 dark:text-white/60">Social links</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {socialIconRow.map(({ platform, icon: Icon }) => {
                        const added = Boolean(findSocial(platform));
                        const isEditing = editingSocial === platform;
                        return (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => openSocialEditor(platform)}
                            title={added ? `Edit ${platform}` : `Add ${platform}`}
                            aria-label={added ? `Edit ${platform}` : `Add ${platform}`}
                            className={`grid h-9 w-9 place-items-center rounded-full transition ${
                              isEditing
                                ? "bg-brand-500 text-white ring-2 ring-brand-500/30"
                                : added
                                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-white"
                                : "bg-ink/5 text-ink/60 hover:bg-brand-50 hover:text-brand-600 dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/20"
                            }`}
                          >
                            <Icon size={15} />
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setSocialPickerOpen(true)}
                        title="Add another social link"
                        aria-label="Add another social link"
                        className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-ink/15 text-ink/40 transition hover:border-brand-300 hover:text-brand-600 dark:border-white/15 dark:text-white/40"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    {editingSocial && findSocial(editingSocial) && (
                      <div className="mt-3 space-y-2 rounded-xl bg-mist p-3 dark:bg-white/[0.03]">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-xs font-bold text-ink dark:text-white">
                            {(() => {
                              const Icon = getSocialIcon(editingSocial);
                              return <Icon size={14} />;
                            })()}
                            {editingSocial}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSocial(editingSocial)}
                            className="flex items-center gap-1 text-xs font-semibold text-rose-500 transition hover:text-rose-600"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={findSocial(editingSocial)?.url || ""}
                          onChange={(e) => updateSocial(editingSocial, { url: e.target.value })}
                          placeholder="https://…"
                          className="w-full rounded-lg border border-ink/10 bg-white px-2.5 py-2 text-xs font-medium text-ink placeholder:text-ink/35 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingSocial(null)}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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

      {skillPickerOpen && (
        <SkillPickerModal
          existingSkills={skills}
          onAdd={(skill) => setSkills((prev) => [...prev, skill])}
          onClose={() => setSkillPickerOpen(false)}
        />
      )}

      {socialPickerOpen && (
        <SocialIconPickerModal
          onBack={() => setSocialPickerOpen(false)}
          onClose={() => setSocialPickerOpen(false)}
          onPick={openSocialEditor}
        />
      )}

      {showSharePopup && publicUrl && (
        <SharePopup profileUrl={publicUrl} onClose={() => setShowSharePopup(false)} />
      )}
    </AppShell>
  );
}

