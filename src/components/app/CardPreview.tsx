import { CSSProperties } from "react";
import { Phone, Mail, Globe, MessageCircle, MapPin, ExternalLink, QrCode } from "lucide-react";
import type { FullProfile } from "@/types";
import { SITE_URL } from "@/lib/config";
import { getContrastText } from "@/lib/color";

/**
 * Lightweight client-side preview of the 6 digital card templates. Visually
 * matches CardTemplateService.js on the BE so the rendered PDF is recognisable
 * from the preview. Intentionally not a 1:1 copy of every pixel — the BE PDF is
 * the source of truth for download.
 */

type Icon = typeof Phone;

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

/** Reference-style row: solid icon tile, label, trailing open-link glyph. */
function TileRow({
  t,
  icon: I,
  label,
  tint,
}: {
  t: Tokens;
  icon: Icon;
  label: string;
  tint: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2" style={{ background: t.surface }}>
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white"
        style={{ background: tint }}
      >
        <I size={14} />
      </span>
      <span className="min-w-0 flex-1 truncate text-[11px] font-bold" style={{ color: t.fg }}>
        {label}
      </span>
      <ExternalLink size={12} style={{ color: t.subtle }} />
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

export default function CardPreview({
  templateId,
  primary,
  accent,
  stripes,
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
  /** Palette stops for the Classic Retro header band. */
  stripes?: string[];
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
  const p = profile.personal || {};
  const c = profile.contact || {};
  const social = (profile.social || []).filter((s) => s.url);
  const biz = profile.business || {};
  const fullName = p.fullName || "Your name";
  const initials =
    fullName.trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "Y";
  const publicUrl = username
    ? `${SITE_URL}/${username}`
    : "";

  const isDark = theme === "dark" || templateId === "neon-dark";

  // The card's base surface — solid fill, a primary→accent gradient, or that
  // gradient softened with a translucent white wash (no backdrop-filter, so
  // it renders identically in the exported PDF/PNG too).
  const resolvedBg =
    paletteStyle === "gradient"
      ? `linear-gradient(135deg, ${primary}, ${accent})`
      : paletteStyle === "blur"
      ? `linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), linear-gradient(135deg, ${primary}, ${accent})`
      : backgroundColor;

  // A solid fallback for spots that can't render a gradient (e.g. the avatar's
  // cut-out border) — closest visible tone for gradient/blur, exact for fill.
  const resolvedSolidBg = paletteStyle === "fill" ? backgroundColor : primary;

  // The header band / header block / side panel colour — defaults to primary
  // when the user hasn't picked one, same across all three palette styles.
  const headerFill = headerColor || primary;

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

  if (templateId === "minimal-mono") {
    return (
      <div style={cardStyle} className="p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: primary }}>
              {biz.name || "Digital Card"}
            </div>
            <h2 className="mt-4 break-words font-display text-3xl font-black">{fullName}</h2>
            {p.tagline && <p className="mt-1 text-sm" style={{ color: t.subtle }}>{p.tagline}</p>}
          </div>
          <Avatar
            t={t}
            size={56}
            picture={p.profilePicture}
            initials={initials}
            borderColor={isDark ? t.bg : resolvedSolidBg}
          />
        </div>
        <div className="my-5 h-0.5 w-12" style={{ background: primary }} />
        {p.bio && <p className="text-xs leading-relaxed" style={{ color: t.subtle }}>{p.bio}</p>}
        <div className="mt-4 space-y-1.5">{rows}</div>
        <Footer t={t} url={publicUrl} />
      </div>
    );
  }

  if (templateId === "split-modern") {
    return (
      <div style={cardStyle} className="flex">
        <div
          className="flex w-1/3 flex-col items-center gap-3 p-4 text-white"
          style={{ background: headerFill }}
        >
          <Avatar t={t} size={64} picture={p.profilePicture} initials={initials} />
          <h3 className="text-center text-sm font-black leading-tight">{fullName}</h3>
          {p.tagline && (
            <div className="text-center text-[9px] font-black uppercase tracking-wider opacity-90">
              {p.tagline}
            </div>
          )}
          <div className="mt-auto grid h-14 w-14 place-items-center rounded-md bg-white text-ink">
            <QrCode size={36} />
          </div>
        </div>
        <div className="min-w-0 flex-1 p-4">
          {biz.name && (
            <div className="truncate text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: primary }}>
              {biz.name}{biz.category ? ` · ${biz.category}` : ""}
            </div>
          )}
          {p.bio && <p className="mt-2 text-[11px]" style={{ color: t.subtle }}>{p.bio}</p>}
          <div className="mt-3 space-y-1.5">{rows}</div>
        </div>
      </div>
    );
  }

  if (templateId === "neon-dark") {
    return (
      <div
        style={{ ...cardStyle, background: "#06211f", color: "#ffffff", border: "1px solid rgba(255,255,255,0.08)" }}
        className="p-5"
      >
        <div
          className="h-24 rounded-2xl"
          style={{
            background: headerColor
              ? `radial-gradient(circle at 40% 40%, ${headerColor}cc, transparent 65%), #06211f`
              : `radial-gradient(circle at 30% 30%, ${primary}cc, transparent 60%), radial-gradient(circle at 70% 70%, ${accent}cc, transparent 60%), #06211f`,
          }}
        />
        <div className="-mt-10 flex justify-center">
          <Avatar t={t} size={72} picture={p.profilePicture} initials={initials} />
        </div>
        <div className="mt-3 text-center">
          <h2 className="break-words font-display text-xl font-black text-white">{fullName}</h2>
          {p.tagline && (
            <div className="mt-1 text-[10px] font-black uppercase tracking-wider" style={{ color: accent }}>
              {p.tagline}
            </div>
          )}
          {p.bio && <p className="mt-2 text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>{p.bio}</p>}
        </div>
        <div className="mt-4 space-y-1.5">{rows}</div>
        <Footer t={t} url={publicUrl} />
      </div>
    );
  }

  if (templateId === "corporate-premium") {
    return (
      <div style={{ ...cardStyle, background: "#fcfaf5", color: "#0b2e2b" }} className="p-6">
        <div className="flex items-center justify-between gap-3 pb-4" style={{ borderBottom: `2px solid ${headerFill}` }}>
          <div className="min-w-0">
            {biz.name && (
              <div className="truncate text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: headerFill }}>
                {biz.name}
              </div>
            )}
            <h2 className="mt-1 break-words text-2xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
              {fullName}
            </h2>
            {p.tagline && <div className="italic" style={{ color: t.subtle }}>{p.tagline}</div>}
          </div>
          <Avatar t={t} size={64} picture={p.profilePicture} initials={initials} />
        </div>
        {p.bio && <p className="mt-4 text-xs italic" style={{ color: t.subtle }}>{p.bio}</p>}
        <div className="mt-4 space-y-1.5">{rows}</div>
        <Footer t={t} url={publicUrl} />
      </div>
    );
  }

  if (templateId === "playful-rounded") {
    return (
      <div style={{ ...cardStyle, background: isDark ? t.bg : resolvedBg }} className="p-5">
        <div className="rounded-3xl p-4" style={{ background: t.surface }}>
          <div className="flex items-center gap-3">
            <Avatar t={t} size={56} picture={p.profilePicture} initials={initials} />
            <div className="min-w-0">
              <h2 className="truncate font-display text-lg font-black" style={{ color: t.fg }}>
                {fullName}
              </h2>
              {p.tagline && (
                <div className="truncate text-[10px] font-black uppercase tracking-wider" style={{ color: accent }}>
                  {p.tagline}
                </div>
              )}
            </div>
          </div>
          {p.bio && <p className="mt-3 text-xs" style={{ color: t.subtle }}>{p.bio}</p>}
        </div>
        <div className="mt-3 space-y-1.5">{rows}</div>
        <Footer t={t} url={publicUrl} />
      </div>
    );
  }

  // default: gradient-classic — "Classic Retro", a flat header band. A custom
  // header colour renders as a solid band; otherwise falls back to the
  // multi-stop stripes (or a primary/accent alternation).
  const band = headerColor ? [headerColor] : stripes?.length ? stripes : [primary, accent, primary, accent];
  const tiles = [
    ...contact.slice(0, 3),
    ...social.slice(0, 2).map((s) => ({
      icon: ExternalLink as Icon,
      label: `${s.platform || "Link"} · ${s.url}`,
    })),
  ].slice(0, 4);

  return (
    <div style={{ ...cardStyle, background: isDark ? t.bg : resolvedBg }}>
      <div className="flex h-24">
        {band.map((colour, i) => (
          <div key={i} className="flex-1" style={{ background: colour }} />
        ))}
      </div>
      <div className="-mt-9 flex justify-center">
        <Avatar
          t={t}
          size={72}
          picture={p.profilePicture}
          initials={initials}
          borderColor={isDark ? t.bg : resolvedSolidBg}
        />
      </div>
      <div className="px-5 pb-5 pt-2.5 text-center">
        <h2 className="break-words font-display text-lg font-black" style={{ color: t.fg }}>
          {fullName}
        </h2>
        <p className="mt-0.5 text-xs" style={{ color: t.subtle }}>
          {p.tagline || "Your title"}
        </p>
        {tiles.length > 0 && (
          <div className="mt-3 space-y-2 text-left">
            {tiles.map((r, i) => (
              <TileRow
                key={i}
                t={t}
                icon={r.icon}
                label={r.label}
                tint={i % 2 === 0 ? primary : accent}
              />
            ))}
          </div>
        )}
        <Footer t={t} url={publicUrl} />
      </div>
    </div>
  );
}
