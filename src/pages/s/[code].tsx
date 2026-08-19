import type { GetServerSideProps } from "next";
import Head from "next/head";
import { Ghost } from "lucide-react";
import PublicProfile from "@/components/public/PublicProfile";
import { fetchPublicProfile, PublicProfile as TProfile } from "@/lib/publicProfile";
import { SHARE_BASE_URL } from "@/lib/config";

interface Props {
  profile: TProfile | null;
  code: string;
  shareUrl: string;
}

/**
 * Short-link landing page for links created on the Share & QR page
 * (clickcard.app/s/:code). The backend's public profile endpoint already
 * resolves an identifier by username, custom slug, *or* short code, so this
 * reuses the same lookup and rendering as /[slug] instead of duplicating it.
 */
export default function ShareCodePage({ profile, code, shareUrl }: Props) {
  if (!profile || profile.isPublic === false) {
    const isPrivate = profile?.isPublic === false;
    return (
      <>
        <Head>
          <title>{isPrivate ? "Private profile" : "Link not found"} · ClickCard</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="grid min-h-screen place-items-center bg-paper-soft px-6 text-center">
          <div>
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-soft-lg">
              <Ghost size={34} />
            </span>
            <h1 className="mt-6 font-display text-2xl font-black text-ink">
              {isPrivate ? "This profile is private" : "This link doesn't exist"}
            </h1>
            <p className="mt-2 text-sm text-ink/55">
              {isPrivate
                ? "The owner has hidden this page from the public."
                : "It may have expired, been deleted, or never existed."}
            </p>
            <a href="/signup" className="mt-6 inline-flex rounded-2xl bg-gradient-to-br from-primary to-secondary px-6 py-3 text-sm font-bold text-white shadow-soft">
              Create your ClickCard
            </a>
          </div>
        </div>
      </>
    );
  }

  const name = profile.fullName || `@${profile.username}`;
  const title = `${name}${profile.tagline ? ` — ${profile.tagline}` : ""} · ClickCard`;
  const desc = profile.bio || `Connect with ${name} on ClickCard — links, contact, card & more.`;
  const ogImg = profile.profilePicture;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:site_name" content="ClickCard" />
        {ogImg && <meta property="og:image" content={ogImg} />}
        <meta name="twitter:card" content={ogImg ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        {ogImg && <meta name="twitter:image" content={ogImg} />}
      </Head>
      <PublicProfile profile={profile} shareUrl={shareUrl} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const code = String(ctx.params?.code || "");
  const { profile } = await fetchPublicProfile(code);
  const shareUrl = `${SHARE_BASE_URL}/${code}`;

  // Don't let search engines index private/missing/expired links.
  if (!profile || profile.isPublic === false) {
    ctx.res.statusCode = 404;
  }

  // getServerSideProps props must be JSON-serializable — see the same note
  // in [slug].tsx for why this round-trip is needed.
  const safeProfile = profile ? (JSON.parse(JSON.stringify(profile)) as TProfile) : null;

  return { props: { profile: safeProfile, code, shareUrl } };
};
