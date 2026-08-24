import { CSSProperties, useEffect, useId, useRef, useState } from "react";
import { Phone, Mail, Globe, MessageCircle, MapPin, Building2 } from "lucide-react";
import type { FullProfile } from "@/types";
import { SITE_URL } from "@/lib/config";
import { getContrastText } from "@/lib/color";
import { CARD_TEMPLATES, type CardElement, type CardFaceDef } from "@/lib/cardTemplates";

/** Icons an elements-based template's `type: "icon"` entries can reference by name. */
const ICON_LIBRARY: Record<string, typeof Phone> = {
  phone: Phone,
  mail: Mail,
  globe: Globe,
  whatsapp: MessageCircle,
  location: MapPin,
  brandLogo: Building2,
};

/**
 * Lightweight client-side preview of the digital business-card templates
 * (see @/lib/cardTemplates). Visually matches CardTemplateService.js on the
 * BE so the rendered PDF is recognisable from the preview. Intentionally not
 * a 1:1 copy of every pixel — the BE PDF is the source of truth for download.
 */

type Icon = typeof Phone;

/**
 * Standard business-card trim size — 89 × 51 mm — applied as a CSS aspect
 * ratio so every template (front and back alike) renders at true card
 * proportions regardless of pixel width.
 */
const CARD_ASPECT_RATIO = "89 / 51";

/** Resolved theme colours, threaded to the sub-components below. */
interface Tokens {
  isDark: boolean;
  bg: string;
  fg: string;
  subtle: string;
  surface: string;
  primary: string;
  accent: string;
}

/* Sub-components live at module scope on purpose: declaring them inside the
   render body gives them a new identity every render, which makes React remount
   the subtree — the avatar <img> visibly reloads on each palette/template click. */

