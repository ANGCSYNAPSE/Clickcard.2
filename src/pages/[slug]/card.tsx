import type { GetServerSideProps } from "next";
import Head from "next/head";
import { Ghost } from "lucide-react";
import CardPreview from "@/components/app/CardPreview";
import { fetchPublicProfile, fetchOwnProfile, PublicProfile as TProfile } from "@/lib/publicProfile";
import { SITE_URL } from "@/lib/config";

interface Props {
  profile: TProfile | null;
  slug: string;
  shareUrl: string;
}

export default function CardPage({ profile, slug, shareUrl }: Props) {
  if (!profile || profile.isPublic === false) {
    const isPrivate = profile?.isPublic === false;
    return (
      <>
        <Head>
          <title>{isPrivate ? "Private profile" : "Card not found"} · ClickCard</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="grid min-h-screen place-items-center bg-paper-soft px-6 text-center">
          <div>
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-soft-lg">
              <Ghost size={34} />
            </span>
            <h1 className="mt-6 font-display text-2xl font-black text-ink">
              {isPrivate ? "This card is private" : `Card not found for /${slug}`}
            </h1>
            <p className="mt-2 text-sm text-ink/55">
              {isPrivate
                ? "The owner has hidden this page from the public."
                : "This user hasn't shared their card yet."}
            </p>
          </div>
        </div>
      </>
    );
  }

  const name = profile.fullName || `@${profile.username}`;
  const title = `${name}'s Digital Card · ClickCard`;
  const desc = `View ${name}'s digital business card on ClickCard`;
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
      <div className="flex justify-center items-center min-h-screen overflow-auto p-4">
        <CardPreview
          templateId={(profile.design as any)?.templateId || "wave-bold"}
          primary={(profile.design as any)?.primaryColor || "#BE5103"}
          accent={(profile.design as any)?.accentColor || "#069494"}
          theme={((profile.design as any)?.theme as "light" | "dark") || "light"}
          profile={{
            personal: { fullName: profile.fullName, tagline: profile.tagline, bio: profile.bio },
            contact: { email: profile.email, phone: profile.phone, website: profile.website, city: profile.city },
            business: profile.business,
            experience: profile.experience || [],
            education: profile.education || [],
            digitalCard: {
              skills: (profile.design as any)?.skills,
              projects: (profile.design as any)?.projects,
              awards: (profile.design as any)?.awards,
              languages: (profile.design as any)?.languages,
              references: (profile.design as any)?.references,
              socialLinks: (profile.design as any)?.socialLinks,
            },
          } as any}
          username={profile.username}
          fontFamily={(profile.design as any)?.fontFamily}
          textColor={(profile.design as any)?.cardTextColor}
          backgroundColor={(profile.design as any)?.backgroundColor}
          headerColor={(profile.design as any)?.headerColor}
          paletteStyle={(profile.design as any)?.paletteStyle}
        />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug || "");

  let profile: TProfile | null = null;
  const accessToken = ctx.req.cookies["cc_access"];
  let isOwner = false;
  if (accessToken) {
    const own = await fetchOwnProfile(accessToken);
    if (own && own.username.toLowerCase() === slug.toLowerCase()) {
      profile = own;
      isOwner = true;
    }
  }

  if (!profile) {
    ({ profile } = await fetchPublicProfile(slug));
  }

  const shareUrl = `${SITE_URL}/${slug}/card`;

  if (!profile || (profile.isPublic === false && !isOwner)) {
    ctx.res.statusCode = 404;
  }

  const safeProfile = profile ? (JSON.parse(JSON.stringify(profile)) as TProfile) : null;

  if (safeProfile && isOwner) {
    safeProfile.isPublic = true;
  }

  return { props: { profile: safeProfile, slug, shareUrl } };
};
