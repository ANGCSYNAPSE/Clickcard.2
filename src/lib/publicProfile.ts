/**
 * Public profile data for the SSR page at /[slug].
 *
 * BACKEND TO ADD: a public, unauthenticated endpoint that returns a profile by
 * username/slug, e.g.  GET /api/profile/public/:slug  →  PublicProfile
 * (the current Swagger only exposes the *authenticated* /api/users/profile/full).
 * Until it exists, real slugs render the graceful "not found" state and the
 * reserved slug `demo` renders the bundled sample so the design is viewable.
 */

export interface PublicSocial {
  platform: string;
  url: string;
  username?: string;
  label?: string;
}
export interface PublicProduct {
  name: string;
  price?: string;
  description?: string;
  link?: string;
}
export interface PublicExperience {
  company: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}
export interface PublicEducation {
  institution: string;
  degree?: string;
  field?: string;
  startYear?: string;
  endYear?: string;
}
export interface PublicHours {
  day: string;
  open?: string;
  close?: string;
  closed?: boolean;
}

/**
 * The Studio design, as saved into digitalCard.design (see
 * store/slices/designSlice.ts DesignState for where it's written). Optional
 * fields throughout since older/legacy profiles never saved one.
 */
export interface PublicCardDesign {
  primary?: string;
  accent?: string;
  theme?: "light" | "dark";
  wallpaperType?: "fill" | "gradient" | "blur" | "pattern" | "image" | "video";
  backgroundImageUrl?: string;
  backgroundColor?: string;
  gradientColor?: string;
  gradientColorEnd?: string;
  gradientDirection?: "up" | "down" | "radial";
  noise?: boolean;
  patternIndex?: number;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonStyle?: "solid" | "glass" | "outline";
  buttonRoundness?: "sharp" | "slight" | "medium" | "full";
  buttonShadow?: "none" | "soft" | "strong" | "hard";
  socialLinksStyle?: "buttons" | "icons";
  pageFont?: string;
  pageTextColor?: string;
  matchTitleFont?: boolean;
  titleFont?: string;
  titleColor?: string;
  titleFontSize?: number;
  bioFontSize?: number;
  bodyFontSize?: number;
  headerLayout?: "classic" | "hero" | "banner" | "cutout" | "shape";
  bannerUrl?: string;
}

export interface PublicProfile {
  username: string;
  isPublic: boolean;
  fullName?: string;
  tagline?: string;
  bio?: string;
  profilePicture?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  city?: string;
  country?: string;
  social?: PublicSocial[];
  experience?: PublicExperience[];
  education?: PublicEducation[];
  products?: PublicProduct[];
  business?: {
    name?: string;
    category?: string;
    description?: string;
    mapUrl?: string;
    hours?: PublicHours[];
  };
  views?: number;
  updatedAt?: string;
  design?: PublicCardDesign;
}

import { API_BASE_URL } from "./config";

const API_BASE = API_BASE_URL;

/** Public profile endpoint: resolves by slug, short code, or user id. */
export const publicProfilePath = (slug: string) =>
  `${API_BASE}/api/public/profile/${encodeURIComponent(slug)}`;

/**
 * Fire-and-forget analytics tracker for the public profile.
 * Records profile_view / link_tap / pdf_download into the owner's dashboard.
 */
