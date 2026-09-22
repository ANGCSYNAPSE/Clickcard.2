import { useEffect, useRef, useState } from "react";
import { X, Camera, FileText, Upload, Trash2, Building2, Image as ImageIcon, Plus } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { BusinessLocation, BusinessProfile } from "@/types";
import type { BusinessProfileInput } from "@/services/businessProfileService";

export interface BusinessProfileFiles {
  logo: File | null;
  cover: File | null;
  documents: File[];
}

const formatBytes = (bytes: number) => {
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="pb-1 pt-2 text-xs font-black uppercase tracking-wider text-ink/40 dark:text-white/35">
    {children}
  </p>
);

/** Create/edit form for a single company business profile. Multiple of
 * these can exist per user — this modal only ever edits one at a time.
 * A logo/cover and any documents picked here are staged locally and only
 * actually uploaded once the profile itself has been saved (so there's
 * an id to attach them to) — the caller's `onSave` handles that. */
export default function BusinessProfileModal({
  profile,
  saving,
  onSave,
  onClose,
}: {
  profile?: BusinessProfile | null;
  saving?: boolean;
  onSave: (input: BusinessProfileInput, files: BusinessProfileFiles) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<BusinessProfileInput>({
    company_name: profile?.company_name || "",
    category: profile?.category || "",
    description: profile?.description || "",
    about: profile?.about || "",
    website: profile?.website || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    founded: profile?.founded || "",
    funding: profile?.funding || "",
    founder: profile?.founder || "",
    employee_count: profile?.employee_count || "",
    revenue: profile?.revenue || "",
    rating: profile?.rating ?? "",
    review_count: profile?.review_count ?? "",
    gender_male_percent: profile?.gender_male_percent ?? "",
    gender_female_percent: profile?.gender_female_percent ?? "",
    linkedin_url: profile?.linkedin_url || "",
    twitter_url: profile?.twitter_url || "",
    facebook_url: profile?.facebook_url || "",
  });
  const [locations, setLocations] = useState<BusinessLocation[]>(profile?.locations || []);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!logo) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logo);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);

  useEffect(() => {
    if (!cover) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(cover);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  const set = <K extends keyof BusinessProfileInput>(key: K, value: BusinessProfileInput[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const onLogoChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) setLogo(file);
  };

  const onCoverChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) setCover(file);
  };

  const onDocsChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length) setDocuments((d) => [...d, ...files]);
  };

  const removeDocAt = (index: number) =>
    setDocuments((d) => d.filter((_, i) => i !== index));

  const addLocation = () => setLocations((l) => [...l, { label: "", address: "" }]);
  const updateLocation = (i: number, patch: Partial<BusinessLocation>) =>
    setLocations((l) => l.map((loc, idx) => (idx === i ? { ...loc, ...patch } : loc)));
  const removeLocation = (i: number) => setLocations((l) => l.filter((_, idx) => idx !== i));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.company_name.trim()) return;
    onSave({ ...values, locations: locations.filter((l) => l.label?.trim() || l.address?.trim()) }, { logo, cover, documents });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-soft-lg dark:bg-[#262626] border border-ink/5 dark:border-white/5 max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-ink/5 px-6 py-4 dark:border-white/5">
          <h3 className="font-display text-base font-black text-ink dark:text-white">
            {profile ? "Edit business profile" : "New business profile"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 dark:text-white/60 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        <div className="no-scrollbar space-y-4 overflow-y-auto px-6 py-5">
          {/* Cover */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink/80 dark:text-white/80">
              Cover image
            </label>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-ink/15 bg-mist transition hover:border-brand-300 dark:border-white/10 dark:bg-white/5"
            >
              {coverPreview || profile?.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverPreview || profile?.cover_url!} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-1 text-ink/40 dark:text-white/40">
                  <ImageIcon size={20} />
                  <span className="text-xs font-bold">Upload cover image</span>
                </span>
              )}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={onCoverChosen}
            />
          </div>

          {/* Logo */}
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
              {logoPreview || profile?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview || profile?.logo_url!} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 size={24} />
              )}
            </span>
            <div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 bg-white px-3.5 py-2 text-xs font-bold text-ink transition hover:bg-ink/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <Camera size={14} /> {logo ? "Change logo" : "Upload logo"}
              </button>
              {logo && <p className="mt-1.5 truncate text-xs text-ink/45 dark:text-white/45">{logo.name}</p>}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onLogoChosen}
              />
            </div>
          </div>

          <Input
            label="Company name *"
            placeholder="Acme Corp"
            value={values.company_name}
            onChange={(e) => set("company_name", e.target.value)}
            autoFocus
          />
          <Input
            label="Industry / Category"
            placeholder="e.g. Software, Retail, Consulting"
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink/80 dark:text-white/80">
              Bio
            </label>
            <textarea
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="A short one-liner shown under your company name"
              rows={2}
              className="no-scrollbar w-full rounded-2xl border-2 border-brand-100 bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition-all placeholder:text-ink/35 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink/80 dark:text-white/80">
              About
            </label>
            <textarea
              value={values.about}
              onChange={(e) => set("about", e.target.value)}
              placeholder="The fuller company description shown in the About section"
              rows={4}
              className="no-scrollbar w-full rounded-2xl border-2 border-brand-100 bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition-all placeholder:text-ink/35 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Website"
              placeholder="https://…"
              value={values.website}
              onChange={(e) => set("website", e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              placeholder="contact@company.com"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              placeholder="+91 98765 43210"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            <Input
              label="Address"
              placeholder="City, Country"
              value={values.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>

          {/* Organization status */}
          <SectionLabel>Organization status</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Founded"
              placeholder="e.g. 2018"
              value={values.founded}
              onChange={(e) => set("founded", e.target.value)}
            />
            <Input
              label="Funding"
              placeholder="e.g. $2M Seed"
              value={values.funding}
              onChange={(e) => set("funding", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Founder"
              placeholder="Founder's name"
              value={values.founder}
              onChange={(e) => set("founder", e.target.value)}
            />
            <Input
              label="Employees"
              placeholder="e.g. 2.5K"
              value={values.employee_count}
              onChange={(e) => set("employee_count", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Revenue"
              placeholder="e.g. 2.5B"
              value={values.revenue}
              onChange={(e) => set("revenue", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Rating"
                type="number"
                step="0.1"
                min={0}
                max={5}
                placeholder="4.5"
                value={values.rating}
                onChange={(e) => set("rating", e.target.value)}
              />
              <Input
                label="Reviews"
                type="number"
                min={0}
                placeholder="120"
                value={values.review_count}
                onChange={(e) => set("review_count", e.target.value)}
              />
            </div>
          </div>

          {/* Employees by gender */}
          <SectionLabel>Employees by gender</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Male %"
              type="number"
              min={0}
              max={100}
              placeholder="60"
              value={values.gender_male_percent}
              onChange={(e) => set("gender_male_percent", e.target.value)}
            />
            <Input
              label="Female %"
              type="number"
              min={0}
              max={100}
              placeholder="40"
              value={values.gender_female_percent}
              onChange={(e) => set("gender_female_percent", e.target.value)}
            />
          </div>

          {/* Social links */}
          <SectionLabel>Social links</SectionLabel>
          <Input
            label="LinkedIn"
            placeholder="https://linkedin.com/company/…"
            value={values.linkedin_url}
            onChange={(e) => set("linkedin_url", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="X / Twitter"
              placeholder="https://x.com/…"
              value={values.twitter_url}
              onChange={(e) => set("twitter_url", e.target.value)}
            />
            <Input
              label="Facebook"
              placeholder="https://facebook.com/…"
              value={values.facebook_url}
              onChange={(e) => set("facebook_url", e.target.value)}
            />
          </div>

          {/* Locations */}
          <div>
            <div className="mb-1.5 flex items-center justify-between pt-2">
              <SectionLabel>Locations</SectionLabel>
              <button
                type="button"
                onClick={addLocation}
                className="flex items-center gap-1 text-xs font-bold text-brand-600 transition hover:text-brand-700 dark:text-brand-300"
              >
                <Plus size={13} /> Add location
              </button>
            </div>
            {locations.length > 0 ? (
              <div className="space-y-2">
                {locations.map((loc, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-2xl bg-paper-soft p-3 dark:bg-white/5">
                    <div className="grid flex-1 grid-cols-2 gap-2">
                      <input
                        value={loc.label || ""}
                        onChange={(e) => updateLocation(i, { label: e.target.value })}
                        placeholder="e.g. Head Office"
                        className="h-10 rounded-xl border border-ink/10 bg-white px-3 text-xs font-semibold text-ink outline-none focus:border-brand-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                      <input
                        value={loc.address || ""}
                        onChange={(e) => updateLocation(i, { address: e.target.value })}
                        placeholder="City, Country"
                        className="h-10 rounded-xl border border-ink/10 bg-white px-3 text-xs font-semibold text-ink outline-none focus:border-brand-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLocation(i)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/45 transition hover:bg-white hover:text-rose-500 dark:text-white/45 dark:hover:bg-white/10"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink/40 dark:text-white/40">No office locations added yet.</p>
            )}
          </div>

          {/* Documents */}
          <div>
            <div className="mb-1.5 flex items-center justify-between pt-2">
              <SectionLabel>Documents</SectionLabel>
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="flex items-center gap-1 text-xs font-bold text-brand-600 transition hover:text-brand-700 dark:text-brand-300"
              >
                <Upload size={13} /> Add documents
              </button>
              <input
                ref={docInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/png,image/jpeg"
                className="hidden"
                onChange={onDocsChosen}
              />
            </div>
            {documents.length > 0 ? (
              <div className="space-y-1.5">
                {documents.map((file, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-2 rounded-xl bg-paper-soft px-3 py-2 dark:bg-white/5"
                  >
                    <FileText size={14} className="shrink-0 text-ink/45 dark:text-white/45" />
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink/70 dark:text-white/70">
                      {file.name}
                    </span>
                    <span className="shrink-0 text-[10px] text-ink/35 dark:text-white/35">
                      {formatBytes(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDocAt(i)}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded text-ink/45 transition hover:bg-white hover:text-rose-500 dark:text-white/45 dark:hover:bg-white/10"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink/40 dark:text-white/40">
                {profile ? "No new documents selected." : "Optional — you can also add these later."}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-ink/5 px-6 py-4 dark:border-white/5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!values.company_name.trim()}>
            {profile ? "Save changes" : "Create profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
