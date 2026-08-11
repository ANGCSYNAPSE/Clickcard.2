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
  url: string;
  label?: string;
  visible?: boolean;
  order?: number;
}

export interface DigitalCardSection {
  templateId?: string;
  theme?: string;
  primaryColor?: string;
  accentColor?: string;
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
