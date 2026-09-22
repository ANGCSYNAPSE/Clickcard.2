import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { SiX, SiFacebook } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import type { IconType } from "react-icons";
import type { BusinessDocument, BusinessLocation } from "@/types";

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
  documents?: BusinessDocument[];
}

const normalizeUrl = (url: string) => (/^https?:\/\//.test(url) ? url : `https://${url}`);

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
}: {
  profile: ShowcaseProfile;
  backHref?: string;
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  ctaHref?: string;
  documentsSlot?: React.ReactNode;
}) {
  const hasLocations = (profile.locations?.length || 0) > 0;
  const tabsList = [
    { id: "overview", label: "Overview" },
    { id: "about", label: "About" },
    ...(documentsSlot ? [{ id: "documents", label: "Documents" }] : []),
    ...(hasLocations ? [{ id: "locations", label: "Locations" }] : []),
  ] as const;
  const [tab, setTab] = useState<(typeof tabsList)[number]["id"]>("overview");

  const hasStats = Boolean(profile.revenue || profile.employee_count || profile.review_count != null || profile.rating != null);
  const hasOrgStatus = Boolean(profile.founded || profile.category || profile.funding || profile.founder);
  const hasGender = profile.gender_male_percent != null || profile.gender_female_percent != null;
  const hasSocial = Boolean(profile.website || profile.linkedin_url || profile.twitter_url || profile.facebook_url);
  const hasContact = Boolean(profile.email || profile.phone || profile.website || profile.address);

  return (
    <div className="min-h-screen bg-paper-soft dark:bg-dark">
      {/* Cover */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-primary to-secondary sm:h-56 lg:h-72">
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
        <div className="relative -mt-12 rounded-3xl border border-ink/5 bg-white p-5 shadow-soft-lg dark:border-white/5 dark:bg-[#262626] sm:-mt-16 sm:p-8">
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
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/65 dark:text-white/65">
              {profile.description}
            </p>
          )}

          {hasSocial && (
            <div className="mt-4 flex items-center gap-2.5">
              {profile.website && <SocialIcon href={normalizeUrl(profile.website)} icon={Globe} />}
              {profile.linkedin_url && <SocialIcon href={profile.linkedin_url} icon={FaLinkedin} />}
              {profile.twitter_url && <SocialIcon href={profile.twitter_url} icon={SiX} />}
              {profile.facebook_url && <SocialIcon href={profile.facebook_url} icon={SiFacebook} />}
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
        <div className="grid gap-6 py-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2">
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
                {profile.about && (
                  <Card title={`About ${profile.company_name}`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/60 dark:text-white/60">
                      {profile.about}
                    </p>
                  </Card>
                )}
              </>
            )}

            {tab === "about" && (
              <Card title={`About ${profile.company_name}`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/60 dark:text-white/60">
                  {profile.about || "No description added yet."}
                </p>
              </Card>
            )}

            {tab === "documents" && documentsSlot}

            {tab === "locations" && hasLocations && (
              <div className="space-y-3">
                {profile.locations!.map((loc, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-ink/5 bg-white p-4 shadow-soft dark:border-white/5 dark:bg-[#262626]"
                  >
                    {loc.label && <p className="font-bold text-ink dark:text-white">{loc.label}</p>}
                    {loc.address && <p className="mt-1 text-sm text-ink/60 dark:text-white/60">{loc.address}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {hasContact && (
              <Card title="Contact">
                <ContactRows profile={profile} />
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

            {hasGender && (
              <Card title="Employees by gender">
                <GenderBar male={profile.gender_male_percent} female={profile.gender_female_percent} />
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
        </div>

        {ctaHref && (
          <div className="pb-12 text-center">
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-secondary px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:opacity-90"
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
      {profile.website && (
        <a
          href={normalizeUrl(profile.website)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm font-semibold text-ink transition hover:bg-paper-tint dark:bg-white/5 dark:text-white"
        >
          <Globe size={16} className="shrink-0 text-ink/40 dark:text-white/40" />
          <span className="min-w-0 truncate">{profile.website}</span>
        </a>
      )}
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
      {profile.address && (
        <div className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 text-sm font-semibold text-ink dark:bg-white/5 dark:text-white">
          <MapPin size={16} className="shrink-0 text-ink/40 dark:text-white/40" />
          <span className="min-w-0 truncate">{profile.address}</span>
        </div>
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

const STAT_TONES = {
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-300",
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof DollarSign;
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
