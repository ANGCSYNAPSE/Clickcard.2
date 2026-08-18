import { CSSProperties, useId } from "react";
import { Phone, Mail, Globe, MessageCircle, MapPin } from "lucide-react";
import type { FullProfile } from "@/types";
import { SITE_URL } from "@/lib/config";
import { getContrastText } from "@/lib/color";

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
 * Original hand-drawn-style mandala bloom used by the Floral Mandala
 * template — layered petal rings, a dotted halo and outlined shapes, built
 * from primitives rather than reproducing any specific illustration.
 */
function MandalaMotif({
  size = 160,
  light,
  mid,
  dark,
  ink,
  style,
}: {
  size?: number;
  /** Palest fill — outer petals. */
  light: string;
  /** Mid-tone fill — inner petals and core ring. */
  mid: string;
  /** Deepest tone — accent dots and core centre. */
  dark: string;
  /** Line colour for every stroke, mimicking hand-drawn outlines. */
  ink: string;
  style?: CSSProperties;
}) {
  const outer = Array.from({ length: 14 });
  const middle = Array.from({ length: 12 });
  const dots = Array.from({ length: 22 });
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={style} aria-hidden>
      <g transform="translate(100,100)">
        {dots.map((_, i) => {
          const angle = (360 / dots.length) * i;
          const rad = (angle * Math.PI) / 180;
          const r = 86;
          return (
            <circle key={`d-${i}`} cx={Math.sin(rad) * r} cy={-Math.cos(rad) * r} r={2.6} fill={dark} />
          );
        })}
        {outer.map((_, i) => (
          <ellipse
            key={`o-${i}`}
            rx={15}
            ry={44}
            cy={-60}
            fill={light}
            stroke={ink}
            strokeWidth={1.4}
            transform={`rotate(${(360 / outer.length) * i})`}
          />
        ))}
        {middle.map((_, i) => (
          <ellipse
            key={`m-${i}`}
            rx={11}
            ry={30}
            cy={-40}
            fill={mid}
            stroke={ink}
            strokeWidth={1.2}
            transform={`rotate(${(360 / middle.length) * i + 15})`}
          />
        ))}
        <circle r={23} fill={mid} stroke={ink} strokeWidth={1.4} />
        <circle r={13} fill={light} stroke={ink} strokeWidth={1} />
        <circle r={4.5} fill={dark} />
      </g>
    </svg>
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
    maxWidth: 360,
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
    // Fixed ivory/teal palette so this template always reads the same way,
    // independent of the user's primary/accent picks (matches the reference
    // colour scheme rather than following the palette picker).
    const cream = "#FBF3E4";
    const ink = "#211D18";
    const light = "#BFE9E1";
    const mid = "#3FAFA8";
    const dark = "#0E6E68";
    const motif = (extra: CSSProperties) => (
      <MandalaMotif size={200} light={light} mid={mid} dark={dark} ink={ink} style={{ position: "absolute", ...extra }} />
    );
    // Standard 89×51mm trim size applied to both faces — a fixed CSS aspect
    // ratio so front and back render at true business-card proportions.
    const faceStyle: CSSProperties = {
      background: cream,
      borderColor: ink,
      width: "100%",
      maxWidth: cardStyle.maxWidth,
      aspectRatio: CARD_ASPECT_RATIO,
      fontFamily: cardStyle.fontFamily,
    };
    return (
      <div className="flex w-full flex-col gap-4" style={{ maxWidth: cardStyle.maxWidth }}>
        {/* Front face — 89×51mm trim, contact details beside a corner mandala bloom */}
        <div
          className="relative overflow-hidden rounded-2xl border-[3px] p-4"
          style={{ ...faceStyle, color: ink }}
        >
          {motif({ left: -60, top: -50 })}
          <div className="relative ml-[44%] flex h-full flex-col justify-center gap-1.5">
            <div>
              <h2 className="break-words text-base font-black uppercase leading-tight tracking-wide">{fullName}</h2>
              {p.tagline && (
                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: `${ink}99` }}>
                  {p.tagline}
                </p>
              )}
            </div>
            <div className="space-y-1">
              {contact.slice(0, 3).map((r, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className="grid h-4 w-4 shrink-0 place-items-center rounded-full border"
                    style={{ borderColor: ink }}
                  >
                    <r.icon size={8} style={{ color: ink }} />
                  </span>
                  <span className="truncate text-[9px] font-bold" style={{ color: ink }}>
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back face — 89×51mm trim, full mandala field with a centred company badge */}
        <div className="relative flex items-center justify-center overflow-hidden rounded-2xl border-[3px]" style={faceStyle}>
          {motif({ left: "50%", top: "50%", transform: "translate(-50%, -50%)" })}
          {motif({ left: -70, top: -70 })}
          {motif({ right: -70, bottom: -70 })}
          <span
            className="relative rounded-full border-2 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
            style={{ borderColor: ink, background: cream, color: ink }}
          >
            {biz.name || "Company"}
          </span>
        </div>
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
