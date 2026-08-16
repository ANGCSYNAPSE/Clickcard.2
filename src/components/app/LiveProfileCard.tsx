import { useEffect, type CSSProperties } from "react";
import { Share, Phone, MessageCircle, Mail, Globe, Briefcase, GraduationCap, Package, Building2, User } from "lucide-react";
import { getSocialIcon } from "@/lib/socialPlatforms";

export type WallpaperType = "fill" | "gradient" | "blur" | "pattern" | "image" | "video";
export type GradientDirection = "up" | "down" | "radial";
export type HeaderLayout = "classic" | "hero" | "banner" | "cutout" | "shape";
export type ButtonStyle = "solid" | "glass" | "outline";
export type ButtonRoundness = "sharp" | "slight" | "medium" | "full";
export type ButtonShadow = "none" | "soft" | "strong" | "hard";
export type SocialLinksStyle = "buttons" | "icons";

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
  description?: string;
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
  bannerUrl,
  bio,
  socialLinks,
  contact,
  experience,
  education,
  products,
  business,
  headerLayout = "classic",
  wallpaperType = "fill",
  backgroundColor = primary,
  gradientColor = primary,
  gradientColorEnd = accent,
  gradientDirection = "up",
  noise = false,
  patternIndex = 0,
  buttonColor = "#FFFFFF",
  buttonTextColor,
  buttonStyle = "solid",
  buttonRoundness = "slight",
  buttonShadow = "none",
  socialLinksStyle = "buttons",
  pageFont = "Inter",
  pageTextColor,
  matchTitleFont = true,
  titleFont = "Inter",
  titleColor,
  titleFontSize = 20,
  bioFontSize = 12,
  bodyFontSize = 12,
}: {
  primary: string;
  accent: string;
  theme: "light" | "dark";
  name: string;
  username?: string | null;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  socialLinks?: { platform: string; username?: string; url?: string }[];
  contact?: LiveProfileContact;
  experience?: LiveProfileExperience[];
  education?: LiveProfileEducation[];
  products?: LiveProfileProduct[];
  business?: LiveProfileBusiness;
  headerLayout?: HeaderLayout;
  wallpaperType?: WallpaperType;
  backgroundColor?: string;
  gradientColor?: string;
  gradientColorEnd?: string;
  gradientDirection?: GradientDirection;
  noise?: boolean;
  patternIndex?: number;
  buttonColor?: string;
  buttonTextColor?: string;
  buttonStyle?: ButtonStyle;
  buttonRoundness?: ButtonRoundness;
  buttonShadow?: ButtonShadow;
  socialLinksStyle?: SocialLinksStyle;
  pageFont?: string;
  pageTextColor?: string;
  matchTitleFont?: boolean;
  titleFont?: string;
  titleColor?: string;
  titleFontSize?: number;
  bioFontSize?: number;
  bodyFontSize?: number;
}) {
  useEffect(() => {
    const loadFont = (font: string) => {
      if (!font || typeof document === "undefined") return;
      const id = `gf-${font.replace(/ /g, "-").toLowerCase()}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}&display=swap`;
      document.head.appendChild(link);
    };
    loadFont(pageFont);
    if (!matchTitleFont && titleFont) loadFont(titleFont);
  }, [pageFont, titleFont, matchTitleFont]);

  const isDark = theme === "dark";
  const bg = isDark ? "#000000" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const pageColor = pageTextColor || textColor;
  const titleTextColor = matchTitleFont ? pageColor : titleColor || pageColor;
  const fontStack = (fontName: string) => `"${fontName}", sans-serif`;
  const pageFontFamily = fontStack(pageFont);
  const titleFontFamily = fontStack(matchTitleFont ? pageFont : titleFont);
  const cardText = buttonTextColor || pageColor;
  const isGlass = buttonStyle === "glass";
  const cardBg = buttonStyle === "outline" ? "transparent" : isGlass ? `${buttonColor}26` : `${buttonColor}e6`;
  const cardBorder = buttonStyle === "outline" ? buttonColor : isGlass ? "#ffffff4d" : `${cardText}26`;
  const cardBorderWidth = buttonStyle === "outline" ? 1.5 : 1;
  const cardRadius = { sharp: 6, slight: 12, medium: 18, full: 9999 }[buttonRoundness];
  const cardShadow = {
    none: "none",
    soft: "0 2px 8px rgba(0,0,0,0.08)",
    strong: "0 6px 20px rgba(0,0,0,0.18)",
    hard: "4px 4px 0 rgba(0,0,0,0.35)",
  }[buttonShadow];
  const cardStyle: CSSProperties = {
    background: isGlass ? `linear-gradient(155deg, ${buttonColor}4d, ${buttonColor}12 60%, ${buttonColor}26)` : cardBg,
    border: `${cardBorderWidth}px solid ${cardBorder}`,
    borderRadius: cardRadius,
    boxShadow: isGlass
      ? [cardShadow, "inset 0 1px 0 rgba(255,255,255,0.45)", "inset 0 0 0 1px rgba(255,255,255,0.08)"]
          .filter((v) => v !== "none")
          .join(", ")
      : cardShadow,
    backdropFilter: isGlass ? "blur(16px) saturate(180%)" : undefined,
    WebkitBackdropFilter: isGlass ? "blur(16px) saturate(180%)" : undefined,
  };

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
              ? `radial-gradient(circle, ${gradientColor}, ${gradientColorEnd})`
              : `linear-gradient(${gradientDirection === "down" ? "to bottom" : "to top"}, ${gradientColor}, ${gradientColorEnd})`,
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

  const heroMode = headerLayout === "hero";
  const bannerMode = headerLayout === "banner";
  const cutoutMode = headerLayout === "cutout";
  const avatarSizeClass = bannerMode ? "h-20 w-20" : "h-24 w-24";
  const avatarMarginClass = bannerMode ? "-mt-10" : "mt-4";
  const avatarShapeStyle: CSSProperties =
    headerLayout === "shape" ? { borderRadius: "42% 58% 70% 30% / 45% 45% 55% 55%" } : { borderRadius: "9999px" };

  const contactActions = [
    contact?.phone && { icon: Phone, label: "Call" },
    contact?.whatsapp && { icon: MessageCircle, label: "WhatsApp" },
    contact?.email && { icon: Mail, label: "Email" },
    contact?.website && { icon: Globe, label: "Website" },
  ].filter(Boolean) as { icon: typeof Phone; label: string }[];

  // Point sizes set directly in Studio (like a word processor's font-size
  // box), not preset buckets — applied as inline font-size in px.
  const titleSizeStyle: CSSProperties = { fontSize: titleFontSize };
  const bioSizeStyle: CSSProperties = { fontSize: bioFontSize };
  const bodySizeStyle: CSSProperties = { fontSize: bodyFontSize };
  // One size down from bodyFontSize — used for the secondary/detail line
  // under each body row (dates, degree, description, category…).
  const bodySubSizeStyle: CSSProperties = { fontSize: Math.max(8, bodyFontSize - 2) };

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
      <div className="absolute inset-0 z-0 w-full h-full" style={wallpaperStyle} />

      {/* Noise overlay — a separate layer so toggling it never touches the base color/gradient underneath */}
      {wallpaperType === "gradient" && noise && (
        <div
          className="pointer-events-none absolute inset-0 z-[1] w-full h-full"
          style={{ backgroundImage: `radial-gradient(#ffffff22 1px, transparent 1px)`, backgroundSize: "3px 3px" }}
        />
      )}

      {/* Header with icons */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
        <div
          className={`grid h-8 w-8 place-items-center rounded-full text-white ${heroMode ? "backdrop-blur-sm" : ""}`}
          style={{ background: heroMode ? "#ffffff33" : textColor }}
        >
          <h3 className="text-sm ">CC</h3>
        </div>
        <div
          className={`grid h-8 w-8 place-items-center rounded-full text-white ${heroMode ? "backdrop-blur-sm" : ""}`}
          style={{ background: heroMode ? "#ffffff33" : undefined }}
        >
          <Share className="w-5 h-5" />
        </div>
      </div>

      {/* Scrollable content — everything filled in shows here */}
      <div className="no-scrollbar relative z-10 flex h-full flex-col items-center overflow-y-auto pb-16 text-center">
        {heroMode ? (
          /* Hero image — full-bleed photo that dissolves into the card's own wallpaper underneath */
          <div className="relative w-full shrink-0" style={{ height: 320 }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
                style={{
                  WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 50%, transparent 96%)",
                  maskImage: "linear-gradient(to bottom, #000 0%, #000 50%, transparent 96%)",
                }}
              />
            ) : (
              <div
                className="grid h-full w-full place-items-center"
                style={{
                  background: "#94A3B8",
                  WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 50%, transparent 96%)",
                  maskImage: "linear-gradient(to bottom, #000 0%, #000 50%, transparent 96%)",
                }}
              >
                <User size={72} className="text-white/85" strokeWidth={1.5} />
              </div>
            )}
          </div>
        ) : cutoutMode ? (
          /* Cutout — background-removed photo "stickered" onto the wallpaper, username above it */
          <div className="flex w-full shrink-0 flex-col items-center px-6 pt-16">
            <p
              className="-mb-4 z-[1] font-black leading-none"
              style={{ color: titleTextColor, fontFamily: titleFontFamily, transform: "rotate(-3deg)", ...titleSizeStyle }}
            >
              @{username || "username"}
            </p>
            <div className="relative w-full" style={{ height: 260 }}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-contain" />
              ) : (
                <div className="grid h-full place-items-center">
                  <User size={72} className="opacity-30" style={{ color: pageColor }} strokeWidth={1.5} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Banner — scrolls with the rest of the content, avatar overlaps its bottom edge */}
            {bannerMode && (
              <div className="w-full shrink-0 overflow-hidden" style={{ height: 130 }}>
                {bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                  />
                )}
              </div>
            )}
            <div
              className={`grid place-items-center overflow-hidden mb-2 shadow-lg shrink-0 ${avatarSizeClass} ${avatarMarginClass}`}
              style={{
                background: avatarUrl ? `linear-gradient(135deg, ${primary}, ${accent})` : "#94A3B8",
                ...avatarShapeStyle,
              }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User size={bannerMode ? 40 : 48} className="text-white/85" strokeWidth={1.5} />
              )}
            </div>
          </>
        )}

        {/* Username — cutout renders its own username above the photo instead */}
        {!cutoutMode && (
          <p
            className={`w-full shrink-0 px-6 text-center font-black ${heroMode ? "-mt-6" : ""}`}
            style={{ color: titleTextColor, fontFamily: titleFontFamily, ...titleSizeStyle }}
          >
            @{username || "username"}
          </p>
        )}

        {/* Bio */}
        {bio && (
          <p
            className="mt-2 line-clamp-3 max-w-[240px] mx-auto shrink-0 text-center leading-relaxed"
            style={{ color: pageColor, opacity: 0.7, ...bioSizeStyle }}
          >
            {bio}
          </p>
        )}

        <div className="flex w-full flex-1 flex-col items-center px-6">

        {/* Contact quick actions */}
        {contactActions.length > 0 && (
          <div className="mt-5 grid w-full shrink-0 gap-1.5" style={{ gridTemplateColumns: `repeat(${contactActions.length}, minmax(0, 1fr))` }}>
            {contactActions.map((a) => (
              <div
                key={a.label}
                title={a.label}
                className="flex items-center justify-center py-3 backdrop-blur-sm"
                style={cardStyle}
              >
                <a.icon size={18} style={{ color: cardText }} />
              </div>
            ))}
          </div>
        )}

        {/* Social links — a compact icon row, or full icon+handle buttons */}
        {socialLinks && socialLinks.length > 0 && (
          socialLinksStyle === "icons" ? (
            <div className="mt-5 flex w-full shrink-0 flex-wrap items-center justify-center gap-2">
              {socialLinks.map((s, i) => {
                const Icon = getSocialIcon(s.platform);
                return (
                  <div
                    key={`icon-${s.platform}-${i}`}
                    className="grid h-11 w-11 shrink-0 place-items-center backdrop-blur-sm"
                    style={cardStyle}
                    title={s.username ? `@${s.username}` : s.platform}
                  >
                    <Icon size={17} style={{ color: cardText }} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 w-full shrink-0 space-y-2">
              {socialLinks.map((s, i) => {
                const Icon = getSocialIcon(s.platform);
                return (
                  <div
                    key={`row-${s.platform}-${i}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-left backdrop-blur-sm"
                    style={cardStyle}
                  >
                    <Icon size={15} style={{ color: cardText }} />
                    <span className="min-w-0 flex-1 truncate font-bold" style={{ color: cardText, ...bodySizeStyle }}>
                      {s.username ? `@${s.username}` : s.platform}
                    </span>
                  </div>
                );
              })}
            </div>
          )
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
                className="flex items-start gap-2.5 px-3 py-2.5 backdrop-blur-sm"
                style={cardStyle}
              >
                <Briefcase size={14} className="mt-0.5 shrink-0" style={{ color: cardText }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold" style={{ color: cardText, ...bodySizeStyle }}>
                    {e.role || "Role"}
                  </p>
                  <p className="truncate opacity-70" style={{ color: cardText, ...bodySubSizeStyle }}>
                    {e.company}
                    {(e.startDate || e.endDate) && ` · ${[e.startDate, e.endDate].filter(Boolean).join(" – ")}`}
                  </p>
                  {e.description && (
                    <p className="mt-1 line-clamp-3 leading-relaxed opacity-80" style={{ color: cardText, ...bodySubSizeStyle }}>
                      {e.description}
                    </p>
                  )}
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
                className="flex items-start gap-2.5 px-3 py-2.5 backdrop-blur-sm"
                style={cardStyle}
              >
                <GraduationCap size={14} className="mt-0.5 shrink-0" style={{ color: cardText }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold" style={{ color: cardText, ...bodySizeStyle }}>
                    {e.institution || "Institution"}
                  </p>
                  <p className="truncate opacity-70" style={{ color: cardText, ...bodySubSizeStyle }}>
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
                className="flex items-start gap-2.5 px-3 py-2.5 backdrop-blur-sm"
                style={cardStyle}
              >
                <Package size={14} className="mt-0.5 shrink-0" style={{ color: cardText }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold" style={{ color: cardText, ...bodySizeStyle }}>
                    {p.name || "Product"}
                  </p>
                  {p.description && (
                    <p className="truncate opacity-70" style={{ color: cardText, ...bodySubSizeStyle }}>
                      {p.description}
                    </p>
                  )}
                </div>
                {p.price && (
                  <span className="shrink-0 font-black" style={{ color: cardText, ...bodySubSizeStyle }}>
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
              className="mt-2 flex items-start gap-2.5 px-3 py-2.5 backdrop-blur-sm"
              style={cardStyle}
            >
              <Building2 size={14} className="mt-0.5 shrink-0" style={{ color: cardText }} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold" style={{ color: cardText, ...bodySizeStyle }}>
                  {business.name}
                </p>
                {(business.category || business.description) && (
                  <p className="truncate opacity-70" style={{ color: cardText, ...bodySubSizeStyle }}>
                    {business.category || business.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

          {/* Footer — pinned to the bottom when content is short, scrolls with content when it overflows */}
          <div className="mt-auto shrink-0 pt-6 pb-2 text-center text-[10px] opacity-60" style={{ color: pageColor }}>
            <p>Report • Privacy</p>
            <p>More from ClickCard</p>
          </div>
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
