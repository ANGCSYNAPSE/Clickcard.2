import type { FullProfile, SocialLink } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The backend stores the profile in 8 sectioned JSON columns and expects a
 * specific payload shape (createOrUpdateFullProfile in AuthService):
 *   personalIdentity, contactInformation, education, workExperience,
 *   businessDetails, productsServices, socialMediaLinks, digitalCard
 * These mappers translate between that and our flat FullProfile draft.
 */

export function toApiProfile(p: FullProfile): Record<string, unknown> {
  return {
    personalIdentity: p.personal || {},
    contactInformation: p.contact || {},
    education: p.education || [],
    workExperience: p.experience || [],
    businessDetails: p.business || {},
    productsServices: p.products || [],
    // backend maps `socialMediaLinks` → social_links column
    socialMediaLinks: p.social || [],
    digitalCard: p.digitalCard || {},
  };
}

export function fromApiProfile(d: any): FullProfile {
  if (!d) return {};
  // social may come back as array or object map
  let social: SocialLink[] = [];
  const sl = d.social_links ?? d.socialLinks ?? d.socialMediaLinks;
  if (Array.isArray(sl)) {
    social = sl;
  } else if (sl && typeof sl === "object") {
    social = Object.entries(sl)
      .filter(([, v]) => typeof v === "string" && v)
      .map(([k, v]) => ({ platform: k, url: v as string }));
  }

  return {
    personal: d.personal_identity ?? d.personalIdentity ?? {},
    contact: d.contact_information ?? d.contactInformation ?? {},
    education: d.education ?? [],
    experience: d.work_experience ?? d.workExperience ?? [],
    business: d.business_details ?? d.businessDetails ?? { hours: [] },
    products: d.products_services ?? d.productsServices ?? [],
    social,
    digitalCard: d.digital_card ?? d.digitalCard ?? {},
    isPublic: d.isPublic ?? d.is_public,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
