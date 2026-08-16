import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import {
  Phone,
  MessageCircle,
  Mail,
  Globe,
  Download,
  Share2,
  QrCode,
  MapPin,
  BadgeCheck,
  ExternalLink,
  Clock,
  Eye,
  Copy,
  Check,
  X,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";
import {
  PublicProfile as TProfile,
  buildVCard,
  computeOpenNow,
  shareTargets,
  trackEvent,
} from "@/lib/publicProfile";
import { getSocialIcon } from "@/lib/socialPlatforms";

export default function PublicProfile({
  profile,
  shareUrl,
}: {
  profile: TProfile;
  shareUrl: string;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const name = profile.fullName || `@${profile.username}`;
  const openNow = computeOpenNow(profile.business?.hours);

  // The owner's Studio design (colors, wallpaper, buttons, fonts…), saved
  // into digitalCard.design. When a profile hasn't saved one yet, everything
  // below resolves to `undefined` and the existing hardcoded brand look is
  // used untouched, so older/legacy profiles still render fine.
  const d = profile.design || {};
  const primary = d.primary;
  const accent = d.accent;
  const brandGradientStyle: CSSProperties | undefined =
    primary && accent ? { backgroundImage: `linear-gradient(135deg, ${primary}, ${accent})` } : undefined;

  useEffect(() => {
    const loadFont = (font?: string) => {
      if (!font || typeof document === "undefined") return;
      const id = `gf-${font.replace(/ /g, "-").toLowerCase()}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}&display=swap`;
      document.head.appendChild(link);
    };
    loadFont(d.pageFont);
    if (!d.matchTitleFont && d.titleFont) loadFont(d.titleFont);
  }, [d.pageFont, d.titleFont, d.matchTitleFont]);

  const pageFontFamily = d.pageFont ? `"${d.pageFont}", sans-serif` : undefined;
  const titleFontFamily = d.titleFont && !d.matchTitleFont ? `"${d.titleFont}", sans-serif` : pageFontFamily;
  const pageTextColor = d.pageTextColor;
  const titleColor = d.matchTitleFont ? pageTextColor : d.titleColor || pageTextColor;

  // Wallpaper — mirrors LiveProfileCard's treatment, applied to the whole page.
  const patternImages = [
    d.backgroundColor && `repeating-linear-gradient(45deg, ${d.backgroundColor}, ${d.backgroundColor} 3px, #ffffff33 3px, #ffffff33 6px)`,
    `linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)`,
    `radial-gradient(#ffffff33 1.5px, transparent 1.5px)`,
    primary && accent && `linear-gradient(135deg, ${primary}, ${accent})`,
  ];
  const wallpaperStyle: CSSProperties | undefined =
    d.wallpaperType === "gradient" && d.gradientColor && d.gradientColorEnd
      ? {
          background:
            d.gradientDirection === "radial"
              ? `radial-gradient(circle, ${d.gradientColor}, ${d.gradientColorEnd})`
              : `linear-gradient(${d.gradientDirection === "down" ? "to bottom" : "to top"}, ${d.gradientColor}, ${d.gradientColorEnd})`,
        }
      : d.wallpaperType === "pattern" && d.backgroundColor
      ? {
          background: d.backgroundColor,
          backgroundImage: patternImages[d.patternIndex ?? 0] || patternImages[0],
          backgroundSize: d.patternIndex === 1 ? "6px 6px" : undefined,
        }
      : d.backgroundColor
      ? { background: d.backgroundColor }
      : undefined;
  const isDark = d.theme === "dark";

  // Card / button styling — mirrors LiveProfileCard's cardStyle, applied to
  // quick actions, social rows, product/timeline/business cards.
  const buttonColor = d.buttonColor;
  const buttonStyle = d.buttonStyle || "solid";
  const isGlass = buttonStyle === "glass";
  const cardText = d.buttonTextColor || pageTextColor;
  const cardBg = buttonStyle === "outline" ? "transparent" : isGlass ? `${buttonColor}26` : `${buttonColor}e6`;
  const cardBorderColor = buttonStyle === "outline" ? buttonColor : isGlass ? "#ffffff4d" : `${cardText || "#000000"}26`;
  const cardRadiusPx = { sharp: 6, slight: 12, medium: 18, full: 9999 }[d.buttonRoundness || "slight"];
  const cardShadowValue = {
    none: undefined,
    soft: "0 2px 8px rgba(0,0,0,0.08)",
    strong: "0 6px 20px rgba(0,0,0,0.18)",
    hard: "4px 4px 0 rgba(0,0,0,0.35)",
  }[d.buttonShadow || "none"];
  const cardStyle: CSSProperties | undefined = buttonColor
    ? {
        background: isGlass ? `linear-gradient(155deg, ${buttonColor}4d, ${buttonColor}12 60%, ${buttonColor}26)` : cardBg,
        border: `1px solid ${cardBorderColor}`,
        borderRadius: cardRadiusPx,
        boxShadow: cardShadowValue,
        backdropFilter: isGlass ? "blur(16px) saturate(180%)" : undefined,
        WebkitBackdropFilter: isGlass ? "blur(16px) saturate(180%)" : undefined,
      }
    : undefined;
  const cardTextStyle: CSSProperties | undefined = cardText ? { color: cardText } : undefined;

  const titleSizeStyle: CSSProperties | undefined = d.titleFontSize ? { fontSize: d.titleFontSize } : undefined;
  const bioSizeStyle: CSSProperties | undefined = d.bioFontSize ? { fontSize: d.bioFontSize } : undefined;
  const bodySizeStyle: CSSProperties | undefined = d.bodyFontSize ? { fontSize: d.bodyFontSize } : undefined;
  const bodySubSizeStyle: CSSProperties | undefined = d.bodyFontSize
    ? { fontSize: Math.max(8, d.bodyFontSize - 2) }
    : undefined;
  const socialLinksStyle = d.socialLinksStyle || "buttons";

  // Track profile view (and link taps) into the user's dashboard analytics.
  useEffect(() => {
    if (!profile.username) return;
    trackEvent({ type: "profile_view", slug: profile.username });
  }, [profile.username]);

  const onLinkTap = (linkKey: string) =>
    trackEvent({ type: "link_tap", slug: profile.username, linkKey });

  const saveContact = () => {
    const blob = new Blob([buildVCard(profile)], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.username}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actions = [
    profile.phone && { icon: Phone, label: "Call", href: `tel:${profile.phone}`, tint: "from-emerald-500 to-teal-500" },
    profile.whatsapp && { icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`, tint: "from-green-500 to-emerald-500" },
    profile.email && { icon: Mail, label: "Email", href: `mailto:${profile.email}`, tint: "from-primary to-secondary" },
  ].filter(Boolean) as { icon: typeof Phone; label: string; href: string; tint: string }[];

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${wallpaperStyle ? "" : "bg-paper-soft"} ${isDark ? "text-white" : ""}`}
      style={{ ...wallpaperStyle, fontFamily: pageFontFamily }}
    >
      {!wallpaperStyle && (
        <>
          <div className="pointer-events-none absolute inset-0 dots-bg opacity-70" />
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        </>
      )}

      <main className="relative mx-auto w-full max-w-[480px] px-4 pb-16 pt-8 sm:pt-12">
        {/* top bar */}
        <div className="mb-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <span
              className="grid h-7 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-xs font-black text-white"
              style={brandGradientStyle}
            >
              CK
            </span>
          </Link>
          <div className="flex gap-2">
            <IconChip onClick={() => setQrOpen(true)} label="QR code"><QrCode size={16} /></IconChip>
            <IconChip onClick={() => setShareOpen(true)} label="Share"><Share2 size={16} /></IconChip>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`overflow-hidden rounded-[2rem] shadow-soft-lg ring-1 ${isDark ? "bg-black/30 ring-white/10" : "bg-white ring-black/[0.04]"}`}
        >
          {/* cover + avatar */}
          <div className="relative h-28 bg-gradient-to-br from-primary to-secondary" style={brandGradientStyle}>
            <div className="absolute inset-0 dots-bg opacity-50" />
            <span
              className={`absolute -bottom-12 left-1/2 grid h-24 w-24 -translate-x-1/2 place-items-center overflow-hidden rounded-3xl text-2xl font-black shadow-soft-lg ring-4 ${
                isDark ? "bg-black/40 text-white ring-black/30" : "bg-white text-primary ring-white"
              }`}
            >
              {profile.profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profilePicture} alt={name} className="h-full w-full object-cover" />
              ) : (
                name[1]?.toUpperCase() || "C"
              )}
            </span>
          </div>

          <div className="px-5 pb-6 pt-14 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <h1
                className={`font-display font-black ${titleSizeStyle ? "" : "text-2xl"} ${isDark ? "text-white" : "text-ink"}`}
                style={{ fontFamily: titleFontFamily, color: titleColor, ...titleSizeStyle }}
              >
                {name}
              </h1>
              <BadgeCheck size={20} className="text-primary" style={primary ? { color: primary } : undefined} />
            </div>
            {profile.tagline && (
              <p className="mt-0.5 text-sm font-bold text-primary" style={primary ? { color: primary } : undefined}>
                {profile.tagline}
              </p>
            )}

            <div
              className={`mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs ${isDark ? "text-white/55" : "text-ink/55"}`}
            >
              {(profile.city || profile.country) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} /> {[profile.city, profile.country].filter(Boolean).join(", ")}
                </span>
              )}
              {openNow !== null && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${openNow ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                  <Clock size={11} /> {openNow ? "Open now" : "Closed"}
                </span>
              )}
            </div>

            {profile.bio && (
              <p
                className={`mt-3 leading-relaxed ${bioSizeStyle ? "" : "text-sm"} ${isDark ? "text-white/65" : "text-ink/65"}`}
                style={{ color: pageTextColor, ...bioSizeStyle }}
              >
                {profile.bio}
              </p>
            )}

            {/* quick actions */}
            {actions.length > 0 && (
              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {actions.map((a) => (
                  <a
                    key={a.label}
                    href={a.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => onLinkTap(a.label.toLowerCase())}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 transition hover:scale-[1.03] ${cardStyle ? "" : "bg-paper-tint"}`}
                    style={cardStyle}
                  >
                    <span className={`grid h-9 w-9 place-items-center rounded-xl text-white ${cardStyle ? "" : `bg-gradient-to-br ${a.tint}`}`}>
                      <a.icon size={17} style={cardStyle ? cardTextStyle : undefined} />
                    </span>
                    <span className={`font-bold ${bodySizeStyle ? "" : "text-[11px]"} ${isDark ? "text-white/70" : "text-ink/70"}`} style={{ ...cardTextStyle, ...bodySizeStyle }}>
                      {a.label}
                    </span>
                  </a>
                ))}
              </div>
            )}

            {/* save contact + website */}
            <div className="mt-3 flex gap-2.5">
              <button
                onClick={saveContact}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-secondary py-3 text-sm font-bold text-white shadow-soft transition hover:opacity-95"
                style={brandGradientStyle}
              >
                <Download size={16} /> Save contact
              </button>
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    isDark ? "bg-white/10 text-white/70 hover:bg-white/20" : "bg-ink/5 text-ink/70 hover:bg-ink/10"
                  }`}
                >
                  <Globe size={16} />
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* social link blocks — a compact icon row, or full icon+label buttons */}
        {(profile.social?.length ?? 0) > 0 && (
          <Section delay={0.05}>
            {socialLinksStyle === "icons" ? (
              <div className="flex flex-wrap justify-center gap-3">
                {profile.social!.map((s, i) => {
                  const Icon = getSocialIcon(s.platform);
                  return (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => onLinkTap(s.platform || `social_${i}`)}
                      title={s.label || s.platform}
                      className={`grid h-12 w-12 place-items-center rounded-full text-primary transition hover:scale-[1.05] ${
                        cardStyle ? "" : "bg-gradient-to-br from-primary/10 to-secondary/10"
                      }`}
                      style={cardStyle}
                    >
                      <Icon size={20} style={cardTextStyle} />
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2.5">
                {profile.social!.map((s, i) => {
                  const Icon = getSocialIcon(s.platform);
                  return (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => onLinkTap(s.platform || `social_${i}`)}
                      className={`group flex items-center gap-3 rounded-2xl p-3.5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-soft-lg ${
                        cardStyle ? "" : "bg-white ring-1 ring-black/[0.03]"
                      }`}
                      style={cardStyle}
                    >
                      <span className={`grid h-10 w-10 place-items-center rounded-xl text-primary ${cardStyle ? "" : "bg-gradient-to-br from-primary/10 to-secondary/10"}`}>
                        <Icon size={18} style={cardTextStyle} />
                      </span>
                      <span className={`flex-1 text-left font-bold ${bodySizeStyle ? "" : "text-base"}`} style={{ ...cardTextStyle, ...bodySizeStyle }}>
                        {s.label || s.platform}
                      </span>
                      <ArrowUpRight size={18} className="text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-primary" style={cardTextStyle} />
                    </a>
                  );
                })}
              </div>
            )}
          </Section>
        )}

        {/* products */}
        {(profile.products?.length ?? 0) > 0 && (
          <Section title="Shop & services" icon={ShoppingBag} delay={0.1}>
            <div className="space-y-2.5">
              {profile.products!.map((p, i) => (
                <a
                  key={i}
                  href={p.link || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-3 rounded-2xl p-4 shadow-soft transition hover:shadow-soft-lg ${cardStyle ? "" : "bg-white ring-1 ring-black/[0.03]"}`}
                  style={cardStyle}
                >
                  <div className="flex-1">
                    <p className={`font-bold ${bodySizeStyle ? "" : "text-base"}`} style={{ ...cardTextStyle, ...bodySizeStyle }}>
                      {p.name}
                    </p>
                    {p.description && (
                      <p className={bodySubSizeStyle ? "" : "text-xs"} style={{ ...cardTextStyle, opacity: 0.7, ...bodySubSizeStyle }}>
                        {p.description}
                      </p>
                    )}
                  </div>
                  {p.price && (
                    <span
                      className={`rounded-full px-3 py-1 font-black text-primary ${bodySizeStyle ? "" : "text-sm"}`}
                      style={{ background: primary ? `${primary}1a` : undefined, color: primary, ...bodySizeStyle }}
                    >
                      {p.price}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* experience */}
        {(profile.experience?.length ?? 0) > 0 && (
          <Section title="Experience" icon={Briefcase} delay={0.12}>
            <Timeline
              items={profile.experience!.map((e) => ({ a: e.role || e.company, b: e.company, c: [e.startDate, e.endDate].filter(Boolean).join(" – ") }))}
              cardStyle={cardStyle}
              cardTextStyle={cardTextStyle}
              bodySizeStyle={bodySizeStyle}
              bodySubSizeStyle={bodySubSizeStyle}
            />
          </Section>
        )}

        {/* education */}
        {(profile.education?.length ?? 0) > 0 && (
          <Section title="Education" icon={GraduationCap} delay={0.14}>
            <Timeline
              items={profile.education!.map((e) => ({ a: e.institution, b: [e.degree, e.field].filter(Boolean).join(", "), c: [e.startYear, e.endYear].filter(Boolean).join(" – ") }))}
              cardStyle={cardStyle}
              cardTextStyle={cardTextStyle}
              bodySizeStyle={bodySizeStyle}
              bodySubSizeStyle={bodySubSizeStyle}
            />
          </Section>
        )}

        {/* business */}
        {profile.business?.name && (
          <Section title="Business" icon={MapPin} delay={0.16}>
            <div className={`rounded-2xl p-4 shadow-soft ${cardStyle ? "" : "bg-white ring-1 ring-black/[0.03]"}`} style={cardStyle}>
              <p className={`font-bold ${bodySizeStyle ? "" : "text-base"}`} style={{ ...cardTextStyle, ...bodySizeStyle }}>
                {profile.business.name}
              </p>
              {profile.business.category && (
                <p className={`font-semibold text-primary ${bodySubSizeStyle ? "" : "text-xs"}`} style={{ color: primary, ...bodySubSizeStyle }}>
                  {profile.business.category}
                </p>
              )}
              {profile.business.description && (
                <p className={`mt-1.5 ${bodySubSizeStyle ? "" : "text-sm"}`} style={{ ...cardTextStyle, opacity: 0.75, ...bodySubSizeStyle }}>
                  {profile.business.description}
                </p>
              )}
              {profile.business.mapUrl && (
                <a href={profile.business.mapUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary" style={primary ? { color: primary } : undefined}>
                  <MapPin size={14} /> View on map
                </a>
              )}
            </div>
          </Section>
        )}

        {/* footer */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-ink/45">
          {typeof profile.views === "number" && (
            <span className="inline-flex items-center gap-1"><Eye size={13} /> {profile.views.toLocaleString()} views</span>
          )}
          {profile.updatedAt && <span>Updated {new Date(profile.updatedAt).toLocaleDateString()}</span>}
        </div>

        <a href="/signup" className="mt-5 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/25 py-3 text-sm font-bold text-primary transition hover:border-primary/50 hover:bg-white">
          <span className="grid h-6 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-secondary text-[10px] font-black text-white">CK</span>
          Create your own ClickCard — free
        </a>
      </main>

      {shareOpen && <ShareModal url={shareUrl} name={name} onClose={() => setShareOpen(false)} />}
      {qrOpen && <QrModal url={shareUrl} username={profile.username} onClose={() => setQrOpen(false)} />}
    </div>
  );
}

/* ---------- small pieces ---------- */
function IconChip({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-label={label} className="grid h-9 w-9 place-items-center rounded-xl bg-white text-ink/60 shadow-soft ring-1 ring-black/[0.04] transition hover:text-primary">
      {children}
    </button>
  );
}

function Section({ title, icon: Icon, children, delay = 0 }: { title?: string; icon?: typeof Briefcase; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay }} className="mt-5">
      {title && (
        <h2 className="mb-2.5 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-ink/45">
          {Icon && <Icon size={13} />} {title}
        </h2>
      )}
      {children}
    </motion.section>
  );
}

function Timeline({
  items,
  cardStyle,
  cardTextStyle,
  bodySizeStyle,
  bodySubSizeStyle,
}: {
  items: { a: string; b?: string; c?: string }[];
  cardStyle?: CSSProperties;
  cardTextStyle?: CSSProperties;
  bodySizeStyle?: CSSProperties;
  bodySubSizeStyle?: CSSProperties;
}) {
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={i} className={`rounded-2xl p-4 shadow-soft ${cardStyle ? "" : "bg-white ring-1 ring-black/[0.03]"}`} style={cardStyle}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`font-bold ${bodySizeStyle ? "" : "text-base"}`} style={{ ...cardTextStyle, ...bodySizeStyle }}>
                {it.a}
              </p>
              {it.b && (
                <p className={bodySubSizeStyle ? "" : "text-sm"} style={{ ...cardTextStyle, opacity: 0.7, ...bodySubSizeStyle }}>
                  {it.b}
                </p>
              )}
            </div>
            {it.c && (
              <span className={`shrink-0 font-semibold ${bodySubSizeStyle ? "" : "text-xs"}`} style={{ ...cardTextStyle, opacity: 0.55, ...bodySubSizeStyle }}>
                {it.c}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ShareModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const nativeShare = () => navigator.share?.({ title: name, url }).catch(() => {});

  return (
    <Overlay onClose={onClose}>
      <h3 className="font-display text-lg font-black text-ink">Share this ClickCard</h3>
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-paper-tint p-1.5">
        <span className="flex-1 truncate px-2 text-sm font-semibold text-ink/70">{url}</span>
        <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-primary to-secondary px-3 py-2 text-sm font-bold text-white">
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {shareTargets(url, name).map((t) => (
          <a key={t.label} href={t.href} target="_blank" rel="noreferrer" className="rounded-xl bg-paper-tint py-3 text-center text-xs font-bold text-ink/70 transition hover:bg-primary/10 hover:text-primary">
            {t.label}
          </a>
        ))}
      </div>
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button onClick={nativeShare} className="mt-3 w-full rounded-2xl bg-ink/5 py-3 text-sm font-bold text-ink/70 transition hover:bg-ink/10">
          More options…
        </button>
      )}
    </Overlay>
  );
}

function QrModal({ url, username, onClose }: { url: string; username: string; onClose: () => void }) {
  const download = () => {
    const canvas = document.getElementById("cc-qr") as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${username}-qr.png`;
    a.click();
  };
  return (
    <Overlay onClose={onClose}>
      <h3 className="text-center font-display text-lg font-black text-ink">Scan to connect</h3>
      <div className="mt-4 grid place-items-center rounded-3xl bg-white p-5 ring-1 ring-black/[0.04]">
        <QRCodeCanvas id="cc-qr" value={url} size={196} level="M" includeMargin />
      </div>
      <p className="mt-2 text-center text-sm font-semibold text-ink/50">clickcard.app/{username}</p>
      <button onClick={download} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-secondary py-3 text-sm font-bold text-white">
        <Download size={16} /> Download PNG
      </button>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-soft-lg sm:rounded-3xl"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-ink/40 hover:text-ink" aria-label="Close"><X size={18} /></button>
        {children}
      </motion.div>
    </div>
  );
}
