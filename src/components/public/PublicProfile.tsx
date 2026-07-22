import { useEffect, useState } from "react";
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
import { WEBAPP_URL } from "@/lib/site";

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
    profile.email && { icon: Mail, label: "Email", href: `mailto:${profile.email}`, tint: "from-brand-500 to-candy-pink" },
  ].filter(Boolean) as { icon: typeof Phone; label: string; href: string; tint: string }[];

  return (
    <div className="relative min-h-screen overflow-hidden bg-mist">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-70" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-candy-pink/20 blur-3xl" />

      <main className="relative mx-auto w-full max-w-[480px] px-4 pb-16 pt-8 sm:pt-12">
        {/* top bar */}
        <div className="mb-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="grid h-7 w-9 place-items-center rounded-lg bg-brand-gradient text-xs font-black text-white">CK</span>
          </Link>
          <div className="flex gap-2">
            <IconChip onClick={() => setQrOpen(true)} label="QR code"><QrCode size={16} /></IconChip>
            <IconChip onClick={() => setShareOpen(true)} label="Share"><Share2 size={16} /></IconChip>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-black/[0.04]"
        >
          {/* cover + avatar */}
          <div className="relative h-28 bg-brand-gradient">
            <div className="absolute inset-0 bg-mesh opacity-50" />
            <span className="absolute -bottom-12 left-1/2 grid h-24 w-24 -translate-x-1/2 place-items-center overflow-hidden rounded-3xl bg-white text-2xl font-black text-brand-600 shadow-card ring-4 ring-white">
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
              <h1 className="font-display text-2xl font-black text-ink">{name}</h1>
              <BadgeCheck size={20} className="text-brand-500" />
            </div>
            {profile.tagline && <p className="mt-0.5 text-sm font-bold text-brand-600">{profile.tagline}</p>}

            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-ink/55">
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

            {profile.bio && <p className="mt-3 text-sm leading-relaxed text-ink/65">{profile.bio}</p>}

            {/* quick actions */}
            {actions.length > 0 && (
              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {actions.map((a) => (
                  <a key={a.label} href={a.href} target="_blank" rel="noreferrer" onClick={() => onLinkTap(a.label.toLowerCase())} className="flex flex-col items-center gap-1.5 rounded-2xl bg-mist py-3 transition hover:scale-[1.03]">
                    <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${a.tint} text-white`}><a.icon size={17} /></span>
                    <span className="text-[11px] font-bold text-ink/70">{a.label}</span>
                  </a>
                ))}
              </div>
            )}

            {/* save contact + website */}
            <div className="mt-3 flex gap-2.5">
              <button onClick={saveContact} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-gradient py-3 text-sm font-bold text-white shadow-soft transition hover:opacity-95">
                <Download size={16} /> Save contact
              </button>
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-ink/5 px-4 py-3 text-sm font-bold text-ink/70 transition hover:bg-ink/10">
                  <Globe size={16} />
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* social link blocks */}
        {(profile.social?.length ?? 0) > 0 && (
          <Section delay={0.05}>
            <div className="space-y-2.5">
              {profile.social!.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer" onClick={() => onLinkTap(s.platform || `social_${i}`)} className="group flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-soft ring-1 ring-black/[0.03] transition hover:-translate-y-0.5 hover:shadow-card">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-candy-pink/20 text-brand-600"><ExternalLink size={18} /></span>
                  <span className="flex-1 text-left font-bold text-ink">{s.label || s.platform}</span>
                  <ArrowUpRight size={18} className="text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* products */}
        {(profile.products?.length ?? 0) > 0 && (
          <Section title="Shop & services" icon={ShoppingBag} delay={0.1}>
            <div className="space-y-2.5">
              {profile.products!.map((p, i) => (
                <a key={i} href={p.link || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/[0.03] transition hover:shadow-card">
                  <div className="flex-1">
                    <p className="font-bold text-ink">{p.name}</p>
                    {p.description && <p className="text-xs text-ink/55">{p.description}</p>}
                  </div>
                  {p.price && <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-black text-brand-700">{p.price}</span>}
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* experience */}
        {(profile.experience?.length ?? 0) > 0 && (
          <Section title="Experience" icon={Briefcase} delay={0.12}>
            <Timeline items={profile.experience!.map((e) => ({ a: e.role || e.company, b: e.company, c: [e.startDate, e.endDate].filter(Boolean).join(" – ") }))} />
          </Section>
        )}

        {/* education */}
        {(profile.education?.length ?? 0) > 0 && (
          <Section title="Education" icon={GraduationCap} delay={0.14}>
            <Timeline items={profile.education!.map((e) => ({ a: e.institution, b: [e.degree, e.field].filter(Boolean).join(", "), c: [e.startYear, e.endYear].filter(Boolean).join(" – ") }))} />
          </Section>
        )}

        {/* business */}
        {profile.business?.name && (
          <Section title="Business" icon={MapPin} delay={0.16}>
            <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/[0.03]">
              <p className="font-bold text-ink">{profile.business.name}</p>
              {profile.business.category && <p className="text-xs font-semibold text-brand-600">{profile.business.category}</p>}
              {profile.business.description && <p className="mt-1.5 text-sm text-ink/60">{profile.business.description}</p>}
              {profile.business.mapUrl && (
                <a href={profile.business.mapUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">
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

        <a href={WEBAPP_URL} className="mt-5 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 py-3 text-sm font-bold text-brand-600 transition hover:border-brand-400 hover:bg-white">
          <span className="grid h-6 w-7 place-items-center rounded-md bg-brand-gradient text-[10px] font-black text-white">CK</span>
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
    <button onClick={onClick} aria-label={label} className="grid h-9 w-9 place-items-center rounded-xl bg-white text-ink/60 shadow-soft ring-1 ring-black/[0.04] transition hover:text-brand-600">
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

function Timeline({ items }: { items: { a: string; b?: string; c?: string }[] }) {
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={i} className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/[0.03]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-ink">{it.a}</p>
              {it.b && <p className="text-sm text-ink/55">{it.b}</p>}
            </div>
            {it.c && <span className="shrink-0 text-xs font-semibold text-ink/40">{it.c}</span>}
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
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-mist p-1.5">
        <span className="flex-1 truncate px-2 text-sm font-semibold text-ink/70">{url}</span>
        <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-2 text-sm font-bold text-white">
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {shareTargets(url, name).map((t) => (
          <a key={t.label} href={t.href} target="_blank" rel="noreferrer" className="rounded-xl bg-mist py-3 text-center text-xs font-bold text-ink/70 transition hover:bg-brand-50 hover:text-brand-600">
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
      <button onClick={download} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient py-3 text-sm font-bold text-white">
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
        className="relative w-full max-w-sm rounded-t-3xl bg-white p-5 shadow-float sm:rounded-3xl"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-ink/40 hover:text-ink" aria-label="Close"><X size={18} /></button>
        {children}
      </motion.div>
    </div>
  );
}
