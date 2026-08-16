import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import {
  User as UserIcon,
  Phone,
  GraduationCap,
  Briefcase,
  Building2,
  Package,
  Save,
  Camera,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  X as CloseIcon,
} from "lucide-react";
import { SOCIAL_QUICK_ADD, ALL_SOCIAL_PLATFORMS, getSocialIcon } from "@/lib/socialPlatforms";
import AppShell from "@/components/app/AppShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ProfilePreview from "@/components/app/ProfilePreview";
import ImageCropModal from "@/components/app/ImageCropModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProfile,
  saveProfile,
  updateSection,
} from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { updateDesign } from "@/store/slices/designSlice";
import type {
  EducationItem,
  ExperienceItem,
  ProductItem,
  SocialLink,
  FullProfile,
} from "@/types";

type SectionKey =
  | "personal"
  | "contact"
  | "education"
  | "experience"
  | "business"
  | "products";

const SECTIONS: { key: SectionKey; label: string; icon: typeof UserIcon }[] = [
  { key: "personal", label: "Personal", icon: UserIcon },
  { key: "contact", label: "Contact", icon: Phone },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "business", label: "Business", icon: Building2 },
  { key: "products", label: "Products", icon: Package },
];

export default function ProfileEditorPage() {
  const dispatch = useAppDispatch();
  const { draft, saving, status } = useAppSelector((s) => s.profile);
  const authUser = useAppSelector((s) => s.auth.user);
  const socialLinksStyle = useAppSelector((s) => s.design.socialLinksStyle);
  const [active, setActive] = useState<SectionKey>("personal");
  const [picture, setPicture] = useState<File | null>(null);
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [socialPickerOpen, setSocialPickerOpen] = useState(false);
  const [socialQuery, setSocialQuery] = useState("");
  const [editingSocial, setEditingSocial] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "idle") dispatch(fetchProfile());
  }, [dispatch, status]);

  const patch = <K extends keyof FullProfile>(section: K, value: FullProfile[K]) =>
    dispatch(updateSection({ section, value }));

  const social = draft.social || [];
  const findSocial = (platform: string) =>
    social.find((s) => s.platform?.toLowerCase() === platform.toLowerCase());

  /** Ensures a (possibly blank) entry exists for the platform, then opens its editor. */
  const openSocialEditor = (platform: string) => {
    if (!findSocial(platform)) {
      patch("social", [...social, { platform, username: "", url: "", visible: true }]);
    }
    setEditingSocial(platform);
    setSocialPickerOpen(false);
    setSocialQuery("");
  };

  const updateSocial = (platform: string, patchValue: Partial<SocialLink>) =>
    patch(
      "social",
      social.map((s) => (s.platform?.toLowerCase() === platform.toLowerCase() ? { ...s, ...patchValue } : s)),
    );

  const removeSocial = (platform: string) => {
    patch("social", social.filter((s) => s.platform?.toLowerCase() !== platform.toLowerCase()));
    setEditingSocial(null);
  };

  /** Fixed quick-add icons plus any extra platforms already added via the picker. */
  const socialIconRow = [
    ...SOCIAL_QUICK_ADD,
    ...ALL_SOCIAL_PLATFORMS.filter(
      (p) =>
        !SOCIAL_QUICK_ADD.some((q) => q.platform === p.platform) &&
        findSocial(p.platform),
    ),
  ];

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

  const onSave = async () => {
    const res = await dispatch(saveProfile({ profile: draft, picture }));
    if (saveProfile.fulfilled.match(res)) {
      dispatch(pushToast("Profile saved 🎉", "success"));
      setPicture(null);
      setPictureUrl(null);
    } else {
      dispatch(pushToast((res.payload as string) || "Could not save", "error"));
    }
  };

  const tabsRef = useRef<HTMLDivElement>(null);

  const currentIndex = SECTIONS.findIndex((s) => s.key === active);
  const prevSection = SECTIONS[currentIndex - 1];
  const nextSection = SECTIONS[currentIndex + 1];

  const goToPrev = () => {
    if (prevSection) setActive(prevSection.key);
  };

  const goToNext = () => {
    if (nextSection) setActive(nextSection.key);
  };

  useEffect(() => {
    const activeEl = tabsRef.current?.querySelector(`[data-tab-key="${active}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [active]);

  const previewAvatar = pictureUrl || draft.personal?.profilePicture;

  return (
    <AppShell>
      <Head>
        <title>Profile editor · ClickCard</title>
      </Head>

      {/* header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-black text-ink dark:text-white">
            Profile editor
          </h1>
          <p className="text-xs sm:text-sm text-ink/55 dark:text-white/55">
            Build your public page. Changes preview live on the right.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button onClick={onSave} loading={saving} className="text-xs sm:text-sm">
            <Save size={17} /> Save changes
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_300px]">
        {/* editor */}
        <div className="min-w-0 grid gap-4 lg:grid-cols-[180px_1fr] lg:items-start">
          {/* section content */}
          <div className="min-w-0 order-2 rounded-2xl sm:rounded-3xl border border-ink/[0.06] bg-white p-4 sm:p-6 lg:p-7 dark:border-white/[0.06] dark:bg-[#12403c]">
            {active === "personal" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative shrink-0">
                    <span className="grid h-16 w-16 sm:h-20 sm:w-20 place-items-center overflow-hidden rounded-full bg-candy-pink text-xl sm:text-2xl font-black text-white">
                      {previewAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewAvatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (draft.personal?.fullName || "Y")[0].toUpperCase()
                      )}
                    </span>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-white text-brand-600 shadow-card ring-1 ring-ink/5 dark:bg-[#12403c] dark:text-white"
                      aria-label="Upload photo"
                    >
                      <Camera size={14} />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickPicture} />
                  </div>
                  <div className="text-xs sm:text-sm text-ink/55 dark:text-white/55">
                    Upload a profile photo
                    <br />
                    <span className="text-[11px] sm:text-xs">JPG or PNG, square works best.</span>
                  </div>
                </div>

                {/* quick-add social links */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-ink/50 dark:text-white/50">Link your socials</p>
                    <div className="flex items-center gap-1 rounded-full bg-ink/5 p-0.5 dark:bg-white/10">
                      {(["icons", "buttons"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => dispatch(updateDesign({ socialLinksStyle: opt }))}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize transition ${
                            socialLinksStyle === opt
                              ? "bg-white text-ink shadow-sm dark:bg-[#12403c] dark:text-white"
                              : "text-ink/45 dark:text-white/45"
                          }`}
                        >
                          {opt === "icons" ? "Icons" : "Buttons"}
                        </button>
                      ))}
                    </div>
                  </div>
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

                  {/* edit panel for the clicked icon */}
                  {editingSocial && findSocial(editingSocial) && (
                    <div className="mt-3 space-y-3 rounded-2xl bg-mist p-3.5 sm:p-4 dark:bg-white/[0.03]">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-ink dark:text-white">
                          {(() => {
                            const Icon = getSocialIcon(editingSocial);
                            return <Icon size={16} />;
                          })()}
                          {editingSocial}
                        </span>
                        <button
                          onClick={() => removeSocial(editingSocial)}
                          className="flex items-center gap-1 text-xs font-semibold text-rose-500 transition hover:text-rose-600 dark:hover:text-rose-400"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                        <Input
                          label="Username"
                          placeholder="@yourhandle"
                          value={findSocial(editingSocial)?.username || ""}
                          onChange={(e) => updateSocial(editingSocial, { username: e.target.value })}
                        />
                        <Input
                          label="URL"
                          placeholder="https://…"
                          value={findSocial(editingSocial)?.url || ""}
                          onChange={(e) => updateSocial(editingSocial, { url: e.target.value })}
                        />
                      </div>
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

                <Input
                  label="Full name"
                  placeholder="Aarav Mehta"
                  value={draft.personal?.fullName || ""}
                  onChange={(e) => patch("personal", { ...draft.personal, fullName: e.target.value })}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink/80 dark:text-white/80">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    placeholder="A short intro about you…"
                    value={draft.personal?.bio || ""}
                    onChange={(e) => patch("personal", { ...draft.personal, bio: e.target.value })}
                    className="w-full rounded-2xl border-2 border-brand-100 bg-white p-3.5 sm:p-4 text-sm font-medium text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
              </div>
            )}

            {active === "contact" && (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {(
                  [
                    ["email", "Email", "you@example.com"],
                    ["phone", "Phone", "+91 98765 43210"],
                    ["whatsapp", "WhatsApp", "+91 98765 43210"],
                    ["website", "Website", "https://yoursite.com"],
                    ["city", "City", "Mumbai"],
                    ["country", "Country", "India"],
                  ] as const
                ).map(([k, label, ph]) => (
                  <Input
                    key={k}
                    label={label}
                    placeholder={ph}
                    value={(draft.contact?.[k] as string) || ""}
                    onChange={(e) => patch("contact", { ...draft.contact, [k]: e.target.value })}
                  />
                ))}
                <div className="sm:col-span-2">
                  <Input
                    label="Address"
                    placeholder="Street, area…"
                    value={draft.contact?.address || ""}
                    onChange={(e) => patch("contact", { ...draft.contact, address: e.target.value })}
                  />
                </div>
              </div>
            )}

            {active === "education" && (
              <ListEditor<EducationItem>
                items={draft.education || []}
                onChange={(v) => patch("education", v)}
                empty="No education added yet."
                blank={{ institution: "", degree: "", field: "", startYear: "", endYear: "" }}
                addLabel="Add education"
                render={(item, set) => (
                  <>
                    <Input label="Institution" value={item.institution} onChange={(e) => set({ institution: e.target.value })} />
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      <Input label="Degree" value={item.degree || ""} onChange={(e) => set({ degree: e.target.value })} />
                      <Input label="Field" value={item.field || ""} onChange={(e) => set({ field: e.target.value })} />
                    </div>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      <Input label="Start year" value={item.startYear || ""} onChange={(e) => set({ startYear: e.target.value })} />
                      <Input label="End year" value={item.endYear || ""} onChange={(e) => set({ endYear: e.target.value })} />
                    </div>
                  </>
                )}
              />
            )}

            {active === "experience" && (
              <ListEditor<ExperienceItem>
                items={draft.experience || []}
                onChange={(v) => patch("experience", v)}
                empty="No work experience added yet."
                blank={{ company: "", role: "", location: "", startDate: "", endDate: "", description: "" }}
                addLabel="Add experience"
                render={(item, set) => (
                  <>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      <Input label="Company" value={item.company} onChange={(e) => set({ company: e.target.value })} />
                      <Input label="Role" value={item.role || ""} onChange={(e) => set({ role: e.target.value })} />
                    </div>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      <Input label="Start" placeholder="Jan 2022" value={item.startDate || ""} onChange={(e) => set({ startDate: e.target.value })} />
                      <Input label="End" placeholder="Present" value={item.endDate || ""} onChange={(e) => set({ endDate: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-ink/80 dark:text-white/80">
                        Job description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="What did you work on?"
                        value={item.description || ""}
                        onChange={(e) => set({ description: e.target.value })}
                        className="w-full rounded-2xl border-2 border-brand-100 bg-white p-3.5 sm:p-4 text-sm font-medium text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                  </>
                )}
              />
            )}

            {active === "business" && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  <Input label="Business name" value={draft.business?.name || ""} onChange={(e) => patch("business", { ...draft.business, name: e.target.value })} />
                  <Input label="Category" placeholder="Café, Studio…" value={draft.business?.category || ""} onChange={(e) => patch("business", { ...draft.business, category: e.target.value })} />
                </div>
                <Input label="Map URL" placeholder="https://maps.google.com/…" value={draft.business?.mapUrl || ""} onChange={(e) => patch("business", { ...draft.business, mapUrl: e.target.value })} />
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink/80 dark:text-white/80">Description</label>
                  <textarea
                    rows={3}
                    value={draft.business?.description || ""}
                    onChange={(e) => patch("business", { ...draft.business, description: e.target.value })}
                    className="w-full rounded-2xl border-2 border-brand-100 bg-white p-3.5 sm:p-4 text-sm font-medium text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
              </div>
            )}

            {active === "products" && (
              <ListEditor<ProductItem>
                items={draft.products || []}
                onChange={(v) => patch("products", v)}
                empty="No products or services yet."
                blank={{ name: "", price: "", description: "", link: "" }}
                addLabel="Add product"
                render={(item, set) => (
                  <>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      <Input label="Name" value={item.name} onChange={(e) => set({ name: e.target.value })} />
                      <Input label="Price" placeholder="₹499" value={item.price || ""} onChange={(e) => set({ price: e.target.value })} />
                    </div>
                    <Input label="Link" placeholder="https://…" value={item.link || ""} onChange={(e) => set({ link: e.target.value })} />
                  </>
                )}
              />
            )}

            {/* bottom section option switcher */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink/5 pt-5 dark:border-white/5">
              {prevSection ? (
                <button
                  type="button"
                  onClick={goToPrev}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-mist px-4 py-2.5 text-xs sm:text-sm font-bold text-ink/70 transition hover:bg-ink/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
                >
                  <ChevronLeft size={16} /> Previous: {prevSection.label}
                </button>
              ) : <div />}

              {nextSection ? (
                <button
                  type="button"
                  onClick={goToNext}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-soft transition hover:bg-brand-600"
                >
                  Next: {nextSection.label} <ChevronRight size={16} />
                </button>
              ) : (
                <Button onClick={onSave} loading={saving} className="text-xs sm:text-sm">
                  <Save size={16} /> Save profile 🎉
                </Button>
              )}
            </div>
          </div>

          {/* section tabs, vertical, left side */}
          <div
            ref={tabsRef}
            className="no-scrollbar order-1 flex gap-1.5 overflow-x-auto py-1 px-0.5 touch-pan-x scroll-smooth lg:flex-col lg:gap-2 lg:overflow-visible lg:px-0 lg:py-0"
          >
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                data-tab-key={s.key}
                onClick={() => setActive(s.key)}
                className={`inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold transition active:scale-[0.98] lg:w-full ${
                  active === s.key
                    ? "bg-brand-500 text-white shadow-soft ring-2 ring-brand-500/20"
                    : "bg-white text-ink/60 ring-1 ring-ink/[0.06] hover:text-brand-600 dark:bg-[#12403c] dark:text-white/60 dark:ring-white/[0.06]"
                }`}
              >
                <s.icon size={15} /> {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* live preview */}
        <div id="live-preview" className="xl:sticky xl:top-24 xl:self-start">
          <ProfilePreview profile={draft} avatarUrl={previewAvatar} username={authUser?.username} />
        </div>
      </div>

      {socialPickerOpen && (
        <SocialIconPicker
          query={socialQuery}
          onQueryChange={setSocialQuery}
          onBack={() => setSocialPickerOpen(false)}
          onClose={() => setSocialPickerOpen(false)}
          onPick={openSocialEditor}
        />
      )}

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
    </AppShell>
  );
}

/* ---- "Add social icon" picker modal ---- */
function SocialIconPicker({
  query,
  onQueryChange,
  onBack,
  onClose,
  onPick,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  onBack: () => void;
  onClose: () => void;
  onPick: (platform: string) => void;
}) {
  const filtered = ALL_SOCIAL_PLATFORMS.filter((p) =>
    p.platform.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-sm flex-col rounded-t-3xl bg-white shadow-soft-lg sm:max-h-[80vh] sm:rounded-3xl dark:bg-[#12403c]"
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <button
            onClick={onBack}
            aria-label="Back"
            className="grid h-8 w-8 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 dark:text-white/60 dark:hover:bg-white/10"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-display text-base font-black text-ink dark:text-white">Add social icon</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 dark:text-white/60 dark:hover:bg-white/10"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* search */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 rounded-2xl bg-mist px-3.5 py-2.5 dark:bg-white/5">
            <Search size={16} className="text-ink/40 dark:text-white/40" />
            <input
              autoFocus
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink/40 dark:text-white dark:placeholder:text-white/40"
            />
          </div>
        </div>

        {/* list */}
        <div className="mt-2 flex-1 overflow-y-auto px-2 pb-4">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink/45 dark:text-white/45">
              No platforms match &ldquo;{query}&rdquo;
            </p>
          ) : (
            filtered.map(({ platform, icon: Icon }) => (
              <button
                key={platform}
                type="button"
                onClick={() => onPick(platform)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-mist dark:hover:bg-white/5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/5 text-ink dark:bg-white/10 dark:text-white">
                  <Icon size={17} />
                </span>
                <span className="flex-1 text-sm font-bold text-ink dark:text-white">{platform}</span>
                <ChevronRight size={16} className="text-ink/30 dark:text-white/30" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- generic repeatable list editor ---- */
function ListEditor<T extends object>({
  items,
  onChange,
  render,
  blank,
  addLabel,
  empty,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, set: (patch: Partial<T>) => void) => React.ReactNode;
  blank: T;
  addLabel: string;
  empty: string;
}) {
  const update = (i: number, p: Partial<T>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...p } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="rounded-2xl bg-mist py-8 text-center text-sm text-ink/45 dark:bg-white/[0.03] dark:text-white/45">
          {empty}
        </p>
      )}
      {items.map((item, i) => (
        <div key={i} className="relative space-y-3 rounded-2xl bg-mist p-3.5 sm:p-4.5 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-ink/5 pb-2.5 dark:border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink/40 dark:text-white/40">
              Entry #{i + 1}
            </span>
            <button
              onClick={() => remove(i)}
              className="flex items-center gap-1 text-xs font-semibold text-rose-500 transition hover:text-rose-600 dark:hover:text-rose-400"
              aria-label="Remove item"
            >
              <Trash2 size={14} />
              <span>Remove</span>
            </button>
          </div>
          {render(item, (p) => update(i, p))}
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { ...blank }])}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 py-3 text-sm font-bold text-brand-600 transition hover:border-brand-400 hover:bg-brand-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
      >
        <Plus size={16} /> {addLabel}
      </button>
    </div>
  );
}
