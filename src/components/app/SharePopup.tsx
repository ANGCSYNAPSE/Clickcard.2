import { useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import {
  X as CloseIcon,
  Settings,
  Copy,
  Check,
  QrCode as QrCodeIcon,
  CreditCard,
  Mail,
} from "lucide-react";
import { SiWhatsapp, SiX, SiFacebook } from "react-icons/si";
import { getSocialIcon } from "@/lib/socialPlatforms";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { pushToast } from "@/store/slices/uiSlice";

/** The "Share" popup — profile link + QR + quick share destinations. */
export default function SharePopup({
  profileUrl,
  onClose,
}: {
  profileUrl: string;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.profile.data);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(true);

  const shortLabel = profileUrl.replace(/^https?:\/\//, "");
  const socialLinks = (profile?.social || []).filter((s) => s.url);

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    dispatch(pushToast("Link copied to clipboard", "success"));
    setTimeout(() => setCopied(false), 1500);
  };

  const encodedUrl = encodeURIComponent(profileUrl);
  const SHARE_DESTINATIONS = [
    { label: "WhatsApp", icon: SiWhatsapp, href: `https://api.whatsapp.com/send?text=${encodedUrl}` },
    { label: "X", icon: SiX, href: `https://twitter.com/intent/tweet?url=${encodedUrl}` },
    { label: "Facebook", icon: SiFacebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "Email", icon: Mail, href: `mailto:?body=${encodedUrl}` },
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-sm flex-col rounded-t-3xl bg-white shadow-soft-lg sm:max-h-[85vh] sm:rounded-3xl dark:bg-[#12403c]"
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <h3 className="font-display text-lg font-black text-ink dark:text-white">Share</h3>
          <div className="flex items-center gap-1">
            <Link
              href="/settings"
              aria-label="Share settings"
              className="grid h-9 w-9 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 dark:text-white/60 dark:hover:bg-white/10"
            >
              <Settings size={17} />
            </Link>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 dark:text-white/60 dark:hover:bg-white/10"
            >
              <CloseIcon size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-5 pb-5">
          {/* link row */}
          <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-mist px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-white dark:bg-white dark:text-ink">
              <span className="text-[10px] font-black">C</span>
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink dark:text-white">
              {shortLabel}
            </span>
            <button
              onClick={copyLink}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90 dark:bg-white dark:text-ink"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* QR card */}
          {showQr && (
            <div className="relative mt-4 rounded-2xl border border-ink/10 p-5 text-center dark:border-white/10">
              <button
                onClick={() => setShowQr(false)}
                aria-label="Hide QR code"
                className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-ink/40 transition hover:bg-ink/5 dark:text-white/40 dark:hover:bg-white/10"
              >
                <CloseIcon size={14} />
              </button>
              <div className="mx-auto grid h-32 w-32 place-items-center rounded-xl bg-white p-2 ring-1 ring-ink/5">
                <QRCodeCanvas id="qr-share-popup" value={profileUrl} size={112} level="M" />
              </div>
              <p className="mt-3 text-sm font-bold text-ink dark:text-white">Scan to open your profile</p>
              <p className="text-xs text-ink/50 dark:text-white/50">Scan with your phone</p>
            </div>
          )}

          {/* my platforms */}
          {socialLinks.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-ink/50 dark:text-white/50">
                My platforms
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((s, i) => {
                  const Icon = getSocialIcon(s.platform);
                  return (
                    <a
                      key={`${s.platform}-${i}`}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center gap-1"
                    >
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-mist text-ink/70 transition hover:bg-ink/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10">
                        <Icon size={18} />
                      </span>
                      <span className="max-w-[56px] truncate text-[10px] font-semibold text-ink/60 dark:text-white/60">
                        {s.platform}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* bottom quick-share row */}
        <div className="flex items-center gap-4 overflow-x-auto border-t border-ink/10 px-5 py-4 dark:border-white/10">
          <a href={profileUrl} target="_blank" rel="noreferrer" className="flex shrink-0 flex-col items-center gap-1">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white dark:bg-white dark:text-ink">
              <span className="text-sm font-black">C</span>
            </span>
            <span className="text-[10px] font-semibold text-ink/60 dark:text-white/60">My ClickCard</span>
          </a>
          <Link href="/card" className="relative flex shrink-0 flex-col items-center gap-1">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-mist text-ink/70 dark:bg-white/5 dark:text-white/70">
              <CreditCard size={18} />
            </span>
            <span className="absolute -top-1 right-0 rounded-full bg-candy-pink px-1.5 py-0.5 text-[8px] font-black text-white">
              NEW
            </span>
            <span className="text-[10px] font-semibold text-ink/60 dark:text-white/60">Cards</span>
          </Link>
          <button onClick={() => setShowQr((v) => !v)} className="flex shrink-0 flex-col items-center gap-1">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-mist text-ink/70 dark:bg-white/5 dark:text-white/70">
              <QrCodeIcon size={18} />
            </span>
            <span className="text-[10px] font-semibold text-ink/60 dark:text-white/60">QR code</span>
          </button>
          {SHARE_DESTINATIONS.map((d) => (
            <a
              key={d.label}
              href={d.href}
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-mist text-ink/70 dark:bg-white/5 dark:text-white/70">
                <d.icon size={18} />
              </span>
              <span className="text-[10px] font-semibold text-ink/60 dark:text-white/60">{d.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
