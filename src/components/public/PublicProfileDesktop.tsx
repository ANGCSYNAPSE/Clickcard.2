import { useEffect, type CSSProperties } from "react";
import { ChevronRight, ExternalLink, Phone, MessageCircle, Mail, Globe, Briefcase, GraduationCap, Package, Building2, User, Share } from "lucide-react";
import { getSocialIcon } from "@/lib/socialPlatforms";
import type {
  WallpaperType,
  GradientDirection,
  ButtonStyle,
  ButtonRoundness,
  ButtonShadow,
  SocialLinksStyle,
  HeaderLayout,
} from "@/components/app/LiveProfileCard";

interface Contact {
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
}
interface Experience {
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}
interface Education {
  institution?: string;
  degree?: string;
  field?: string;
  startYear?: string;
  endYear?: string;
}
interface Product {
  name?: string;
  price?: string;
  description?: string;
  link?: string;
}
interface Business {
  name?: string;
  category?: string;
  description?: string;
  profileLink?: string;
}

/**
 * The real public page's desktop (lg+) layout — a single wide glass card
 * (large photo on the left, Experience/Education/Products/Business rows on
 * the right), themed with *every* Customize setting the mobile card
 * respects (wallpaper, button color/style/roundness/shadow, social link
 * style, fonts, title/body sizes, noise) — so changing anything in
 * Customize shows up here the same way it does on mobile, not just on a
 * fixed subset. Below lg, the page still renders LiveProfileCard as usual —
 * this is purely an additional desktop presentation of the same data, not
 * a replacement for any in-app preview.
 */
