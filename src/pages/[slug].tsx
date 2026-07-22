import type { GetServerSideProps } from "next";
import Head from "next/head";
import { Ghost } from "lucide-react";
import PublicProfile from "@/components/public/PublicProfile";
import { fetchPublicProfile, PublicProfile as TProfile } from "@/lib/publicProfile";
import { WEBAPP_URL } from "@/lib/site";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clickcard.app";

interface Props {
  profile: TProfile | null;
  slug: string;
  shareUrl: string;
}

export default function SlugPage({ profile, slug, shareUrl }: Props) {
  if (!profile || profile.isPublic === false) {
    const isPrivate = profile?.isPublic === false;
    return (
      <>
        <Head>
          <title>{isPrivate ? "Private profile" : "Profile not found"} · ClickCard</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="grid min-h-screen place-items-center bg-mist px-6 text-center">
          <div>
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-gradient text-white shadow-glow">
              <Ghost size={34} />
            </span>
            <h1 className="mt-6 font-display text-2xl font-black text-ink">
              {isPrivate ? "This profile is private" : `clickcard.app/${slug} isn’t taken yet`}
            </h1>
            <p className="mt-2 text-sm text-ink/55">
              {isPrivate
                ? "The owner has hidden this page from the public."
                : "Be the one to claim this link and make it yours."}
            </p>
            <a href={WEBAPP_URL} className="mt-6 inline-flex rounded-2xl bg-brand-gradient px-6 py-3 text-sm font-bold text-white shadow-soft">
              {isPrivate ? "Create your ClickCard" : `Claim /${slug}`}
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
        <link rel="canonical" href={shareUrl} />
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
  const slug = String(ctx.params?.slug || "");
  const { profile } = await fetchPublicProfile(slug);
  const shareUrl = `${SITE_URL}/${slug}`;

  // Don't let search engines index private/missing profiles.
  if (!profile || profile.isPublic === false) {
    ctx.res.statusCode = 404;
  }

  return { props: { profile, slug, shareUrl } };
};
