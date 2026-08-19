import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Check, X, QrCode } from "lucide-react";
import LiveProfileCard from "@/components/app/LiveProfileCard";
import { PublicProfile as TProfile, shareTargets, trackEvent } from "@/lib/publicProfile";

/**
 * The real public page — renders with LiveProfileCard, the exact same
 * component Studio's live preview uses, so what a visitor sees when they
 * scan the QR code or open the link is pixel-identical to what the owner
 * designed, not a separately-maintained lookalike.
 */
export default function PublicProfile({
  profile,
  shareUrl,
}: {
  profile: TProfile;
  shareUrl: string;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const name = profile.fullName || `@${profile.username}`;
  const d = profile.design || {};

  // Track profile view (and link taps) into the owner's dashboard analytics.
  useEffect(() => {
    if (!profile.username) return;
    trackEvent({ type: "profile_view", slug: profile.username });
  }, [profile.username]);

  return (
    <>
      <LiveProfileCard
        interactive
        onShare={() => setShareOpen(true)}
        primary={d.primary || "#BE5103"}
        accent={d.accent || "#069494"}
        theme={d.theme || "light"}
        name={name}
        username={profile.username}
        avatarUrl={profile.profilePicture}
        bio={profile.bio}
        socialLinks={profile.social}
        contact={{
          phone: profile.phone,
          whatsapp: profile.whatsapp,
          email: profile.email,
          website: profile.website,
        }}
        experience={profile.experience}
        education={profile.education}
        products={profile.products}
        business={profile.business}
        headerLayout={d.headerLayout}
        bannerUrl={d.bannerUrl}
        wallpaperType={d.wallpaperType}
        backgroundImageUrl={d.backgroundImageUrl}
        backgroundColor={d.backgroundColor}
        gradientColor={d.gradientColor}
        gradientColorEnd={d.gradientColorEnd}
        gradientDirection={d.gradientDirection}
        noise={d.noise}
        patternIndex={d.patternIndex}
        buttonColor={d.buttonColor}
        buttonTextColor={d.buttonTextColor}
        buttonStyle={d.buttonStyle}
        buttonRoundness={d.buttonRoundness}
        buttonShadow={d.buttonShadow}
        socialLinksStyle={d.socialLinksStyle}
        pageFont={d.pageFont}
        pageTextColor={d.pageTextColor}
        matchTitleFont={d.matchTitleFont}
        titleFont={d.titleFont}
        titleColor={d.titleColor}
        titleFontSize={d.titleFontSize}
        bioFontSize={d.bioFontSize}
        bodyFontSize={d.bodyFontSize}
      />

      {shareOpen && (
        <ShareModal url={shareUrl} name={name} username={profile.username} onClose={() => setShareOpen(false)} />
      )}
    </>
  );
}

/* ---------- share popup (link + QR + platforms) ---------- */
function ShareModal({
  url,
  name,
  username,
  onClose,
}: {
  url: string;
  name: string;
  username: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const nativeShare = () => navigator.share?.({ title: name, url }).catch(() => {});
  const downloadQr = () => {
    const canvas = document.getElementById("cc-qr") as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${username}-qr.png`;
    a.click();
  };

  return (
    <Overlay onClose={onClose}>
      <h3 className="font-display text-lg font-black text-ink">Share this ClickCard</h3>
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-paper-tint p-1.5">
        <span className="flex-1 truncate px-2 text-sm font-semibold text-ink/70">{url}</span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-primary to-secondary px-3 py-2 text-sm font-bold text-white"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="mt-4 grid place-items-center rounded-2xl bg-white p-4 ring-1 ring-black/[0.04]">
        <QRCodeCanvas id="cc-qr" value={url} size={140} level="M" includeMargin />
        <button
          onClick={downloadQr}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-ink/50 transition hover:text-primary"
        >
          <QrCode size={13} /> Download QR
        </button>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {shareTargets(url, name).map((t) => (
          <a
            key={t.label}
            href={t.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-paper-tint py-3 text-center text-xs font-bold text-ink/70 transition hover:bg-primary/10 hover:text-primary"
          >
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
        <button onClick={onClose} className="absolute right-4 top-4 text-ink/40 hover:text-ink" aria-label="Close">
          <X size={18} />
        </button>
        {children}
      </motion.div>
    </div>
  );
}
