import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { QRCodeCanvas } from "qrcode.react";
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Pencil,
  Globe,
  Phone as PhoneIcon,
  Link2,
  Briefcase,
  GraduationCap,
  Package,
  Building2,
  Download,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { useRequireAuth } from "@/lib/authGuards";
import { SITE_URL } from "@/lib/config";
import LiveProfileCard from "@/components/app/LiveProfileCard";
import SharePopup from "@/components/app/SharePopup";
import { displayName } from "@/lib/personal";

/** Standalone "View as" preview — the live profile card on its own page.
 * Mobile/tablet just get the card, same as it always has; lg+ gets a
 * dashboard-style layout (info card + summary/preview/share panels) that
 * matches the rest of the app's admin-style detail pages instead of a
 * phone mockup floating in empty space. */
export default function ProfilePreviewPage() {
  const { ready } = useRequireAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { draft, status } = useAppSelector((s) => s.profile);
  const { user } = useAppSelector((s) => s.auth);
  const design = useAppSelector((s) => s.design);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (status === "idle") dispatch(fetchProfile());
  }, [dispatch, status]);

  const profileUrl = user?.username ? `${SITE_URL}/${user.username}` : null;

  const copyUrl = async () => {
    if (!profileUrl) return;
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    dispatch(pushToast("Profile link copied to clipboard", "success"));
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadQr = () => {
    const canvas = document.getElementById("preview-qr") as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${user?.username || "profile"}-qr.png`;
    a.click();
  };

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist dark:bg-[#1a1a1a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    );
  }

  const social = (draft.social || []).filter((s) => s.url || s.username);
  const contact = draft.contact || {};
  const contactCount = [contact.phone, contact.whatsapp, contact.email, contact.website].filter(Boolean).length;
  const experience = draft.experience || [];
  const education = draft.education || [];
  const products = draft.products || [];
  const business = (draft.business || []).filter((b) => b.name);

  const sections = [
    { icon: PhoneIcon, label: "Contact", count: contactCount },
    { icon: Link2, label: "Social links", count: social.length },
    { icon: Briefcase, label: "Experience", count: experience.length },
    { icon: GraduationCap, label: "Education", count: education.length },
    { icon: Building2, label: "Business", count: business.length },
    { icon: Package, label: "Products", count: products.length },
  ];
  const filledSections = sections.filter((s) => s.count > 0);

  const name = displayName(draft.personal);
  const initial = (name || user?.username || "U").charAt(0).toUpperCase();
  const avatarUrl = draft.personal?.profilePicture;

  return (
    <>
      <Head>
        <title>View as · ClickCard</title>
      </Head>
      <div className="min-h-screen bg-mist px-6 py-8 dark:bg-[#1a1a1a] lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-md lg:max-w-6xl">
          {/* header — plain pill bar below lg (unchanged), dashboard-style
              title + breadcrumb at lg+ */}
          <div className="flex w-full items-center justify-between gap-3 lg:hidden">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft transition hover:opacity-90 dark:bg-white/10 dark:text-white"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft dark:bg-white/10 dark:text-white">
              View as
            </span>
            <span className="w-[74px]" aria-hidden />
          </div>

          <div className="hidden items-center justify-between gap-3 lg:flex">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                aria-label="Back"
                className="grid h-9 w-9 place-items-center rounded-lg text-ink/70 transition hover:bg-ink/5 dark:text-white/70 dark:hover:bg-white/10"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="font-display text-2xl font-black text-ink dark:text-white">
                  Profile Preview
                </h1>
                <p className="text-xs text-ink/50 dark:text-white/50">
                  Profile <span className="text-brand-500">›</span> Preview
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profileUrl && (
                <button
                  onClick={() => setShareOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-ink/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  <Share2 size={15} /> Share
                </button>
              )}
              <button
                onClick={() => router.push("/profile")}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-primary to-secondary px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
              >
                <Pencil size={15} /> Edit profile
              </button>
            </div>
          </div>

          {/* Below lg: unchanged — just the card, centered */}
          <div className="mt-6 flex flex-col items-center lg:hidden">
            <LiveProfileCard
              {...design}
              name={name}
              username={user?.username}
              avatarUrl={avatarUrl}
              bio={draft.personal?.bio}
              socialLinks={social}
              contact={draft.contact}
              experience={draft.experience}
              education={draft.education}
              products={draft.products}
              business={draft.business}
              onShare={profileUrl ? () => setShareOpen(true) : undefined}
            />
          </div>

          {/* lg+: dashboard-style detail layout */}
          <div className="hidden lg:block">
            {/* Summary card */}
            <div className="mt-6 rounded-3xl border border-ink/5 bg-white p-6 dark:border-white/5 dark:bg-[#262626]">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary to-secondary">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-4xl font-bold text-white">
                        {initial}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <h2 className="text-3xl font-bold text-ink dark:text-white">
                        {name || "Your name"}
                      </h2>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                        Preview
                      </span>
                    </div>
                    {profileUrl && (
                      <p className="mb-2 flex items-center gap-2 text-sm text-ink/55 dark:text-white/55">
                        <Globe size={16} /> {profileUrl}
                      </p>
                    )}
                    {draft.personal?.bio && (
                      <p className="mb-3 max-w-lg text-sm text-ink/55 dark:text-white/55">{draft.personal.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                        {filledSections.length} of {sections.length} sections filled
                      </span>
                      <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                        {design.theme === "dark" ? "Dark theme" : "Light theme"}
                      </span>
                    </div>
                  </div>
                </div>
                {profileUrl && (
                  <button
                    onClick={copyUrl}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-ink/10 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-ink/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy link"}
                  </button>
                )}
              </div>

              {/* Meta row */}
              <div className="mt-6 grid grid-cols-4 gap-6 border-t border-ink/5 pt-6 dark:border-white/5">
                <div>
                  <p className="mb-1 text-xs text-ink/45 dark:text-white/45">Username</p>
                  <p className="text-sm font-semibold text-ink dark:text-white">
                    {user?.username ? `@${user.username}` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-ink/45 dark:text-white/45">Header style</p>
                  <p className="text-sm font-semibold capitalize text-ink dark:text-white">
                    {design.headerLayout || "Classic"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-ink/45 dark:text-white/45">Button style</p>
                  <p className="text-sm font-semibold capitalize text-ink dark:text-white">
                    {design.buttonStyle || "Solid"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-ink/45 dark:text-white/45">Social links style</p>
                  <p className="text-sm font-semibold capitalize text-ink dark:text-white">
                    {design.socialLinksStyle || "Buttons"}
                  </p>
                </div>
              </div>
            </div>

            {/* Three-column detail grid */}
            <div className="mt-6 grid grid-cols-3 gap-6">
              {/* Profile summary */}
              <div className="rounded-3xl border border-ink/5 bg-white p-6 dark:border-white/5 dark:bg-[#262626]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-ink dark:text-white">Profile Summary</h3>
                  <button
                    onClick={() => router.push("/profile")}
                    className="rounded p-1 text-ink/50 transition hover:bg-ink/5 dark:text-white/50 dark:hover:bg-white/10"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  {sections.map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <p className="flex items-center gap-2 text-sm text-ink/55 dark:text-white/55">
                        <s.icon size={14} /> {s.label}
                      </p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{s.count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live preview mockup */}
              <div className="rounded-3xl border border-ink/5 bg-white p-6 dark:border-white/5 dark:bg-[#262626]">
                <h3 className="mb-4 font-bold text-ink dark:text-white">Live Preview</h3>
                {/* Full-width scrollable preview — card fills the column width */}
                <div className="overflow-hidden rounded-2xl" style={{ height: 560 }}>
                  <LiveProfileCard
                    {...design}
                    name={name}
                    username={user?.username}
                    avatarUrl={avatarUrl}
                    bio={draft.personal?.bio}
                    socialLinks={social}
                    contact={draft.contact}
                    experience={draft.experience}
                    education={draft.education}
                    products={draft.products}
                    business={draft.business}
                    onShare={profileUrl ? () => setShareOpen(true) : undefined}
                    interactive
                    fullWidth
                  />
                </div>
                <p className="mt-4 text-center text-xs text-ink/45 dark:text-white/45">
                  Exactly what visitors see on your ClickCard link
                </p>
              </div>

              {/* Share & QR */}
              <div className="rounded-3xl border border-ink/5 bg-white p-6 dark:border-white/5 dark:bg-[#262626]">
                <h3 className="mb-4 font-bold text-ink dark:text-white">Share &amp; QR</h3>
                {profileUrl ? (
                  <>
                    <div className="flex items-center gap-2 rounded-xl bg-paper-soft p-1.5 pl-3 dark:bg-dark">
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink/60 dark:text-white/60">
                        {profileUrl}
                      </span>
                      <button
                        onClick={copyUrl}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/50 transition hover:bg-white dark:text-white/50 dark:hover:bg-white/10"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="mt-4 grid place-items-center rounded-2xl bg-paper-soft p-4 dark:bg-dark">
                      <QRCodeCanvas id="preview-qr" value={profileUrl} size={128} level="M" includeMargin />
                      <button
                        onClick={downloadQr}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-ink/50 transition hover:text-primary dark:text-white/50"
                      >
                        <Download size={13} /> Download QR
                      </button>
                    </div>
                    <button
                      onClick={() => setShareOpen(true)}
                      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-primary to-secondary px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                    >
                      <Share2 size={15} /> Share profile
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-ink/45 dark:text-white/45">
                    Pick a username to get your public link and QR code.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {shareOpen && profileUrl && (
        <SharePopup profileUrl={profileUrl} onClose={() => setShareOpen(false)} />
      )}
    </>
  );
}