function Avatar({
  t,
  size = 80,
  picture,
  initials,
  borderColor,
}: {
  t: Tokens;
  size?: number;
  picture?: string;
  initials: string;
  /** Matches the card's own surface so the avatar reads as a cut-out. */
  borderColor?: string;
}) {
  return (
    <div
      className="grid place-items-center overflow-hidden rounded-full font-black"
      style={{
        width: size,
        height: size,
        background: t.isDark ? "#12403c" : "#ffffff",
        color: t.primary,
        fontSize: size * 0.36,
        border: `4px solid ${borderColor ?? (t.isDark ? t.bg : "#FBF1E1")}`,
      }}
    >
      {picture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={picture} alt="" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

function Row({ t, icon: I, label }: { t: Tokens; icon: Icon; label: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold"
      style={{ background: t.surface, color: t.fg }}
    >
      <I size={13} style={{ color: t.accent }} className="shrink-0" />
      <span className="min-w-0 break-words">{label}</span>
    </div>
  );
}

function Footer({ t, url }: { t: Tokens; url: string }) {
  return (
    <div className="mt-4 text-center text-[10px]" style={{ color: t.subtle }}>
      {url || "clickcard.app"}
    </div>
  );
}

/** Repeating chevron/arrow tile used by the Chevron Pattern template. */
function ChevronPattern({ id, fill, bg }: { id: string; fill: string; bg: string }) {
  return (
    <svg width="100%" height="100%" className="absolute inset-0" preserveAspectRatio="xMidYMin slice">
      <defs>
        <pattern id={id} width="26" height="15" patternUnits="userSpaceOnUse">
          <rect width="26" height="15" fill={bg} />
          <path d="M0,15 L13,0 L26,15" fill="none" stroke={fill} strokeWidth="5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * Renders one face of a fully data-driven (elements-based) template — each
 * element is a percentage-positioned text or shape read straight off the
 * template definition. `x` is treated as the element's horizontal centre.
 * `designWidth` converts the template's design-canvas px values (fontSize,
 * letterSpacing) into container query units, so they stay correctly
 * proportioned at whatever size the face actually renders at.
 */
function ElementsFace({
  face,
  fieldValue,
  designWidth,
  fallbackBg,
}: {
  face: CardFaceDef;
  fieldValue: (field?: string) => string;
  /** The template's reference canvas width — element font sizes/letter-spacing are px values authored against this. */
  designWidth: number;
  fallbackBg: string;
}) {
  // Re-derived from this element's *actual* rendered width on every
  // layout (via ResizeObserver), so text stays correctly proportioned
  // whether this face renders full-size or squeezed side-by-side with its
  // other face — same goal container query units (cqw) served before, but
  // as plain computed px. html2canvas manually reimplements CSS layout in
  // JS and doesn't understand container query units, so it was silently
  // miscomputing font-size/letter-spacing during PDF export capture,
  // producing doubled/overlapping glyphs. Plain px renders identically
  // on-screen and in html2canvas's capture.
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(designWidth);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setContainerWidth(width);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const pxToActual = (px: number) => `${(px / designWidth) * containerWidth}px`;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{
        background: fallbackBg,
        backgroundImage: face.background?.image ? `url(${face.background.image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {face.elements.map((el: CardElement) => {
        // `x` is a horizontal anchor whose meaning follows the element's own
        // alignment: centered text/shapes/icons anchor on their centre
        // (translateX(-50%)), but a left- or right-aligned text element
        // anchors on that edge instead — needed once a template (e.g. a
        // left-aligned contact panel) places text by its edge, not its middle.
        const anchor = el.type === "text" ? el.style.textAlign ?? "center" : "center";
        const anchorTransform = anchor === "left" ? undefined : anchor === "right" ? "translateX(-100%)" : "translateX(-50%)";
        const base: CSSProperties = {
          position: "absolute",
          left: `${el.position.x}%`,
          top: `${el.position.y}%`,
          width: `${el.size.width}%`,
          transform: anchorTransform,
        };
        if (el.type === "shape") {
          return (
            <div
              key={el.id}
              style={{ ...base, height: `${el.size.height}%`, background: el.style.backgroundColor }}
            />
          );
        }
        if (el.type === "icon") {
          // A logo icon is bound to a field (the user's uploaded business
          // logo) — render that actual image once one exists, and render
          // nothing at all (not even a placeholder glyph) until it does.
          // Purely decorative icons (no `field`, e.g. the phone/mail/globe
          // glyphs) always show their fixed icon.
          if (el.field) {
            const logoUrl = fieldValue(el.field);
            if (!logoUrl) return null;
            return (
              <div key={el.id} style={{ ...base, height: `${el.size.height}%` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            );
          }
          const IconComp = ICON_LIBRARY[el.style.iconName ?? ""] ?? Building2;
          return (
            <div key={el.id} style={{ ...base, height: `${el.size.height}%` }}>
              <IconComp style={{ width: "100%", height: "100%", color: el.style.iconColor }} />
            </div>
          );
        }
        const text = fieldValue(el.field);
        if (!text) return null;
        return (
          <div
            key={el.id}
            // Deliberately not `truncate` (its ellipsis triggers an
            // html2canvas glyph-rendering bug during PDF export — ghosted,
            // overlapping characters) and not `break-words` either — these
            // fields are independently positioned by fixed y% with no
            // spare vertical room for a neighbour, so a wrapped second
            // line just overlaps the field below it instead. `nowrap`
            // without `overflow-hidden` is the one option that's both
            // safe to export and safe to stack tightly: with
            // overflow-hidden, an explicit `lineHeight` was still getting
            // computed differently by html2canvas than by the real
            // browser, which pushed each glyph's top edge above its own
            // box and clipped it off — every line of every card's back
            // face lost roughly the top half of its text. An explicit
            // `lineHeight` (not left to the `leading-tight` class) plus
            // no self-clipping fixes it whichever way html2canvas rounds.
            className="whitespace-nowrap"
            style={{
              ...base,
              fontFamily: el.style.fontFamily,
              fontSize: el.style.fontSize ? pxToActual(el.style.fontSize) : undefined,
              lineHeight: el.style.fontSize ? pxToActual(el.style.fontSize * 1.2) : undefined,
              fontWeight: el.style.fontWeight,
              color: el.style.color,
              textAlign: el.style.textAlign,
              letterSpacing: el.style.letterSpacing ? pxToActual(el.style.letterSpacing) : undefined,
              textTransform: el.style.textTransform === "uppercase" ? "uppercase" : undefined,
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}

export default function CardPreview({
  templateId,
  primary,
  accent,
  theme,
  profile,
  username,
  fontFamily,
  textColor,
  paletteStyle = "fill",
  backgroundColor = "#ffffff",
  headerColor,
}: {
  templateId: string;
  primary: string;
  accent: string;
  theme: "light" | "dark";
  profile: FullProfile;
  username?: string | null;
  /** Google Font family applied to the whole card (inherited by all text). */
  fontFamily?: string;
  /** Overrides the default light/dark text colour when set. */
  textColor?: string;
  /** How the card's base surface renders — a flat colour, a primary→accent gradient, or a softened gradient. */
  paletteStyle?: "fill" | "gradient" | "blur";
  /** Overrides the header band / header block / side panel colour (falls back to primary). */
  headerColor?: string;
  /** Solid background colour used when paletteStyle is "fill". */
  backgroundColor?: string;
}) {
  const patternId = useId();
  const p = profile.personal || {};
  const c = profile.contact || {};
  const biz = profile.business || {};
  const fullName = p.fullName || "Your name";
  const initials =
    fullName.trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "Y";
  const publicUrl = username
    ? `${SITE_URL}/${username}`
    : "";

  const isDark = theme === "dark";

  // The card's base surface — solid fill, a primary→accent gradient, or that
  // gradient softened with a translucent white wash (no backdrop-filter, so
  // it renders identically in the exported PDF/PNG too).
  const resolvedBg =
    paletteStyle === "gradient"
      ? `linear-gradient(135deg, ${primary}, ${accent})`
      : paletteStyle === "blur"
      ? `linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), linear-gradient(135deg, ${primary}, ${accent})`
      : backgroundColor;

  const autoFg =
    paletteStyle === "gradient" || paletteStyle === "blur"
      ? getContrastText(primary)
      : getContrastText(backgroundColor);

  const t: Tokens = {
    isDark,
    bg: isDark ? "#0b2e2b" : "#ffffff",
    fg: textColor || (isDark ? "#ffffff" : autoFg),
    subtle: isDark ? "rgba(255,255,255,0.55)" : "rgba(11,46,43,0.55)",
    surface: isDark ? "rgba(255,255,255,0.07)" : "#ffffff",
    primary,
    accent,
  };

  const cardStyle: CSSProperties = {
    background: resolvedBg,
    color: t.fg,
    borderRadius: 24,
    width: "100%",
    maxWidth: 420,
    overflow: "hidden",
    // boxShadow: "0 30px 60px -20px rgba(11,46,43,0.22)",
    fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : undefined,
  };

  const contact = (
    [
      c.phone && { icon: Phone, label: c.phone },
      c.whatsapp && { icon: MessageCircle, label: c.whatsapp },
      c.email && { icon: Mail, label: c.email },
      c.website && { icon: Globe, label: c.website },
      (c.city || c.country) && {
        icon: MapPin,
        label: [c.city, c.country].filter(Boolean).join(", "),
      },
    ].filter(Boolean) as { icon: Icon; label: string }[]
  ).slice(0, 4);

  const rows = contact.map((r, i) => <Row key={i} t={t} icon={r.icon} label={r.label} />);

  // --- template variants ---
  // When templateId is empty (user unselected a template), the component
  // falls through to the default "minimal-mono" design (shown at the end).
  // That default uses the primary, accent, and backgroundColor colors the
  // user selected, creating a clean, customizable card design.

  if (templateId === "chevron-pattern") {
    return (
      <div style={{ ...cardStyle, background: "#ffffff", color: "#0b2e2b" }}>
        <div className="relative h-24 overflow-hidden">
          <ChevronPattern id={`${patternId}-chevron`} fill={accent} bg="#ffffff" />
        </div>
        <div className="px-6 pb-5 pt-4 text-center">
          <h2 className="break-words text-xl font-black uppercase tracking-wide">
            {biz.name || fullName}
          </h2>
          {p.tagline && (
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: t.subtle }}>
              {p.tagline}
            </p>
          )}
          <div className="mx-auto mt-3 h-0.5 w-10" style={{ background: accent }} />
          <div className="mt-4 space-y-1.5 text-left">{rows}</div>
          <Footer t={t} url={publicUrl} />
        </div>
      </div>
    );
  }

  if (templateId === "geo-triangle") {
    return (
      <div style={{ ...cardStyle, background: "#ffffff", color: "#0b2e2b" }} className="relative overflow-hidden">
        <div
          className="absolute left-0 top-0 h-24 w-24"
          style={{ background: accent, clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        />
        <div
          className="absolute bottom-0 right-0 h-20 w-28"
          style={{ background: primary, clipPath: "polygon(100% 100%, 0 100%, 100% 0)" }}
        />
        <div className="relative px-6 pb-6 pt-8 text-center">
          <div className="flex justify-center">
            <Avatar t={t} size={64} picture={p.profilePicture} initials={initials} borderColor="#ffffff" />
          </div>
          <h2 className="mt-3 break-words text-lg font-black">{fullName}</h2>
          {p.tagline && (
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: primary }}>
              {p.tagline}
            </p>
          )}
          <div className="mx-auto mt-3 h-0.5 w-10" style={{ background: primary }} />
          <div className="mt-4 space-y-1.5 text-left">{rows}</div>
          <Footer t={t} url={publicUrl} />
        </div>
      </div>
    );
  }


  if (templateId === "orange-geometric") {
    const tpl = CARD_TEMPLATES.find((t) => t.id === "orange-geometric");
    const colors = tpl?.colors ?? { background: "#FFFFFF", primary: "#F47700", secondary: "#FF9D00", text: "#555555" };
    const cardDef = tpl?.card;

    // The template's positions/font sizes are authored against this
    // reference canvas width — ElementsFace re-derives the actual scale
    // live from each face's rendered width via CSS container query units.
    // Rendered larger than the design's own scale so the card reads clearly
    // in the studio preview; ElementsFace's cqw-based sizing keeps every
    // face proportioned correctly regardless of this value.
    const RENDER_WIDTH = 340;
    const designWidth = cardDef?.width || RENDER_WIDTH;

    // Every slot always shows something (e.g. `biz.name || "Company"`) so
    // the card reads as a finished design immediately instead of leaving
    // gaps until every field in Details has been filled in.
    const fieldValue = (field?: string) => {
      switch (field) {
        case "fullName":
          return fullName;
        case "jobTitle":
          return p.tagline || "Your Position";
        case "companyName":
          return biz.name || "Company Name";
        case "tagline":
          // No placeholder here — an empty tagline just leaves the company
          // name on its own instead of showing filler text under it.
          return biz.category || "";
        case "phone": {
          // Phone and WhatsApp render on the same line instead of two
          // separate rows — just the phone number when they match or
          // WhatsApp isn't set.
          if (c.phone && c.whatsapp && c.phone !== c.whatsapp) return `${c.phone}  /  ${c.whatsapp}`;
          return c.phone || c.whatsapp || "+1 234 567 89AB";
        }
        case "email":
          return c.email || "you@email.com";
        case "website":
          return c.website || "yourwebsite.com";
        case "address":
          return c.address || [c.city, c.country].filter(Boolean).join(", ") || "Your Address";
        case "logo":
          return biz.logo || "";
        default:
          return "";
      }
    };

    const faceStyle: CSSProperties = {
      width: "100%",
      maxWidth: RENDER_WIDTH,
      aspectRatio: cardDef ? `${cardDef.width} / ${cardDef.height}` : "600 / 1050",
      borderRadius: cardDef?.borderRadius ?? 0,
      overflow: "hidden",
      fontFamily: cardStyle.fontFamily,
    };

    // Portrait faces are too tall to stack — sit the back face beside the
    // front instead of below it, so the preview doesn't run off the page.
    return (
      <div className="flex w-full flex-row items-start justify-center gap-4" style={{ maxWidth: RENDER_WIDTH * 2 + 16 }}>
        {tpl?.front && (
          <div data-card-face="front" style={faceStyle} className="border border-ink/10">
            <ElementsFace face={tpl.front} fieldValue={fieldValue} designWidth={designWidth} fallbackBg={colors.background} />
          </div>
        )}
        {tpl?.back && (
          <div data-card-face="back" style={faceStyle} className="border border-ink/10">
            <ElementsFace face={tpl.back} fieldValue={fieldValue} designWidth={designWidth} fallbackBg={colors.background} />
          </div>
        )}
      </div>
    );
  }

  if (templateId === "navy-geometric") {
    const tpl = CARD_TEMPLATES.find((t) => t.id === "navy-geometric");
    const colors = tpl?.colors ?? { background: "#FFFFFF", primary: "#071D35", secondary: "#DCE1E5", text: "#071D35" };
    const cardDef = tpl?.card;
    const RENDER_WIDTH = 420;
    const designWidth = cardDef?.width || RENDER_WIDTH;

    const fieldValue = (field?: string) => {
      switch (field) {
        case "fullName":
          return fullName;
        case "jobTitle":
          return p.tagline || "Your Position";
        case "companyName":
          return biz.name || "Company Name";
        case "tagline":
          return biz.category || "";
        case "phone": {
          if (c.phone && c.whatsapp && c.phone !== c.whatsapp) return `${c.phone}  /  ${c.whatsapp}`;
          return c.phone || c.whatsapp || "+1 234 567 89AB";
        }
        case "email":
          return c.email || "you@email.com";
        case "website":
          return c.website || "yourwebsite.com";
        case "address":
          return c.address || [c.city, c.country].filter(Boolean).join(", ") || "Your Address";
        case "logo":
          return biz.logo || "";
        default:
          return "";
      }
    };

    const faceStyle: CSSProperties = {
      width: "100%",
      maxWidth: RENDER_WIDTH,
      aspectRatio: cardDef ? `${cardDef.width} / ${cardDef.height}` : "1050 / 600",
      borderRadius: cardDef?.borderRadius ?? 0,
      overflow: "hidden",
      fontFamily: cardStyle.fontFamily,
    };

    // Landscape faces stack vertically — front always on top, back below.
    return (
      <div className="flex w-full flex-col items-center gap-4" style={{ maxWidth: RENDER_WIDTH }}>
        {tpl?.front && (
          <div data-card-face="front" style={faceStyle} className="border border-ink/10">
            <ElementsFace face={tpl.front} fieldValue={fieldValue} designWidth={designWidth} fallbackBg={colors.background} />
          </div>
        )}
        {tpl?.back && (
          <div data-card-face="back" style={faceStyle} className="border border-ink/10">
            <ElementsFace face={tpl.back} fieldValue={fieldValue} designWidth={designWidth} fallbackBg={colors.background} />
          </div>
        )}
      </div>
    );
  }

  // default: minimal-mono — a horizontal card carrying the same palette as
  // every other card (paletteStyle/primary/accent/backgroundColor, via the
  // same `resolvedBg`/`t.fg` used above), with a couple of flat decorative
  // circles so it doesn't read as a bare rectangle. Front is just the
  // business/logo lockup, centered; back carries the person's name, title
  // and every contact line beside it.
  const RENDER_WIDTH = 420;
  const cardBg = resolvedBg;
  const cardFg = t.fg;
  const cardSubtle = `${t.fg}99`;
  const cardDivider = `${t.fg}40`;

  const LogoLockup = ({ compact }: { compact: boolean }) => (
    <div className={compact ? "flex flex-col items-center gap-2.5" : "flex flex-col items-center gap-3"}>
      {biz.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={biz.logo}
          alt=""
          className={compact ? "h-9 w-9 shrink-0 object-contain" : "h-14 w-14 shrink-0 object-contain"}
        />
      ) : (
        <span
          className={`grid shrink-0 place-items-center rounded-lg border-2 ${compact ? "h-9 w-9" : "h-14 w-14"}`}
          style={{ borderColor: cardFg }}
        >
          <Building2 size={compact ? 18 : 26} style={{ color: cardFg }} />
        </span>
      )}
      <span
        className={`break-words font-black uppercase leading-tight tracking-wide ${compact ? "text-left text-[13px]" : "text-center text-xl"}`}
        style={{ color: cardFg }}
      >
        {biz.name || fullName}
      </span>
    </div>
  );

  // Flat, low-opacity circles in the palette's own colours — the same
  // "retro-sunset" geometric-shape language used elsewhere in the app —
  // so the face reads as designed instead of an empty rectangle.
  const Backdrop = () => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -right-10 -top-14 aspect-square w-40 rounded-full"
        style={{ background: accent, opacity: 0.16 }}
      />
      <div
        className="absolute -bottom-16 -left-10 aspect-square w-48 rounded-full"
        style={{ background: primary, opacity: 0.14 }}
      />
    </div>
  );

  const faceStyle: CSSProperties = {
    width: "100%",
    maxWidth: RENDER_WIDTH,
    aspectRatio: "1050 / 600",
    borderRadius: 20,
    overflow: "hidden",
    fontFamily: cardStyle.fontFamily,
    background: cardBg,
    color: cardFg,
  };

  return (
    <div className="flex w-full flex-col items-center gap-4" style={{ maxWidth: RENDER_WIDTH }}>
      {/* Front — just the logo lockup, centered */}
      <div data-card-face="front" style={faceStyle} className="relative grid place-items-center border border-ink/10">
        <Backdrop />
        <div className="relative z-10">
          <LogoLockup compact={false} />
        </div>
      </div>

      {/* Back — logo top-left, divider, name/title/contact on the right */}
      <div data-card-face="back" style={faceStyle} className="relative flex items-start gap-5 border border-ink/10 px-7 py-6">
        <Backdrop />
        <div className="absolute left-7 z-10" style={{ top: 80 }}>
          <LogoLockup compact />
        </div>
        <div className="relative z-10 h-full w-px shrink-0" style={{ background: cardDivider, marginLeft: "34%" }} />
        <div className="relative z-10 min-w-0 flex-1 space-y-3">
          <div>
            <p className="break-words text-2xl font-black" style={{ color: cardFg }}>
              {fullName}
            </p>
            {p.tagline && (
              <p className="break-words text-xs" style={{ color: cardSubtle }}>
                {p.tagline}
              </p>
            )}
          </div>
          {(c.phone || c.email) && (
            <div className="space-y-0.5 text-[14px] font-semibold" style={{ color: cardFg }}>
              {c.phone && <p className="break-words">{c.phone}</p>}
              {c.email && <p className="break-words">{c.email}</p>}
            </div>
          )}
          {(c.address || c.city || c.country) && (
            <p className="break-words text-[14px] leading-snug" style={{ color: cardFg }}>
              {c.address || [c.city, c.country].filter(Boolean).join(", ")}
            </p>
          )}
          {c.website && (
            <p className="break-words text-[14px] font-black" style={{ color: cardFg }}>
              {c.website}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
