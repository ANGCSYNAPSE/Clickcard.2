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

  // The backend stores the avatar as a top-level user field (Cloudinary URL),
  // not inside personal_identity, so it has to be merged in by hand.
  const personal = { ...(d.personal_identity ?? d.personalIdentity ?? {}) };
  const profilePicture = d.profile_picture ?? d.profilePicture ?? personal.profilePicture;
  if (profilePicture) personal.profilePicture = profilePicture;

  return {
    personal,
    contact: d.contact_information ?? d.contactInformation ?? {},
    education: d.education ?? [],
    experience: d.work_experience ?? d.workExperience ?? [],
    business: d.business_details ?? d.businessDetails ?? { hours: [] },
    products: d.products_services ?? d.productsServices ?? [],
    social,
    digitalCard: d.digital_card ?? d.digitalCard ?? {},
    // Prefer the explicit boolean the backend returns. Fall back to null (not
    // undefined) so callers can distinguish "server returned false" from "server
    // didn't send the field at all" — undefined folds into ?? true and silently
    // treats a private profile as public.
    isPublic: d.isPublic !== undefined
      ? Boolean(d.isPublic)
      : d.is_public !== undefined
        ? Boolean(d.is_public)
        : null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
