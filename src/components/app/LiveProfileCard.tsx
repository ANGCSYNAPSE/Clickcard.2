import type { CSSProperties } from "react";
import { Share, Phone, MessageCircle, Mail, Globe, Briefcase, GraduationCap, Package, Building2 } from "lucide-react";
import { getSocialIcon } from "@/lib/socialPlatforms";

export type WallpaperType = "fill" | "gradient" | "blur" | "pattern" | "image" | "video";
export type GradientDirection = "up" | "down" | "radial";

export interface LiveProfileContact {
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
}

export interface LiveProfileExperience {
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
}

export interface LiveProfileEducation {
  institution?: string;
  degree?: string;
  field?: string;
  startYear?: string;
  endYear?: string;
}

export interface LiveProfileProduct {
  name?: string;
  price?: string;
  description?: string;
}

export interface LiveProfileBusiness {
  name?: string;
  category?: string;
  description?: string;
}

/**
 * The Linktree-style live preview card. Shared by the Studio design tool and
 * every other "Live preview" panel so they all render identically. Scrolls
 * internally so every filled-in profile section shows, not just the header.
 */
export default function LiveProfileCard({
  primary,
  accent,
  theme,
  name,
  username,
  avatarUrl,
  tagline,
  bio,
  socialLinks,
  contact,
  experience,
  education,
  products,
  business,
  wallpaperType = "fill",
  backgroundColor = primary,
  gradientColor = primary,
  gradientDirection = "up",
  noise = false,
  patternIndex = 0,
  pageFont = "Inter",
  pageTextColor,
  matchTitleFont = true,
  titleFont = "Inter",
  titleColor,
}: {
  primary: string;
  accent: string;
  theme: "light" | "dark";
  name: string;
  username?: string | null;
  avatarUrl?: string;
  tagline?: string;
  bio?: string;
  socialLinks?: { platform: string; username?: string; url?: string }[];
  contact?: LiveProfileContact;
  experience?: LiveProfileExperience[];
  education?: LiveProfileEducation[];
  products?: LiveProfileProduct[];
  business?: LiveProfileBusiness;
  wallpaperType?: WallpaperType;
  backgroundColor?: string;
  gradientColor?: string;
  gradientDirection?: GradientDirection;
  noise?: boolean;
  patternIndex?: number;
  pageFont?: string;
  pageTextColor?: string;
  matchTitleFont?: boolean;
  titleFont?: string;
  titleColor?: string;
}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#000000" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const pageColor = pageTextColor || textColor;
  const titleTextColor = matchTitleFont ? pageColor : titleColor || pageColor;
  const fontStack = (fontName: string) => `"${fontName}", sans-serif`;
  const pageFontFamily = fontStack(pageFont);
  const titleFontFamily = fontStack(matchTitleFont ? pageFont : titleFont);
  const cardBg = `${pageColor}14`;
  const cardBorder = `${pageColor}1f`;

  const patternImages = [
    `repeating-linear-gradient(45deg, ${backgroundColor}, ${backgroundColor} 3px, #ffffff33 3px, #ffffff33 6px)`,
    `linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)`,
    `radial-gradient(#ffffff33 1.5px, transparent 1.5px)`,
    `linear-gradient(135deg, ${primary}, ${accent})`,
  ];

  const wallpaperStyle: CSSProperties =
    wallpaperType === "gradient"
      ? {
          background:
            gradientDirection === "radial"
              ? `radial-gradient(circle, ${gradientColor}, ${accent})`
              : `linear-gradient(${gradientDirection === "down" ? "to bottom" : "to top"}, ${gradientColor}, ${accent})`,
          backgroundImage: noise
            ? `radial-gradient(#ffffff22 1px, transparent 1px), ${
                gradientDirection === "radial"
                  ? `radial-gradient(circle, ${gradientColor}, ${accent})`
                  : `linear-gradient(${gradientDirection === "down" ? "to bottom" : "to top"}, ${gradientColor}, ${accent})`
              }`
            : undefined,
          backgroundSize: noise ? "3px 3px, auto" : undefined,
        }
      : wallpaperType === "pattern"
      ? {
          background: backgroundColor,
          backgroundImage: patternImages[patternIndex] ?? patternImages[0],
          backgroundSize: patternIndex === 1 ? "6px 6px" : undefined,
        }
      : {
          background: backgroundColor,
        };

  const contactActions = [
    contact?.phone && { icon: Phone, label: "Call" },
    contact?.whatsapp && { icon: MessageCircle, label: "WhatsApp" },
    contact?.email && { icon: Mail, label: "Email" },
    contact?.website && { icon: Globe, label: "Website" },
  ].filter(Boolean) as { icon: typeof Phone; label: string }[];

  return (
    <div
      className="relative rounded-3xl shadow-card overflow-hidden"
      style={{
        width: 320,
        height: 680,
        background: bg,
        color: textColor,
        fontFamily: pageFontFamily,
      }}
    >
      {/* Wallpaper background area (whole card, independent of the avatar) */}
      <div className="absolute inset-0 w-full h-full" style={wallpaperStyle} />

      {/* Header with icons */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
        <div
          className="grid h-8 w-8 place-items-center rounded-full text-white bg-textColor"
          style={{ background: textColor }}
        >
          <h3 className="text-sm ">CC</h3>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded text-white" >
          <Share className="w-5 h-5" />
        </div>
      </div>

      {/* Scrollable content — everything filled in shows here */}
      <div className="no-scrollbar relative z-10 flex h-full flex-col items-center overflow-y-auto px-6 pb-16 pt-20 text-center">
        {/* Avatar */}
        <div
          className="grid h-24 w-24 place-items-center overflow-hidden rounded-full text-2xl font-black text-white -mt-16 mb-2 shadow-lg shrink-0"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            name[0]?.toUpperCase() || " "
          )}
        </div>

        {/* Username */}
        <p
          className="text-xl font-black text-center shrink-0"
          style={{ color: titleTextColor, fontFamily: titleFontFamily }}
        >
          @{username || "username"}
        </p>

        {/* Tagline */}
        {tagline && (
          <p className="mt-1 shrink-0 text-sm font-semibold text-center" style={{ color: pageColor, opacity: 0.85 }}>
            {tagline}
          </p>
        )}

        {/* Bio */}
        {bio && (
          <p
            className="mt-2 line-clamp-3 max-w-[240px] shrink-0 text-xs leading-relaxed text-center"
            style={{ color: pageColor, opacity: 0.7 }}
          >
            {bio}
          </p>
        )}

        {/* Contact quick actions */}
        {contactActions.length > 0 && (
          <div className="mt-5 grid w-full shrink-0 gap-1.5" style={{ gridTemplateColumns: `repeat(${contactActions.length}, minmax(0, 1fr))` }}>
            {contactActions.map((a) => (
              <div
                key={a.label}
                className="flex flex-col items-center gap-1 rounded-xl px-1 py-2.5"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <a.icon size={14} style={{ color: pageColor }} />
                <span className="truncate text-[9px] font-bold" style={{ color: pageColor }}>
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Social link list (platform + handle) */}
        {socialLinks && socialLinks.length > 0 && (
          <div className="mt-5 w-full shrink-0 space-y-2">
            {socialLinks.map((s, i) => {
              const Icon = getSocialIcon(s.platform);
              return (
                <div
                  key={`row-${s.platform}-${i}`}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                >
                  <Icon size={15} style={{ color: pageColor }} />
                  <span className="min-w-0 flex-1 truncate text-xs font-bold" style={{ color: pageColor }}>
                    {s.username ? `@${s.username}` : s.platform}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div className="mt-4 w-full shrink-0 space-y-2 text-left">
            <p className="text-[10px] font-black uppercase tracking-wider opacity-60" style={{ color: pageColor }}>
              Experience
            </p>
            {experience.map((e, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <Briefcase size={14} className="mt-0.5 shrink-0" style={{ color: pageColor }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold" style={{ color: pageColor }}>
                    {e.role || "Role"}
                  </p>
                  <p className="truncate text-[10px] opacity-70" style={{ color: pageColor }}>
                    {e.company}
                    {(e.startDate || e.endDate) && ` · ${[e.startDate, e.endDate].filter(Boolean).join(" – ")}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div className="mt-4 w-full shrink-0 space-y-2 text-left">
            <p className="text-[10px] font-black uppercase tracking-wider opacity-60" style={{ color: pageColor }}>
              Education
            </p>
            {education.map((e, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <GraduationCap size={14} className="mt-0.5 shrink-0" style={{ color: pageColor }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold" style={{ color: pageColor }}>
                    {e.institution || "Institution"}
                  </p>
                  <p className="truncate text-[10px] opacity-70" style={{ color: pageColor }}>
                    {[e.degree, e.field].filter(Boolean).join(", ")}
                    {(e.startYear || e.endYear) && ` · ${[e.startYear, e.endYear].filter(Boolean).join(" – ")}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products */}
        {products && products.length > 0 && (
          <div className="mt-4 w-full shrink-0 space-y-2 text-left">
            <p className="text-[10px] font-black uppercase tracking-wider opacity-60" style={{ color: pageColor }}>
              Products &amp; services
            </p>
            {products.map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <Package size={14} className="mt-0.5 shrink-0" style={{ color: pageColor }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold" style={{ color: pageColor }}>
                    {p.name || "Product"}
                  </p>
                  {p.description && (
                    <p className="truncate text-[10px] opacity-70" style={{ color: pageColor }}>
                      {p.description}
                    </p>
                  )}
                </div>
                {p.price && (
                  <span className="shrink-0 text-[10px] font-black" style={{ color: pageColor }}>
                    {p.price}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Business */}
        {business?.name && (
          <div className="mt-4 w-full shrink-0 text-left">
            <p className="text-[10px] font-black uppercase tracking-wider opacity-60" style={{ color: pageColor }}>
              Business
            </p>
            <div
              className="mt-2 flex items-start gap-2.5 rounded-xl px-3 py-2.5"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
            >
              <Building2 size={14} className="mt-0.5 shrink-0" style={{ color: pageColor }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold" style={{ color: pageColor }}>
                  {business.name}
                </p>
                {(business.category || business.description) && (
                  <p className="truncate text-[10px] opacity-70" style={{ color: pageColor }}>
                    {business.category || business.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer — scrolls with the content */}
        <div className="mt-6 shrink-0 pb-2 text-center text-[10px] opacity-60" style={{ color: pageColor }}>
          <p>Report • Privacy</p>
          <p>More from ClickCard</p>
        </div>
      </div>

      {/* Action Button only — fixed to the bottom of the card, not scrolling */}
      <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center">
        <button
          className="shrink-0 px-8 py-2.5 rounded-full font-bold text-sm shadow-lg transition hover:opacity-90"
          style={{
            background: textColor,
            color: bg,
          }}
        >
          Join on ClickCard
        </button>
      </div>
    </div>
  );
}
