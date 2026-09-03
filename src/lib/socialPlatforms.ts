import { Mail, ExternalLink, Stethoscope } from "lucide-react";
import {
  SiInstagram,
  SiFacebook,
  SiYoutube,
  SiTiktok,
  SiThreads,
  SiX,
  SiWhatsapp,
  SiSnapchat,
  SiPinterest,
  SiTelegram,
  SiDiscord,
  SiGithub,
} from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SocialPlatform {
  platform: string;
  icon: any; // lucide + react-icons component types don't unify cleanly; consumers render as <Icon size={..} />
}

/** Shown as one-click icons before the user has picked anything else — kept alphabetical. */
export const SOCIAL_QUICK_ADD: SocialPlatform[] = [
  { platform: "Facebook", icon: SiFacebook },
  { platform: "Instagram", icon: SiInstagram },
  { platform: "LinkedIn", icon: FaLinkedin },
  { platform: "WhatsApp", icon: SiWhatsapp },
  { platform: "YouTube", icon: SiYoutube },
];

/** Full catalog shown in the "Add social icon" picker — kept alphabetical by platform name. */
export const ALL_SOCIAL_PLATFORMS: SocialPlatform[] = [
  { platform: "Discord", icon: SiDiscord },
  { platform: "Email", icon: Mail },
  { platform: "Facebook", icon: SiFacebook },
  { platform: "GitHub", icon: SiGithub },
  { platform: "Instagram", icon: SiInstagram },
  { platform: "LinkedIn", icon: FaLinkedin },
  { platform: "Pinterest", icon: SiPinterest },
  // No brand icon available in the icon sets we use — a stethoscope reads
  // clearly as "medical/doctor" for the Practo use case.
  { platform: "Practo", icon: Stethoscope },
  { platform: "Snapchat", icon: SiSnapchat },
  { platform: "Telegram", icon: SiTelegram },
  { platform: "Threads", icon: SiThreads },
  // { platform: "TikTok", icon: SiTiktok },
  { platform: "WhatsApp", icon: SiWhatsapp },
  { platform: "X (formerly Twitter)", icon: SiX },
  { platform: "YouTube", icon: SiYoutube },
];

/** Resolves a saved platform name (e.g. from draft.social) back to its icon. */
export function getSocialIcon(platform?: string): SocialPlatform["icon"] {
  if (!platform) return ExternalLink;
  const norm = platform.trim().toLowerCase();
  const hit = ALL_SOCIAL_PLATFORMS.find((p) => p.platform.toLowerCase() === norm);
  return hit?.icon || ExternalLink;
}
