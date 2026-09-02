import { useEffect, type CSSProperties, type ReactNode } from "react";
import { Share, Phone, MessageCircle, Mail, Globe, Briefcase, GraduationCap, Package, Building2, User, MapPin } from "lucide-react";
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
  link?: string;
}

export interface LiveProfileBusiness {
  name?: string;
  category?: string;
  description?: string;
  mapUrl?: string;
}

/** Renders a real link when `href` is given (interactive/public mode), otherwise
 * the same decorative `<div>` the preview panels have always used. */
function LinkOrDiv({
  href,
  className,
  style,
  title,
  children,
}: {
  href?: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
  children: ReactNode;
}) {
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} style={style} title={title}>
        {children}
      </a>
    );
  }
  return (
    <div className={className} style={style} title={title}>
      {children}
    </div>
  );
}

/**
 * The Linktree-style profile card. Shared by every "live preview" panel
 * (Studio, Dashboard, Profile editor) AND the real public page — pass
 * `interactive` for the latter so it fills the viewport and every row is a
 * real link, instead of the fixed-size decorative preview box.
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
  backgroundImageUrl,
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
  interactive = false,
  onShare,
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
  business?: LiveProfileBusiness[];
  headerLayout?: HeaderLayout;
  wallpaperType?: WallpaperType;
  backgroundImageUrl?: string;
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
  /** True for the real public page: sizes to fill the viewport instead of the
   * fixed 320×680 preview box, and every row becomes a real, clickable link
   * instead of decorative chrome. False (default) for every "live preview"
   * panel — Studio, Dashboard, Profile editor. */
  interactive?: boolean;
  /** Called when the header's share icon is tapped (interactive mode only). */
  onShare?: () => void;
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
      : wallpaperType === "image" && backgroundImageUrl
      ? {
          backgroundColor,
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.55)), url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
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
    contact?.phone && { icon: Phone, label: "Call", href: `tel:${contact.phone}` },
    contact?.whatsapp && {
      icon: MessageCircle,
      label: "WhatsApp",
      href: `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`,
    },
    contact?.email && { icon: Mail, label: "Email", href: `mailto:${contact.email}` },
    contact?.website && {
      icon: Globe,
      label: "Website",
      href: /^https?:\/\//.test(contact.website) ? contact.website : `https://${contact.website}`,
    },
  ].filter(Boolean) as { icon: typeof Phone; label: string; href: string }[];

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
      className={
        // Full viewport on mobile (standard link-in-bio behavior); on sm+
        // the card sizes to its own content instead of forcing 100vh, so a
        // short profile doesn't leave a huge blank gap above the footer —
        // it reads the same compact size as the Dashboard/Studio preview.
        interactive
          ? "relative h-[100dvh] w-full overflow-hidden sm:mx-auto sm:my-8 sm:h-[85vh] sm:max-w-[420px] sm:rounded-3xl sm:shadow-card"
          : "relative rounded-3xl overflow-hidden"
      }
      style={{
        width: interactive ? undefined : 320,
        height: interactive ? undefined : 680,
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

      {/* Header with icons — filled with the theme's own button colours
          (not a fixed white-on-textColor guess) so they read as real
          buttons and stay legible against any wallpaper, and the share
          icon actually gets a matching circle instead of floating with no
          background at all. */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
        {interactive ? (
          <a
            href="/"
            aria-label="ClickCard home"
            className={`grid h-8 w-8 place-items-center rounded-full ${heroMode ? "text-white backdrop-blur-sm" : ""}`}
            style={heroMode ? { background: "#ffffff33" } : { background: buttonColor, color: buttonTextColor || pageColor }}
          >
            <h3 className="text-sm ">CC</h3>
          </a>
        ) : (
          <div
            className={`grid h-8 w-8 place-items-center rounded-full ${heroMode ? "text-white backdrop-blur-sm" : ""}`}
            style={heroMode ? { background: "#ffffff33" } : { background: buttonColor, color: buttonTextColor || pageColor }}
          >
            <h3 className="text-sm ">CC</h3>
          </div>
        )}
        {interactive ? (
          <button
            type="button"
            onClick={onShare}
            aria-label="Share"
            className={`grid h-8 w-8 place-items-center rounded-full ${heroMode ? "text-white backdrop-blur-sm" : ""}`}
            style={heroMode ? { background: "#ffffff33" } : { background: buttonColor, color: buttonTextColor || pageColor }}
          >
            <Share className="w-5 h-5" />
          </button>
        ) : (
          <div
            className={`grid h-8 w-8 place-items-center rounded-full ${heroMode ? "text-white backdrop-blur-sm" : ""}`}
            style={heroMode ? { background: "#ffffff33" } : { background: buttonColor, color: buttonTextColor || pageColor }}
          >
            <Share className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Scrollable content — everything filled in shows here. Fills the
          full-viewport mobile card (so short content still scrolls inside a
          fixed frame); on sm+ the outer card is content-sized, so this just
          sizes to match instead of stretching into blank space. */}
      <div className="no-scrollbar relative z-10 flex flex-col items-center pb-16 text-center h-full w-full overflow-y-auto">
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
              <LinkOrDiv
                key={a.label}
                href={interactive ? a.href : undefined}
                title={a.label}
                className="flex items-center justify-center py-3 backdrop-blur-sm"
                style={cardStyle}
              >
                <a.icon size={18} style={{ color: cardText }} />
              </LinkOrDiv>
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
                  <LinkOrDiv
                    key={`icon-${s.platform}-${i}`}
                    href={interactive ? s.url : undefined}
                    className="grid h-11 w-11 shrink-0 place-items-center backdrop-blur-sm"
                    style={cardStyle}
                    title={s.username ? `@${s.username}` : s.platform}
                  >
                    <Icon size={17} style={{ color: cardText }} />
                  </LinkOrDiv>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 w-full shrink-0 space-y-2">
              {socialLinks.map((s, i) => {
                const Icon = getSocialIcon(s.platform);
                return (
                  <LinkOrDiv
                    key={`row-${s.platform}-${i}`}
                    href={interactive ? s.url : undefined}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-left backdrop-blur-sm"
                    style={cardStyle}
                  >
                    <Icon size={15} style={{ color: cardText }} />
                    <span className="min-w-0 flex-1 truncate font-bold" style={{ color: cardText, ...bodySizeStyle }}>
                      {s.username ? `@${s.username}` : s.platform}
                    </span>
                  </LinkOrDiv>
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
              <LinkOrDiv
                key={i}
                href={interactive ? p.link : undefined}
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
                    {p.price.trim().startsWith("₹") ? p.price : `₹${p.price}`}
                  </span>
                )}
              </LinkOrDiv>
            ))}
          </div>
        )}

        {/* Business */}
        {business && business.filter((b) => b.name).length > 0 && (
          <div className="mt-4 w-full shrink-0 space-y-2 text-left">
            <p className="text-[10px] font-black uppercase tracking-wider opacity-60" style={{ color: pageColor }}>
              Business
            </p>
            {business.filter((b) => b.name).map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 px-3 py-2.5 backdrop-blur-sm"
                style={cardStyle}
              >
                <Building2 size={14} className="mt-0.5 shrink-0" style={{ color: cardText }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold" style={{ color: cardText, ...bodySizeStyle }}>
                    {b.name}
                  </p>
                  {(b.category || b.description) && (
                    <p className="truncate opacity-70" style={{ color: cardText, ...bodySubSizeStyle }}>
                      {b.category || b.description}
                    </p>
                  )}
                  {interactive && b.mapUrl && (
                    <a
                      href={b.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 font-bold underline-offset-2 hover:underline"
                      style={{ color: cardText, ...bodySubSizeStyle }}
                    >
                      <MapPin size={11} /> View on map
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

          {/* Footer — pinned to the bottom when content is short, scrolls with content when it overflows */}
          <div className="mt-auto shrink-0 pt-6 pb-2 flex flex-col items-center gap-4">
            {interactive ? (
              <a
                href="/signup"
                className="shrink-0 px-8 py-2.5 rounded-full font-bold text-sm shadow-lg transition hover:opacity-90"
                style={{ background: textColor, color: bg }}
              >
                Join on ClickCard
              </a>
            ) : (
              <button
                className="shrink-0 px-8 py-2.5 rounded-full font-bold text-sm shadow-lg transition hover:opacity-90"
                style={{
                  background: textColor,
                  color: bg,
                }}
              >
                Join on ClickCard
              </button>
            )}
            <div className="text-center text-[10px] opacity-60" style={{ color: pageColor }}>
              <p>Report • Privacy</p>
              <p>More from ClickCard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
