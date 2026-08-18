import { CSSProperties, useId } from "react";
import { Phone, Mail, Globe, MessageCircle, MapPin } from "lucide-react";
import type { FullProfile } from "@/types";
import { SITE_URL } from "@/lib/config";
import { getContrastText } from "@/lib/color";
import { CARD_TEMPLATES, type CardElement, type CardFaceDef } from "@/lib/cardTemplates";

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
      <I size={13} style={{ color: t.accent }} />
      <span className="truncate">{label}</span>
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

/** Meandering wave band used by the Wave Bold template — anchored to one edge. */
function WaveBand({ fill, height = 64, flip }: { fill: string; height?: number; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      className="block w-full"
      style={{ height, transform: flip ? "scaleY(-1)" : undefined }}
    >
      <path
        d="M0,55 C70,95 130,10 210,35 C280,57 320,15 400,25 L400,0 L0,0 Z"
        fill={fill}
      />
    </svg>
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
  // Container query units, not a one-off px scale computed from a fixed
  // reference width: `cqw` re-derives from this element's *actual* rendered
  // width on every layout, so text stays correctly proportioned (and never
  // overlaps) whether this face renders full-size or squeezed side-by-side
  // with its other face.
  const pxToCqw = (px: number) => `${(px / designWidth) * 100}cqw`;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: fallbackBg,
        backgroundImage: face.background?.image ? `url(${face.background.image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        containerType: "inline-size",
      }}
    >
      {face.elements.map((el: CardElement) => {
        const base: CSSProperties = {
          position: "absolute",
          left: `${el.position.x}%`,
          top: `${el.position.y}%`,
          width: `${el.size.width}%`,
          transform: "translateX(-50%)",
        };
        if (el.type === "shape") {
          return (
            <div
              key={el.id}
              style={{ ...base, height: `${el.size.height}%`, background: el.style.backgroundColor }}
            />
          );
        }
        const text = fieldValue(el.field);
        if (!text) return null;
        return (
          <div
            key={el.id}
            className="truncate leading-tight"
            style={{
              ...base,
              fontFamily: el.style.fontFamily,
              fontSize: el.style.fontSize ? pxToCqw(el.style.fontSize) : undefined,
              fontWeight: el.style.fontWeight,
              color: el.style.color,
              textAlign: el.style.textAlign,
              letterSpacing: el.style.letterSpacing ? pxToCqw(el.style.letterSpacing) : undefined,
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

  if (templateId === "floral-mandala") {
    const tpl = CARD_TEMPLATES.find((t) => t.id === "floral-mandala");
    const colors = tpl?.colors ?? { background: "#FBF3E4", primary: "#0E7C86", secondary: "#083F45", text: "#202020" };
    const bg = tpl?.background;
    const layout = tpl?.layout;

    // Standard 89×51mm trim size applied to both faces — a fixed CSS aspect
    // ratio so front and back render at true business-card proportions.
    const faceStyle: CSSProperties = {
      background: colors.background,
      borderColor: colors.secondary,
      width: "100%",
      maxWidth: cardStyle.maxWidth,
      aspectRatio: CARD_ASPECT_RATIO,
      fontFamily: cardStyle.fontFamily,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };

    return (
      <div className="flex w-full flex-col gap-4" style={{ maxWidth: cardStyle.maxWidth }}>
        {/* Front face — pre-designed background art with text overlaid at the template's layout anchors */}
        <div
          className="relative overflow-hidden rounded-2xl border-[3px]"
          style={{
            ...faceStyle,
            color: colors.text,
            backgroundImage: bg?.front ? `url(${bg.front})` : undefined,
          }}
        >
          <div
            className="absolute max-w-[46%]"
            style={{ left: `${layout?.front.name.x ?? 52}%`, top: `${layout?.front.name.y ?? 28}%` }}
          >
            <span className="block break-words text-sm font-black uppercase leading-tight tracking-wide">
              {fullName}
            </span>
          </div>
          {p.tagline && (
            <div
              className="absolute max-w-[42%]"
              style={{ left: `${layout?.front.title.x ?? 55}%`, top: `${layout?.front.title.y ?? 42}%` }}
            >
              <span className="block text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: `${colors.text}99` }}>
                {p.tagline}
              </span>
            </div>
          )}
          <div
            className="absolute max-w-[42%] space-y-1"
            style={{ left: `${layout?.front.contact.x ?? 55}%`, top: `${layout?.front.contact.y ?? 58}%` }}
          >
            {contact.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className="grid h-4 w-4 shrink-0 place-items-center rounded-full border"
                  style={{ borderColor: colors.text }}
                >
                  <r.icon size={8} style={{ color: colors.text }} />
                </span>
                <span className="truncate text-[9px] font-bold" style={{ color: colors.text }}>
                  {r.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Back face — pre-designed background art with the company name centred on it */}
        <div
          className="relative overflow-hidden rounded-2xl border-[3px]"
          style={{
            ...faceStyle,
            backgroundImage: bg?.back ? `url(${bg.back})` : undefined,
          }}
        >
          <span
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
            style={{
              left: `${layout?.back.companyName.x ?? 50}%`,
              top: `${layout?.back.companyName.y ?? 50}%`,
              borderColor: colors.text,
              background: colors.background,
              color: colors.text,
            }}
          >
            {biz.name || "Company"}
          </span>
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

    // Every slot always shows something — matches the other templates
    // (e.g. floral-mandala's `biz.name || "Company"`) so the card reads as a
    // finished design immediately instead of leaving gaps until every field
    // in Details has been filled in.
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
          <div style={faceStyle} className="border border-ink/10">
            <ElementsFace face={tpl.front} fieldValue={fieldValue} designWidth={designWidth} fallbackBg={colors.background} />
          </div>
        )}
        {tpl?.back && (
          <div style={faceStyle} className="border border-ink/10">
            <ElementsFace face={tpl.back} fieldValue={fieldValue} designWidth={designWidth} fallbackBg={colors.background} />
          </div>
        )}
      </div>
    );
  }

  // default: wave-bold — a flowing wave band across a bold colour field.
  const waveColor = headerColor || accent;
  const onPrimary = getContrastText(primary);
  return (
    <div style={{ ...cardStyle, background: primary, color: onPrimary }} className="relative overflow-hidden">
      <WaveBand fill={waveColor} height={58} />
      <div className="px-6 pt-1 pb-3 text-center">
        <h2
          className="break-words text-2xl"
          style={{ color: waveColor, fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 700 }}
        >
          {biz.name || fullName}
        </h2>
        {p.tagline && (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: onPrimary, opacity: 0.85 }}>
            {p.tagline}
          </p>
        )}
      </div>
      <WaveBand fill={waveColor} height={58} flip />
      <div className="px-5 pb-5 pt-3">
        <div className="flex justify-center">
          <Avatar t={t} size={56} picture={p.profilePicture} initials={initials} borderColor={waveColor} />
        </div>
        <h3 className="mt-2 text-center text-lg font-black" style={{ color: onPrimary }}>
          {fullName}
        </h3>
        <div className="mt-3 space-y-1.5">{rows}</div>
        <Footer t={{ ...t, subtle: onPrimary === "#FFFFFF" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }} url={publicUrl} />
      </div>
    </div>
  );
}
