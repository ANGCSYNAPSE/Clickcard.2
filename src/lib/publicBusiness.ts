import { API_BASE_URL } from "./config";
import { BUSINESS_PROFILE_ROUTES } from "@/apiRoutes";
import type { BusinessDocument, BusinessLocation } from "@/types";

export interface PublicBusinessProfile {
  id: number;
  slug?: string;
  company_name: string;
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

/** Server-side fetch for the public, shareable business profile page. */
export async function fetchPublicBusinessProfile(id: string): Promise<PublicBusinessProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${BUSINESS_PROFILE_ROUTES.public(id)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}
