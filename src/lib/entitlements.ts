/** Mirrors backend config/plans.js ENTITLEMENTS — the feature flags plans unlock. */
export const ENT = {
  UNLIMITED_LINKS: "unlimited_links",
  CUSTOM_THEMES: "custom_themes",
  REMOVE_BRANDING: "remove_branding",
  CUSTOM_DOMAIN: "custom_domain",
  STUDIO_PREMIUM_TEMPLATES: "studio_premium_templates",
  EXPORTS: "exports_pdf_png_svg",
  DYNAMIC_QR: "dynamic_qr",
  PRODUCT_CATALOGUE: "product_catalogue",
  BUSINESS_HOURS_MAPS: "business_hours_maps",
  LEAD_CAPTURE: "lead_capture",
  TEAM_PROFILES: "team_profiles",
  ADVANCED_ANALYTICS: "advanced_analytics",
  REFERRAL_BOOST: "referral_boost",
  SCHEDULED_LINKS: "scheduled_links",
  AB_TESTING: "ab_testing",
} as const;

export type Entitlement = (typeof ENT)[keyof typeof ENT];

/** Human labels for upsell copy. */
export const ENT_LABEL: Record<string, string> = {
  [ENT.UNLIMITED_LINKS]: "Unlimited links",
  [ENT.STUDIO_PREMIUM_TEMPLATES]: "Premium Studio templates",
  [ENT.EXPORTS]: "PDF / PNG / SVG exports",
  [ENT.DYNAMIC_QR]: "Dynamic QR codes",
  [ENT.PRODUCT_CATALOGUE]: "Product catalogue",
  [ENT.BUSINESS_HOURS_MAPS]: "Business hours & maps",
  [ENT.LEAD_CAPTURE]: "Lead capture",
  [ENT.ADVANCED_ANALYTICS]: "Advanced analytics",
  [ENT.CUSTOM_THEMES]: "Custom themes",
  [ENT.REMOVE_BRANDING]: "Remove ClickCard branding",
};
