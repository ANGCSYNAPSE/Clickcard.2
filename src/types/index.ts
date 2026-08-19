/** Domain types mirroring the ClickCard backend contract. */

export interface AuthUser {
  userId: number;
  email: string;
  username: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface CurrentUser {
  id?: number;
  userId?: number;
  email: string;
  username: string;
  name?: string;
  profilePicture?: string;
  isPublic?: boolean;
  createdAt?: string;
}

export type AuthType = "google" | "apple";

export interface SocialSigninPayload {
  email: string;
  authType: AuthType;
  googleId?: string;
  appleId?: string;
  name?: string;
  phoneNumber?: string;
  deviceId?: string;
  referralCode?: string;
}

/* ---------------- Profile (8 sections) ---------------- */

export interface PersonalSection {
  fullName?: string;
  tagline?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePicture?: string;
}

export interface ContactSection {
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface EducationItem {
  id?: string;
  institution: string;
  degree?: string;
  field?: string;
  startYear?: string;
  endYear?: string;
  description?: string;
}

export interface ExperienceItem {
  id?: string;
  company: string;
  role?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface ProjectItem {
  id?: string;
  name: string;
  role?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface AwardItem {
  id?: string;
  title: string;
  description?: string;
}

export interface LanguageItem {
  id?: string;
  name: string;
  level?: string;
}

export interface ReferenceItem {
  id?: string;
  name: string;
  position?: string;
  company?: string;
  phone?: string;
  email?: string;
}

export interface BusinessHours {
  day: string;
  open?: string;
  close?: string;
  closed?: boolean;
}

export interface BusinessSection {
  name?: string;
  category?: string;
  description?: string;
  logo?: string;
  mapUrl?: string;
  hours?: BusinessHours[];
}

export interface ProductItem {
  id?: string;
  name: string;
  price?: string;
  currency?: string;
  description?: string;
  image?: string;
  link?: string;
}

export interface SocialLink {
  id?: string;
  platform: string;
  username?: string;
  url: string;
  label?: string;
  visible?: boolean;
  order?: number;
}

export interface DigitalCardSection {
  templateId?: string;
  /** CV template id (@/lib/cvTemplates) — separate from `templateId`, which is Card-only. */
  cvTemplateId?: string;
  theme?: string;
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  textColor?: string;
  paletteStyle?: string;
  backgroundColor?: string;
  headerColor?: string;
  /**
   * Card-only overrides for name/tagline, business, and contact info —
   * separate from the main profile.personal/business/contact so editing
   * these in the Digital Card page never changes the Profile page, CV,
   * Portfolio, or public profile. Unset fields fall back to the main
   * profile's value when rendering the card.
   */
  cardPersonal?: PersonalSection;
  cardBusiness?: BusinessSection;
  cardContact?: ContactSection;
  /** Comma-separated skill tags, shown on the Resume/CV layout. */
  skills?: string[];
  /** Project entries shown on the Resume/CV layout. */
  projects?: ProjectItem[];
  /** Award entries shown on the CV layout (templates with an Awards section). */
  awards?: AwardItem[];
  /** Language entries shown on the CV layout (templates with a Languages section). */
  languages?: LanguageItem[];
  /** Reference entries shown on the CV layout (templates with a References section). */
  references?: ReferenceItem[];
  /**
   * Social links shown on the Resume/CV & Portfolio layouts — separate from
   * the main profile.social list so editing them here doesn't change what
   * shows up on the Share page, public profile, etc.
   */
  socialLinks?: SocialLink[];
  /**
   * The full Studio design (colors, wallpaper, buttons, fonts…) as a plain
   * JSON blob — this is a loose JSON column on the backend, so it round-trips
   * whatever shape we send. See DesignState in store/slices/designSlice.ts
   * for the shape Studio writes here on save, and PublicCardDesign in
   * lib/publicProfile.ts for how the public page reads it back.
   */
  design?: Record<string, unknown>;
}

export interface FullProfile {
  personal?: PersonalSection;
  contact?: ContactSection;
  education?: EducationItem[];
  experience?: ExperienceItem[];
  business?: BusinessSection;
  products?: ProductItem[];
  social?: SocialLink[];
  digitalCard?: DigitalCardSection;
  isPublic?: boolean;
}

/* ---------------- Share links ---------------- */

export interface ShareLink {
  id: number;
  custom_slug?: string;
  short_code?: string;
  url?: string;
  qr_code?: string;
  is_active?: boolean;
  requires_password?: boolean;
  expiry_date?: string | null;
  visits?: number;
  created_at?: string;
}

export interface ShareAnalytics {
  totalVisits?: number;
  uniqueVisitors?: number;
  byDate?: { date: string; visits: number }[];
  byCountry?: { country: string; visits: number }[];
}

/* ---------------- API envelope ---------------- */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";