export function trackEvent(payload: {
  type: "profile_view" | "link_tap" | "pdf_download" | "card_share";
  slug?: string;
  userId?: number;
  linkKey?: string;
  meta?: Record<string, unknown>;
}): void {
  try {
    const body = JSON.stringify(payload);
    const url = `${API_BASE}/api/analytics/track`;
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* swallow */
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Maps the backend's sectioned, snake_case payload to our flat PublicProfile. */
function mapApiProfile(slug: string, d: any): PublicProfile {
  const personal = d.personal_identity || {};
  const contact = d.contact_information || {};
  const biz = d.business_details || {};
  const digitalCard = d.digital_card ?? d.digitalCard ?? {};

  // social_links may be an array [{platform,url}] or an object { platform: url }.
  let social: PublicSocial[] = [];
  const sl = d.social_links;
  if (Array.isArray(sl)) {
    social = sl
      .filter((s: any) => s?.url)
      .map((s: any) => ({
        platform: s.platform || s.label || "Link",
        url: s.url,
        ...(s.username ? { username: s.username } : {}),
        ...(s.label ? { label: s.label } : {}),
      }));
  } else if (sl && typeof sl === "object") {
    social = Object.entries(sl)
      .filter(([, v]) => typeof v === "string" && v)
      .map(([k, v]) => ({ platform: k, url: v as string }));
  }

  return {
    username: d.username || slug,
    isPublic: d.is_public ?? d.isPublic ?? true,
    fullName: personal.fullName || d.name || undefined,
    tagline: personal.tagline,
    bio: personal.bio || d.profile_bio || undefined,
    profilePicture: d.profile_picture || personal.profilePicture || undefined,
    email: contact.email,
    phone: contact.phone || d.phone || undefined,
    whatsapp: contact.whatsapp,
    website: contact.website,
    city: contact.city,
    country: contact.country,
    social,
    experience: (d.work_experience || []).map((e: any) => ({
      company: e.company, role: e.role, startDate: e.startDate, endDate: e.endDate, description: e.description,
    })),
    education: (d.education || []).map((e: any) => ({
      institution: e.institution, degree: e.degree, field: e.field, startYear: e.startYear, endYear: e.endYear,
    })),
    products: (d.products_services || []).map((p: any) => ({
      name: p.name, price: p.price, description: p.description, link: p.link,
    })),
    business: biz.name
      ? { name: biz.name, category: biz.category, description: biz.description, mapUrl: biz.mapUrl, hours: biz.hours }
      : undefined,
    views: d.views,
    updatedAt: d.updated_at,
    design: digitalCard.design || undefined,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ---------------- demo data (design preview) ---------------- */
export const DEMO_PROFILES: Record<string, PublicProfile> = {
  demo: {
    username: "demo",
    isPublic: true,
    fullName: "Aarav Mehta",
    tagline: "Product Designer · Freelance",
    bio: "I help startups turn ideas into delightful products. Open for select projects.",
    profilePicture: "https://i.pravatar.cc/240?img=12",
    email: "hello@aarav.design",
    phone: "+919876543210",
    whatsapp: "+919876543210",
    website: "https://aarav.design",
    city: "Mumbai",
    country: "India",
    views: 12480,
    updatedAt: new Date().toISOString(),
    social: [
      { platform: "Instagram", url: "https://instagram.com" },
      { platform: "LinkedIn", url: "https://linkedin.com" },
      { platform: "Dribbble", url: "https://dribbble.com" },
      { platform: "GitHub", url: "https://github.com" },
    ],
    experience: [
      { company: "Studio Bloom", role: "Lead Product Designer", startDate: "2022", endDate: "Present" },
      { company: "Flipkart", role: "Sr. Designer", startDate: "2019", endDate: "2022" },
    ],
    education: [
      { institution: "NID Ahmedabad", degree: "M.Des", field: "Interaction Design", startYear: "2017", endYear: "2019" },
    ],
    products: [
      { name: "Portfolio Review (1:1)", price: "₹2,499", description: "45-min live session", link: "https://aarav.design/book" },
      { name: "Design System Kit", price: "₹999", description: "Figma file + docs", link: "https://aarav.design/kit" },
    ],
    business: {
      name: "Aarav Design Studio",
      category: "Design Studio",
      description: "Brand & product design for ambitious teams.",
      hours: [
        { day: "Mon", open: "09:00", close: "18:00" },
        { day: "Tue", open: "09:00", close: "18:00" },
        { day: "Wed", open: "09:00", close: "18:00" },
        { day: "Thu", open: "09:00", close: "18:00" },
        { day: "Fri", open: "09:00", close: "18:00" },
        { day: "Sat", closed: true },
        { day: "Sun", closed: true },
      ],
    },
  },
};

/** Server-side fetch used by getServerSideProps. Never throws. */
export async function fetchPublicProfile(
  slug: string,
): Promise<{ profile: PublicProfile | null; isDemo: boolean }> {
  const key = slug.toLowerCase();
  try {
    const res = await fetch(publicProfilePath(slug), {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const json = await res.json();
      const data = json?.data ?? json;
      if (data && (data.user_id || data.name || data.personal_identity)) {
        const profile = mapApiProfile(slug, data);
        // If the backend returns an explicit is_public: false in the 200 body,
        // respect that and treat it as private — some backends return 200 with
        // the profile data even for private profiles so the slug is "claimed".
        if (data.is_public === false || data.isPublic === false) {
          profile.isPublic = false;
        }
        return { profile, isDemo: false };
      }
    } else if (res.status === 403 || res.status === 404) {
      // 403 = protected/inactive, 404 = private profile hidden at the API level
      // Both mean the visitor cannot see this profile.
      return { profile: { username: slug, isPublic: false }, isDemo: false };
    }
  } catch {
    /* network / TLS interception (dev) — fall through to demo or not-found */
  }
  if (DEMO_PROFILES[key]) return { profile: DEMO_PROFILES[key], isDemo: true };
  return { profile: null, isDemo: false };
}

/**
 * Fallback for a signed-in owner viewing their own "View public page" link
 * before the unauthenticated public endpoint above has data for their slug.
 * Uses the same authenticated full-profile endpoint the dashboard already
 * relies on, so the customized profile always renders for its owner.
 * Never throws.
 */
export async function fetchOwnProfile(accessToken: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/api/users/profile/full`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data ?? json;
    const username = data?.username || data?.personal_identity?.username;
    if (!username) return null;
    const mapped = mapApiProfile(username, data);
    // Backend may store this as is_public (snake_case). Override mapApiProfile's
    // value with the top-level field if it is an explicit boolean.
    if (data.is_public !== undefined) mapped.isPublic = Boolean(data.is_public);
    else if (data.isPublic !== undefined) mapped.isPublic = Boolean(data.isPublic);
    return mapped;
  } catch {
    return null;
  }
}

/* ---------------- helpers ---------------- */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Computes Open/Closed from business hours (local time). */
export function computeOpenNow(hours?: PublicHours[]): boolean | null {
  if (!hours?.length) return null;
  const now = new Date();
  const today = DAYS[now.getDay()];
  const slot = hours.find((h) => h.day === today);
  if (!slot || slot.closed || !slot.open || !slot.close) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = slot.open.split(":").map(Number);
  const [ch, cm] = slot.close.split(":").map(Number);
  return mins >= oh * 60 + om && mins <= ch * 60 + cm;
}

/** Builds a downloadable vCard (.vcf) string from the profile. */
export function buildVCard(p: PublicProfile): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${p.fullName || p.username}`,
    p.business?.name && `ORG:${p.business.name}`,
    p.tagline && `TITLE:${p.tagline}`,
    p.phone && `TEL;TYPE=CELL:${p.phone}`,
    p.email && `EMAIL:${p.email}`,
    p.website && `URL:${p.website}`,
    (p.city || p.country) && `ADR;TYPE=WORK:;;;${p.city || ""};;;${p.country || ""}`,
    p.bio && `NOTE:${p.bio.replace(/\n/g, " ")}`,
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\n");
}

export interface ShareTarget {
  label: string;
  href: string;
}
export function shareTargets(url: string, name: string): ShareTarget[] {
  const text = encodeURIComponent(`Check out ${name} on ClickCard`);
  const u = encodeURIComponent(url);
  return [
    { label: "WhatsApp", href: `https://wa.me/?text=${text}%20${u}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${text}&url=${u}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "Email", href: `mailto:?subject=${text}&body=${u}` },
  ];
}