export default function PublicProfileDesktop({
  primary,
  accent,
  theme,
  name,
  username,
  avatarUrl,
  bannerUrl,
  headerLayout = "classic",
  bio,
  socialLinks,
  contact,
  experience,
  education,
  products,
  business,
  onShare,
  referralCode,
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
}: {
  primary: string;
  accent: string;
  theme: "light" | "dark";
  name: string;
  username?: string | null;
  avatarUrl?: string;
  bannerUrl?: string;
  headerLayout?: HeaderLayout;
  bio?: string;
  socialLinks?: { platform: string; username?: string; url?: string }[];
  contact?: Contact;
  experience?: Experience[];
  education?: Education[];
  products?: Product[];
  business?: Business[];
  onShare?: () => void;
  referralCode?: string;
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
  const textColor = pageTextColor || (isDark ? "#ffffff" : "#1a1a1a");
  // Picks black or white by actual luminance of the color it'll sit on top
  // of — not the raw theme flag, which can disagree with `textColor` once
  // `pageTextColor` overrides it (e.g. a light theme with a light
  // pageTextColor), leaving light-on-light text.
  const contrastText = (hex: string) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (!m) return isDark ? "#000000" : "#ffffff";
    const n = parseInt(m[1], 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#000000" : "#ffffff";
  };
  // A translucent version of `textColor` itself — not a value picked from
  // the raw `isDark` flag, which can disagree with what `textColor` (and
  // its surroundings) actually is once `pageTextColor` or a photo
  // background is involved, leaving muted labels invisible even though the
  // title/bio right next to them (which do use textColor) read fine.
  const mutedColor = /^#[0-9a-f]{6}$/i.test(textColor) ? `${textColor}8c` : isDark ? "rgba(255,255,255,0.55)" : "rgba(26,26,26,0.5)";
  const titleTextColor = matchTitleFont ? textColor : titleColor || textColor;
  // Same colors the mobile card uses for its username/bio in every header
  // layout, hero/cutout included — no forced white override. Mobile relies
  // on the owner's own titleColor/pageTextColor choice here, not a fixed
  // color, so desktop should read identically rather than diverging in the
  // one case (hero) it used to special-case.
  const overPhoto = headerLayout === "hero" || headerLayout === "cutout";
  const legibilityShadow = overPhoto ? "0 1px 4px rgba(0,0,0,0.45)" : undefined;
  const headerTitleColor = titleTextColor;
  const headerBioColor = textColor;
  const fontStack = (fontName: string) => `"${fontName}", sans-serif`;
  const pageFontFamily = fontStack(pageFont);
  const titleFontFamily = fontStack(matchTitleFont ? pageFont : titleFont);
  // Sized up from the raw Customize values — this card is much larger than
  // the mobile one, so the same point sizes that read fine there end up
  // small and hard to read here. Still scales with what the owner picked,
  // just with a bigger floor/offset for this layout.
  const bioSizeStyle: CSSProperties = { fontSize: Math.max(bioFontSize + 5, 16) };
  const bodySizeStyle: CSSProperties = { fontSize: Math.max(bodyFontSize + 4, 16) };
  const bodySubSizeStyle: CSSProperties = { fontSize: Math.max(bodyFontSize + 1, 13) };

  // Same wallpaper computation as LiveProfileCard (the mobile card), so the
  // desktop page sits on the exact same background the owner picked in
  // Customize instead of an unrelated look invented just for this layout.
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
      : { background: backgroundColor };

  // Same icon-pill / row treatment as the mobile card's buttons — color,
  // glass/solid/outline style, corner roundness and shadow all carried over
  // instead of a fixed look for this layout.
  const cardText = buttonTextColor || textColor;
  const isGlass = buttonStyle === "glass";
  const pillBg = buttonStyle === "outline" ? "transparent" : isGlass ? `${buttonColor}26` : `${buttonColor}e6`;
  const pillBorder = buttonStyle === "outline" ? buttonColor : isGlass ? "#ffffff4d" : `${cardText}26`;
  const cardRadius = { sharp: 6, slight: 12, medium: 18, full: 9999 }[buttonRoundness];
  const cardShadow = {
    none: "none",
    soft: "0 2px 8px rgba(0,0,0,0.08)",
    strong: "0 6px 20px rgba(0,0,0,0.18)",
    hard: "4px 4px 0 rgba(0,0,0,0.35)",
  }[buttonShadow];
  const pillStyle: CSSProperties = {
    background: pillBg,
    border: `1px solid ${pillBorder}`,
    boxShadow: cardShadow,
    backdropFilter: isGlass ? "blur(16px) saturate(180%)" : undefined,
    WebkitBackdropFilter: isGlass ? "blur(16px) saturate(180%)" : undefined,
  };
  const rowStyle: CSSProperties = { ...pillStyle, borderRadius: cardRadius };

  // The glass card itself stays a translucent surface (this desktop
  // layout's own visual language, per the reference) but tinted from the
  // same buttonColor rather than an unrelated fixed value.
  const glassBg = isDark ? `${buttonColor}14` : `${buttonColor}40`;
  const glassBorder = isDark ? `${buttonColor}26` : `${buttonColor}66`;
  // Solid, not alpha-blended with the wallpaper behind it — a translucent
  // row let the gradient bleed through and shift shade top-to-bottom.
  const rowBg = buttonColor;

  const contactActions = [
    contact?.phone && { label: "Call", icon: Phone, href: `tel:${contact.phone}` },
    contact?.whatsapp && { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}` },
    contact?.email && { label: "Email", icon: Mail, href: `mailto:${contact.email}` },
    contact?.website && {
      label: "Website",
      icon: Globe,
      href: /^https?:\/\//.test(contact.website) ? contact.website : `https://${contact.website}`,
    },
  ].filter(Boolean) as { label: string; icon: typeof Phone; href: string }[];

  const businesses = (business || []).filter((b) => b.name);
  const joinHref = referralCode ? `/signup?ref=${encodeURIComponent(referralCode)}` : "/signup";

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ ...wallpaperStyle, fontFamily: pageFontFamily }}>
      {/* Noise overlay — matches LiveProfileCard: only shown over a gradient wallpaper */}
      {wallpaperType === "gradient" && noise && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(#ffffff22 1px, transparent 1px)", backgroundSize: "3px 3px" }}
        />
      )}

      <div className="relative z-10 flex min-h-screen items-center justify-center p-10">
        <div
          className="relative flex w-full max-w-6xl flex-col gap-8 overflow-hidden rounded-[40px] p-10 shadow-2xl backdrop-blur-2xl"
          style={{ background: glassBg, border: `1px solid ${glassBorder}` }}
        >
          {onShare && (
            <button
              onClick={onShare}
              className="absolute right-6 top-4 grid h-11 w-11 place-items-center rounded-full transition hover:opacity-80"
              style={pillStyle}
              aria-label="Share"
            >
              <Share size={17} style={{ color: cardText }} />
            </button>
          )}

          <div className="grid grid-cols-[380px_1fr] gap-10 mt-8">
            {/* Left — banner, photo, name, bio, contact + social */}
            <div className="flex h-full flex-col items-center justify-center text-center">
              {/* Same header treatment as the mobile card, per the owner's
                  chosen layout — hero/cutout/banner/shape/classic — instead
                  of one fixed look regardless of what's set in Customize. */}
              {headerLayout === "hero" ? (
                // Bleeds only to the card's top edge (-mt-10 cancels this
                // column's top padding) — not left/right, since pulling it
                // sideways too would shift the photo's own center away from
                // the column's true center, throwing it out of alignment
                // with the centered username/bio/icons below it.
                <div className="relative -mt-10 w-full shrink-0 overflow-hidden" style={{ height: 360 }}>
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
                      <User size={56} className="text-white/85" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              ) : headerLayout === "cutout" ? (
                <div className="flex w-full shrink-0 flex-col items-center">
                  <p
                    className="-mb-3 z-[1] font-black leading-none"
                    style={{ color: headerTitleColor, fontFamily: titleFontFamily, transform: "rotate(-3deg)", fontSize: Math.max(titleFontSize + 8, 24), textShadow: legibilityShadow }}
                  >
                    @{username || "username"}
                  </p>
                  <div className="relative w-full" style={{ height: 220 }}>
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <div className="grid h-full place-items-center">
                        <User size={56} className="opacity-30" style={{ color: textColor }} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {headerLayout === "banner" && bannerUrl && (
                    <div className="h-32 w-full overflow-hidden rounded-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div
                    className={`grid shrink-0 place-items-center overflow-hidden shadow-lg ${
                      headerLayout === "banner" && bannerUrl ? "-mt-12 h-20 w-20" : "mt-0 h-24 w-24"
                    }`}
                    style={{
                      background: avatarUrl ? undefined : `linear-gradient(135deg, ${primary}, ${accent})`,
                      borderRadius: headerLayout === "shape" ? "42% 58% 70% 30% / 45% 45% 55% 55%" : "9999px",
                      border: headerLayout === "banner" && bannerUrl ? `4px solid ${isDark ? "#000000" : "#ffffff"}` : undefined,
                    }}
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User size={headerLayout === "banner" ? 32 : 40} className="text-white/85" strokeWidth={1.5} />
                    )}
                  </div>
                </>
              )}

              {headerLayout !== "cutout" && (
                <h1
                  className={`font-black ${headerLayout === "hero" ? "-mt-6" : "mt-6"}`}
                  style={{ color: headerTitleColor, fontFamily: titleFontFamily, fontSize: Math.max(titleFontSize + 8, 24), textShadow: legibilityShadow }}
                >
                  @{username || "username"}
                </h1>
              )}
              {bio && (
                <p className="mt-3 max-w-[320px] leading-relaxed" style={{ color: headerBioColor, opacity: 0.7, textShadow: legibilityShadow, ...bioSizeStyle }}>
                  {bio}
                </p>
              )}

              {contactActions.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {contactActions.map((a, i) => (
                    <a key={i} href={a.href} target="_blank" rel="noreferrer" className="grid h-12 w-12 place-items-center transition hover:opacity-80" style={rowStyle}>
                      <a.icon size={18} style={{ color: cardText }} />
                    </a>
                  ))}
                </div>
              )}

              {socialLinks && socialLinks.length > 0 && (
                socialLinksStyle === "icons" ? (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                    {socialLinks.map((s, i) => {
                      const Icon = getSocialIcon(s.platform);
                      return (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          title={s.username ? `@${s.username}` : s.platform}
                          className="grid h-11 w-11 place-items-center transition hover:opacity-80"
                          style={rowStyle}
                        >
                          <Icon size={16} style={{ color: cardText }} />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-3 flex w-full flex-col gap-2">
                    {socialLinks.map((s, i) => {
                      const Icon = getSocialIcon(s.platform);
                      return (
                        <a key={i} href={s.url} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-3 py-2.5 text-left transition hover:opacity-90" style={rowStyle}>
                          <Icon size={15} style={{ color: cardText }} />
                          <span className="min-w-0 flex-1 truncate font-bold" style={{ color: cardText, ...bodySizeStyle }}>
                            {s.username ? `@${s.username}` : s.platform}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                )
              )}
            </div>

            {/* Right — Experience / Education / Products / Business */}
            <div className="flex flex-col justify-center gap-8">
              {experience && experience.length > 0 && (
                <section>
                  <p className="mb-3 text-sm font-black uppercase tracking-wider" style={{ color: mutedColor }}>
                    Experience
                  </p>
                  <div className="flex flex-col gap-3">
                    {experience.map((e, i) => (
                      <div key={i} className="flex items-center gap-4 p-4" style={{ background: rowBg, border: `1px solid ${glassBorder}`, borderRadius: cardRadius }}>
                        <Briefcase size={17} className="shrink-0" style={{ color: cardText }} />
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
                </section>
              )}

              {education && education.length > 0 && (
                <section>
                  <p className="mb-3 text-sm font-black uppercase tracking-wider" style={{ color: mutedColor }}>
                    Education
                  </p>
                  <div className="flex flex-col gap-3">
                    {education.map((e, i) => (
                      <div key={i} className="flex items-center gap-4 p-4" style={{ background: rowBg, border: `1px solid ${glassBorder}`, borderRadius: cardRadius }}>
                        <GraduationCap size={17} className="shrink-0" style={{ color: cardText }} />
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
                </section>
              )}

              {products && products.length > 0 && (
                <section>
                  <p className="mb-3 text-sm font-black uppercase tracking-wider" style={{ color: mutedColor }}>
                    Products &amp; services
                  </p>
                  <div className="flex flex-col gap-3">
                    {products.map((p, i) => (
                      <a
                        key={i}
                        href={p.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-4 p-4 transition hover:opacity-90"
                        style={{ background: rowBg, border: `1px solid ${glassBorder}`, borderRadius: cardRadius }}
                      >
                        <Package size={17} className="shrink-0" style={{ color: cardText }} />
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
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {businesses.length > 0 && (
                <section>
                  <p className="mb-3 text-sm font-black uppercase tracking-wider" style={{ color: mutedColor }}>
                    Business
                  </p>
                  <div className="flex flex-col gap-3">
                    {businesses.map((b, i) => (
                      <a
                        key={i}
                        href={b.profileLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-4 p-4 transition hover:opacity-90"
                        style={{ background: rowBg, border: `1px solid ${glassBorder}`, borderRadius: cardRadius }}
                      >
                        <Building2 size={17} className="shrink-0" style={{ color: cardText }} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold" style={{ color: cardText, ...bodySizeStyle }}>
                            {b.name}
                          </p>
                          <p className="truncate opacity-70" style={{ color: cardText, ...bodySubSizeStyle }}>
                            {b.category || b.description}
                          </p>
                        </div>
                        {b.profileLink && <ExternalLink size={17} className="shrink-0 opacity-60" style={{ color: cardText }} />}
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Footer — same CTA + branding the mobile card ends on */}
          <div className="flex flex-col items-center gap-3 border-t pt-6" style={{ borderColor: glassBorder }}>
            <a
              href={joinHref}
              className="rounded-full px-8 py-2.5 text-xl font-bold shadow-lg transition hover:opacity-90"
              style={{ background: textColor, color: contrastText(textColor) }}
            >
              Join on ClickCard
            </a>
            <div className="flex gap-10 text-center text-xs" style={{ color: mutedColor }}>
              <p>Report • Privacy</p>
              <p>More from ClickCard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
