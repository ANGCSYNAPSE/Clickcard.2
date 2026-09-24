import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import sanitizeHtml from "sanitize-html";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  Share2,
  IndianRupee,
  Users,
  Star,
  MessageSquare,
  Calendar,
  Landmark,
  User as UserIcon,
  Wallet,
  ExternalLink,
  X as CloseIcon,
} from "lucide-react";
import { SiX, SiFacebook, SiInstagram } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import type { IconType } from "react-icons";
import type { BusinessDocument, BusinessLocation } from "@/types";
import Button from "@/components/ui/Button";

// Tiptap touches the DOM at module scope — keep it out of the server bundle
// and out of the initial client bundle for visitors who never open the editor.
const RichTextEditor = dynamic(() => import("@/components/app/RichTextEditor"), { ssr: false });

export interface ShowcaseProfile {
  company_name: string;
  slug?: string;
  category?: string | null;
  description?: string | null;
  about?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  founded?: string | null;
  funding?: string | null;
  founder?: string | null;
  employee_count?: string | null;
  revenue?: string | null;
  rating?: number | string | null;
  review_count?: number | null;
  gender_male_percent?: number | null;
  gender_female_percent?: number | null;
  locations?: BusinessLocation[];
  linkedin_url?: string | null;
  twitter_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  documents?: BusinessDocument[];
}

