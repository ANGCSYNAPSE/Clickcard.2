import { useEffect, useState } from "react";
import Head from "next/head";
import { useFormik } from "formik";
import { QRCodeCanvas } from "qrcode.react";
import {
  Link2,
  Plus,
  Copy,
  Trash2,
  RefreshCw,
  Lock,
  Check,
  QrCode,
  Download,
  Share2,
} from "lucide-react";
import AppShell from "@/components/app/AppShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SharePopup from "@/components/app/SharePopup";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchShareLinks,
  createShareLink,
  deleteShareLink,
} from "@/store/slices/shareSlice";
import { fetchProfile } from "@/store/slices/profileSlice";
import { shareService } from "@/services/shareService";
import { pushToast } from "@/store/slices/uiSlice";
import { useEntitlement } from "@/lib/useEntitlement";
import { SHARE_BASE_URL, SITE_URL } from "@/lib/config";
import { UpgradeHint, LimitReachedBanner } from "@/components/app/Upsell";
import type { ShareLink } from "@/types";

const PUBLIC_BASE = SHARE_BASE_URL;

const linkUrl = (l: ShareLink) =>
  l.url || `${PUBLIC_BASE}/${l.custom_slug || l.short_code || l.id}`;

export default function SharePage() {
  const dispatch = useAppDispatch();
  const { links, status, mutating } = useAppSelector((s) => s.share);
  const user = useAppSelector((s) => s.auth.user);
  const { withinLimit, limit, isPaid } = useEntitlement();
  const profileStatus = useAppSelector((s) => s.profile.status);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [profileCopied, setProfileCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);

  const profileUrl = user?.username ? `${SITE_URL}/${user.username}` : null;

  const copyProfileUrl = async () => {
    if (!profileUrl) return;
    await navigator.clipboard.writeText(profileUrl);
    setProfileCopied(true);
    dispatch(pushToast("Profile link copied to clipboard", "success"));
    setTimeout(() => setProfileCopied(false), 1500);
  };

  const downloadProfileQR = () => {
    const canvas = document.getElementById("qr-profile") as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${user?.username || "profile"}-qr.png`;
    a.click();
  };

  const atLimit = !withinLimit("links", links.length);
  const linkCap = limit("links");

  useEffect(() => {
    dispatch(fetchShareLinks());
    if (profileStatus === "idle") dispatch(fetchProfile());
  }, [dispatch, profileStatus]);

  const form = useFormik({
    initialValues: { custom_slug: "", expiry_days: 0, requires_password: false, share_password: "" },
    onSubmit: async (values, { resetForm }) => {
      const res = await dispatch(
        createShareLink({
          custom_slug: values.custom_slug.trim() || undefined,
          expiry_days: values.expiry_days || undefined,
          requires_password: values.requires_password,
          share_password: values.requires_password ? values.share_password : undefined,
        }),
      );
      if (createShareLink.fulfilled.match(res)) {
        dispatch(pushToast("Share link created!", "success"));
        resetForm();
        setShowForm(false);
      } else {
        dispatch(pushToast((res.payload as string) || "Could not create link", "error"));
      }
    },
  });

  const copy = async (l: ShareLink) => {
    await navigator.clipboard.writeText(linkUrl(l));
    setCopiedId(l.id);
    dispatch(pushToast("Link copied to clipboard", "success"));
    setTimeout(() => setCopiedId(null), 1500);
  };

  const regenerate = async (id: number) => {
    try {
      await shareService.regenerate(id);
      dispatch(fetchShareLinks());
      dispatch(pushToast("New code generated", "success"));
    } catch {
      dispatch(pushToast("Could not regenerate", "error"));
    }
  };

  const remove = async (id: number) => {
    const res = await dispatch(deleteShareLink(id));
    if (deleteShareLink.fulfilled.match(res))
      dispatch(pushToast("Link deleted", "info"));
  };

  return (
    <AppShell>
      <Head>
        <title>Share & QR · ClickCard</title>
      </Head>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-ink dark:text-white">
            Share & QR
          </h1>
          <p className="text-sm text-ink/55 dark:text-white/55">
            Create short links and QR codes for your profile.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {profileUrl && (
            <Button variant="outline" onClick={() => setShowSharePopup(true)}>
              <Share2 size={18} /> Share
            </Button>
          )}
          {atLimit ? (
            <UpgradeHint label="Upgrade for more links" />
          ) : (
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus size={18} /> New link
            </Button>
          )}
        </div>
      </div>

      {!isPaid && linkCap !== -1 && (
        <p className="mt-2 text-xs font-semibold text-ink/45 dark:text-white/45">
          {links.length} / {linkCap} links used on the Free plan
        </p>
      )}

      {atLimit && (
        <div className="mt-4">
          <LimitReachedBanner
            title="You've hit your link limit"
            description="Upgrade to Pro for unlimited share links, custom QR & analytics."
          />
        </div>
      )}

      {/* Your profile QR — always available, independent of custom share links */}
      {profileUrl && (
        <div className="mt-5 flex flex-col items-center gap-4 rounded-3xl border border-ink/5 bg-white p-5 text-center dark:border-white/5 dark:bg-[#262626] sm:flex-row sm:items-center sm:text-left">
          <div className="grid h-36 w-36 shrink-0 place-items-center rounded-2xl bg-white p-2 ring-1 ring-ink/5 dark:bg-white sm:h-28 sm:w-28">
            <QRCodeCanvas
              id="qr-profile"
              value={profileUrl}
              size={128}
              level="M"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink dark:text-white">Your profile QR</p>
            <p className="truncate text-xs font-mono text-ink/45 dark:text-white/45">{profileUrl}</p>
            <p className="mt-1 text-sm text-ink/55 dark:text-white/55">
              Scans open your live ClickCard profile.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <IconBtn onClick={copyProfileUrl} label="Copy">
              {profileCopied ? <Check size={16} className="text-candy-pink" /> : <Copy size={16} />}
            </IconBtn>
            <IconBtn onClick={downloadProfileQR} label="Download QR">
              <Download size={16} />
            </IconBtn>
          </div>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={form.handleSubmit}
          className="mt-5 grid gap-4 rounded-3xl border border-ink/5 bg-white p-6 dark:border-white/5 dark:bg-[#262626] sm:grid-cols-2"
        >
          <Input
            name="custom_slug"
            label="Custom slug (optional)"
            placeholder="my-profile"
            leftIcon={<Link2 size={18} />}
            value={form.values.custom_slug}
            onChange={form.handleChange}
          />
          <Input
            name="expiry_days"
            type="number"
            label="Expires in (days, 0 = never)"
            min={0}
            value={form.values.expiry_days}
            onChange={form.handleChange}
          />
          <label className="flex items-center gap-2 text-sm font-semibold text-ink/80 dark:text-white/80">
            <input
              type="checkbox"
              name="requires_password"
              checked={form.values.requires_password}
              onChange={form.handleChange}
              className="h-4 w-4 accent-brand-500"
            />
            Password protect
          </label>
          {form.values.requires_password && (
            <Input
              name="share_password"
              type="password"
              label="Password"
              leftIcon={<Lock size={18} />}
              value={form.values.share_password}
              onChange={form.handleChange}
            />
          )}
          <div className="sm:col-span-2">
            <Button type="submit" loading={mutating} fullWidth>
              Create link
            </Button>
          </div>
        </form>
      )}

      {/* list */}
      <div className="mt-6 space-y-4">
        {status === "loading" && links.length === 0 && (
          <SkeletonRows />
        )}
        {status !== "loading" && links.length === 0 && (
          <div className="grid place-items-center rounded-3xl border border-dashed border-ink/15 py-16 text-center dark:border-white/10">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-white/5">
              <QrCode size={28} />
            </span>
            <p className="mt-4 font-bold text-ink dark:text-white">No links yet</p>
            <p className="text-sm text-ink/55 dark:text-white/55">
              Create your first share link to get a QR code.
            </p>
          </div>
        )}

        {links.map((l) => {
          const friendly = l.custom_slug || `Share link #${l.id}`;
          const downloadQR = () => {
            const canvas = document.getElementById(`qr-${l.id}`) as HTMLCanvasElement | null;
            if (!canvas) return;
            const a = document.createElement("a");
            a.href = canvas.toDataURL("image/png");
            a.download = `${l.custom_slug || l.short_code || `qr-${l.id}`}.png`;
            a.click();
          };
          return (
            <div
              key={l.id}
              className="flex flex-col items-center gap-4 rounded-3xl border border-ink/5 bg-white p-5 text-center dark:border-white/5 dark:bg-[#262626] sm:flex-row sm:items-center sm:text-left"
            >
              <div className="grid h-36 w-36 shrink-0 place-items-center rounded-2xl bg-white p-2 ring-1 ring-ink/5 dark:bg-white sm:h-28 sm:w-28">
                <QRCodeCanvas
                  id={`qr-${l.id}`}
                  value={linkUrl(l)}
                  size={128}
                  level="M"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink dark:text-white">{friendly}</p>
                <p className="truncate text-xs font-mono text-ink/45 dark:text-white/45">
                  {linkUrl(l)}
                </p>
                <p className="mt-1 text-sm text-ink/55 dark:text-white/55">
                  {l.visits ?? 0} visits
                  {l.requires_password && " · 🔒 protected"}
                  {l.is_active === false && " · inactive"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <IconBtn onClick={() => copy(l)} label="Copy">
                  {copiedId === l.id ? (
                    <Check size={16} className="text-candy-pink" />
                  ) : (
                    <Copy size={16} />
                  )}
                </IconBtn>
                <IconBtn onClick={downloadQR} label="Download QR">
                  <Download size={16} />
                </IconBtn>
                <IconBtn onClick={() => regenerate(l.id)} label="Regenerate">
                  <RefreshCw size={16} />
                </IconBtn>
                <IconBtn onClick={() => remove(l.id)} label="Delete" danger>
                  <Trash2 size={16} />
                </IconBtn>
              </div>
            </div>
          );
        })}
      </div>

      {showSharePopup && profileUrl && (
        <SharePopup profileUrl={profileUrl} onClose={() => setShowSharePopup(false)} />
      )}
    </AppShell>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`grid h-10 w-10 place-items-center rounded-xl transition ${
        danger
          ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          : "text-ink/60 hover:bg-brand-50 hover:text-brand-600 dark:text-white/60 dark:hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function SkeletonRows() {
  return (
    <>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-4 rounded-3xl border border-ink/5 bg-white p-5 dark:border-white/5 dark:bg-[#262626]"
        >
          <div className="h-24 w-24 rounded-2xl bg-ink/5 dark:bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-ink/5 dark:bg-white/5" />
            <div className="h-3 w-1/3 rounded bg-ink/5 dark:bg-white/5" />
          </div>
        </div>
      ))}
    </>
  );
}