const normalizeUrl = (url: string) => (/^https?:\/\//.test(url) ? url : `https://${url}`);

/** Sanitizes the rich-text About HTML before rendering it with
 * dangerouslySetInnerHTML. Uses `sanitize-html` (pure JS, no jsdom) rather
 * than isomorphic-dompurify — that package's Node/jsdom path routinely fails
 * to bundle correctly under Vercel's serverless output tracing, which was
 * crashing this page (500 FUNCTION_INVOCATION_FAILED) for any profile whose
 * About section actually had content. */
const sanitizeAboutHtml = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "a", "img", "ul", "ol", "li", "span",
      "h1", "h2", "h3", "h4", "blockquote", "code", "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      span: ["style"],
      p: ["style"],
    },
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/],
        "font-family": [/^[\w\s,'"-]+$/],
        "font-size": [/^\d+(\.\d+)?(px|em|rem|%)$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
  });

/**
 * Shared "company page" layout — cover banner, overlapping identity card,
 * tabs, stat cards and a sidebar — used by both the owner's private detail
 * page and the public shareable page so the two never visually drift apart.
 * `documentsSlot` lets the owner page inject its upload/list UI into the
 * Documents tab; the public API never returns documents, so that tab is
 * simply absent when it's not supplied.
 */
export default function BusinessShowcase({
  profile,
  backHref,
  onEdit,
  onShare,
  onDelete,
  ctaHref,
  documentsSlot,
  onSaveAbout,
  savingAbout,
}: {
  profile: ShowcaseProfile;
  backHref?: string;
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  ctaHref?: string;
  /** Owner-only — lets the About card be edited in place instead of through
   * the big edit form. Omitted entirely on the public share page. */
  onSaveAbout?: (html: string) => Promise<void> | void;
  savingAbout?: boolean;
  documentsSlot?: React.ReactNode;
}) {
  const hasLocations = (profile.locations?.length || 0) > 0;
  const tabsList = [
    { id: "overview", label: "Overview" },
    ...(documentsSlot ? [{ id: "documents", label: "Documents" }] : []),
  ] as const;
  const [tab, setTab] = useState<(typeof tabsList)[number]["id"]>("overview");

  const hasStats = Boolean(profile.revenue || profile.employee_count || profile.review_count != null || profile.rating != null);
  const hasOrgStatus = Boolean(profile.founded || profile.category || profile.funding || profile.founder);
  const hasGender = profile.gender_male_percent != null || profile.gender_female_percent != null;
  const hasSocial = Boolean(
    profile.website || profile.linkedin_url || profile.twitter_url || profile.facebook_url || profile.instagram_url,
  );
  const hasContact = Boolean(profile.email || profile.phone);

  return (
    <div className="min-h-screen bg-paper-soft dark:bg-dark">
      {/* Cover — full width of its own container. On the dashboard, the
          caller cancels AppShell's padding around this whole component so
          it bleeds edge to edge; the public share page has no such padding
          to begin with, so this stays plain there to avoid overflow. */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary to-secondary sm:h-96 lg:h-[30rem]">
        {profile.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.cover_url} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/10" />
        {backHref && (
          <Link
            href={backHref}
            aria-label="Back"
            className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur transition hover:bg-white sm:left-6 sm:top-6"
          >
            <ArrowLeft size={18} />
          </Link>
        )}
        {profile.website && (
          <a
            href={normalizeUrl(profile.website)}
            target="_blank"
            rel="noreferrer"
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-ink shadow-soft backdrop-blur transition hover:bg-white sm:right-6 sm:top-6"
          >
            Go to Website <ExternalLink size={13} />
          </a>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Overlapping identity card */}
        <div className="relative -mt-20 rounded-3xl border border-ink/5 bg-white p-5 shadow-soft-lg dark:border-white/5 dark:bg-[#262626] sm:-mt-40 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary text-white ring-4 ring-white shadow-soft dark:ring-[#262626] sm:h-24 sm:w-24">
              {profile.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.logo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 size={32} />
              )}
            </span>

            {(onEdit || onShare || onDelete) && (
              <div className="flex flex-wrap items-center gap-2">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-ink/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    <Pencil size={14} /> Edit Profile
                  </button>
                )}
                {onShare && (
                  <button
                    onClick={onShare}
                    aria-label="Share"
                    className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white text-ink/60 transition hover:bg-ink/5 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
                  >
                    <Share2 size={16} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    aria-label="Delete"
                    className="grid h-10 w-10 place-items-center rounded-full border border-rose-200 bg-white text-rose-500 transition hover:bg-rose-50 dark:border-rose-500/20 dark:bg-white/5 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          <h1 className="mt-4 font-display text-2xl font-black text-ink dark:text-white sm:text-3xl">
            {profile.company_name}
          </h1>
          {profile.address && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/50 dark:text-white/50">
              <MapPin size={14} className="shrink-0" /> {profile.address}
            </p>
          )}
          {profile.description && (
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-ink/65 dark:text-white/65">
              {profile.description}
            </p>
          )}

          {hasSocial && (
            <div className="mt-4 flex items-center gap-2.5">
              {profile.website && <SocialIcon href={normalizeUrl(profile.website)} icon={Globe} />}
              {profile.linkedin_url && <SocialIcon href={profile.linkedin_url} icon={FaLinkedin} />}
              {profile.twitter_url && <SocialIcon href={profile.twitter_url} icon={SiX} />}
              {profile.facebook_url && <SocialIcon href={profile.facebook_url} icon={SiFacebook} />}
              {profile.instagram_url && <SocialIcon href={profile.instagram_url} icon={SiInstagram} />}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-1 overflow-x-auto border-b border-ink/10 dark:border-white/10">
          {tabsList.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition ${
                tab === t.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-300"
                  : "border-transparent text-ink/50 hover:text-ink dark:text-white/50 dark:hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={`grid gap-6 py-6 ${tab === "documents" ? "" : "lg:grid-cols-3 lg:gap-8"}`}>
          <div className={`space-y-6 ${tab === "documents" ? "" : "lg:col-span-2"}`}>
            {tab === "overview" && (
              <>
                {hasStats && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {profile.revenue && (
                      <StatCard icon={IndianRupee} label="Revenue" value={profile.revenue} tone="amber" />
                    )}
                    {profile.employee_count && (
                      <StatCard icon={Users} label="Employees" value={profile.employee_count} tone="blue" />
                    )}
                    {profile.review_count != null && (
                      <StatCard icon={MessageSquare} label="Reviews" value={String(profile.review_count)} tone="violet" />
                    )}
                    {profile.rating != null && (
                      <StatCard icon={Star} label="Rating" value={String(profile.rating)} tone="yellow" />
                    )}
                  </div>
                )}
                {(profile.about || onSaveAbout) && (
                  <AboutCard
                    companyName={profile.company_name}
                    about={profile.about}
                    onSave={onSaveAbout}
                    saving={savingAbout}
                  />
                )}
              </>
            )}

            {tab === "documents" && documentsSlot}
          </div>

          {/* Sidebar — hidden on the Documents tab so the file grid gets the full width */}
          {tab !== "documents" && (
            <div className="space-y-4">
              {hasGender && (
                <Card title="Employees by gender">
                  <GenderBar male={profile.gender_male_percent} female={profile.gender_female_percent} />
                </Card>
              )}
              {hasOrgStatus && (
                    <Card title="Organization status">
                      <div className="space-y-3">
                        {profile.founded && <SidebarRow icon={Calendar} label="Founded" value={profile.founded} />}
                        {profile.category && <SidebarRow icon={Landmark} label="Industry" value={profile.category} />}
                        {profile.funding && <SidebarRow icon={Wallet} label="Funding" value={profile.funding} />}
                        {profile.founder && <SidebarRow icon={UserIcon} label="Founder" value={profile.founder} />}
                      </div>
                    </Card>
              )}
              {hasContact && (
                <Card title="Contact">
                  <ContactRows profile={profile} />
                </Card>
              )}



              {hasLocations && (
                <Card title="Locations">
                  <div className="space-y-3">
                    {profile.locations!.map((loc, i) => (
                      <div key={i}>
                        <p className="text-sm font-bold text-ink dark:text-white">{loc.label || "Location"}</p>
                        {loc.address && <p className="text-xs text-ink/50 dark:text-white/50">{loc.address}</p>}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {ctaHref && (
          <div className="pb-12 text-center">
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:opacity-90"
            >
              Create your own ClickCard
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactRows({ profile }: { profile: ShowcaseProfile }) {
  return (
    <div className="space-y-2">
      {profile.email && (
        <a
          href={`mailto:${profile.email}`}
          className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper-tint dark:bg-white/5 dark:text-white"
        >
          <Mail size={16} className="shrink-0 text-ink/40 dark:text-white/40" />
          <span className="min-w-0 truncate">{profile.email}</span>
        </a>
      )}
      {profile.phone && (
        <a
          href={`tel:${profile.phone}`}
          className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper-tint dark:bg-white/5 dark:text-white"
        >
          <Phone size={16} className="shrink-0 text-ink/40 dark:text-white/40" />
          <span className="min-w-0 truncate">{profile.phone}</span>
        </a>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft dark:border-white/5 dark:bg-[#262626]">
      <h2 className="font-display text-lg font-black text-ink dark:text-white">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** The About card — read-only HTML render for everyone, with an inline
 * rich-text editor for the owner (only when `onSave` is supplied). */
function AboutCard({
  companyName,
  about,
  onSave,
  saving,
}: {
  companyName: string;
  about?: string | null;
  onSave?: (html: string) => Promise<void> | void;
  saving?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(about || "");

  const startEditing = () => {
    setDraft(about || "");
    setEditing(true);
  };

  const save = async () => {
    if (onSave) await onSave(draft);
    setEditing(false);
  };

  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft dark:border-white/5 dark:bg-[#262626]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-black text-ink dark:text-white">About {companyName}</h2>
        {onSave && !editing && (
          <button
            onClick={startEditing}
            aria-label="Edit about"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink/50 transition hover:bg-ink/5 dark:text-white/50 dark:hover:bg-white/10"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      <div className="mt-3">
        {editing ? (
          <div className="space-y-3">
            <RichTextEditor value={draft} onChange={setDraft} placeholder={`Tell people about ${companyName}…`} autoFocus />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Cancel"
                className="grid h-9 w-9 place-items-center rounded-full text-ink/50 transition hover:bg-ink/5 dark:text-white/50 dark:hover:bg-white/10"
              >
                <CloseIcon size={16} />
              </button>
              <Button size="sm" loading={saving} onClick={save}>
                Save
              </Button>
            </div>
          </div>
        ) : about ? (
          <div
            className="tiptap-content max-w-none text-sm leading-relaxed text-ink/60 dark:text-white [&_a]:text-brand-600 [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: sanitizeAboutHtml(about) }}
          />
        ) : (
          <button
            onClick={startEditing}
            className="text-sm font-semibold text-ink/40 transition hover:text-brand-600 dark:text-white/40"
          >
            Add an About section…
          </button>
        )}
      </div>
    </div>
  );
}

const STAT_TONES = {
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  // "yellow" is a flat brand color in tailwind.config.ts (not a shade scale),
  // so the usual bg-yellow-100/text-yellow-600 utilities don't exist.
  yellow: "bg-yellow/15 text-yellow-hover dark:bg-yellow/20 dark:text-yellow",
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof IndianRupee;
  label: string;
  value: string;
  tone: keyof typeof STAT_TONES;
}) {
  return (
    <div className="rounded-2xl border border-ink/5 bg-white p-4 shadow-soft dark:border-white/5 dark:bg-[#262626]">
      <span className={`grid h-8 w-8 place-items-center rounded-xl ${STAT_TONES[tone]}`}>
        <Icon size={15} />
      </span>
      <p className="mt-2.5 text-xs font-semibold text-ink/50 dark:text-white/50">{label}</p>
      <p className="mt-0.5 truncate text-lg font-black text-ink dark:text-white">{value}</p>
    </div>
  );
}

function SidebarRow({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-ink/50 dark:text-white/50">
        <Icon size={14} className="shrink-0" /> {label}
      </span>
      <span className="text-right font-semibold text-ink dark:text-white">{value}</span>
    </div>
  );
}

function SocialIcon({ href, icon: Icon }: { href: string; icon: typeof Globe | IconType }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="grid h-9 w-9 place-items-center rounded-full bg-mist text-ink/60 transition hover:bg-brand-50 hover:text-brand-600 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
    >
      <Icon size={16} />
    </a>
  );
}

function GenderBar({ male, female }: { male?: number | null; female?: number | null }) {
  const m = male ?? 0;
  const f = female ?? 0;
  const other = Math.max(0, 100 - m - f);
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-mist dark:bg-white/10">
        {m > 0 && <div className="h-full bg-emerald-500" style={{ width: `${m}%` }} />}
        {f > 0 && <div className="h-full bg-amber-400" style={{ width: `${f}%` }} />}
        {other > 0 && <div className="h-full bg-ink/15 dark:bg-white/20" style={{ width: `${other}%` }} />}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-ink/60 dark:text-white/60">
        {male != null && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Male {male}%
          </span>
        )}
        {female != null && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Female {female}%
          </span>
        )}
      </div>
    </div>
  );
}
