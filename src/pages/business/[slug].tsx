import type { GetServerSideProps } from "next";
import Head from "next/head";
import { Ghost } from "lucide-react";
import { fetchPublicBusinessProfile, type PublicBusinessProfile } from "@/lib/publicBusiness";
import { SITE_URL } from "@/lib/config";
import BusinessShowcase from "@/components/business/BusinessShowcase";

interface Props {
  profile: PublicBusinessProfile | null;
  shareUrl: string;
}

export default function PublicBusinessProfilePage({ profile, shareUrl }: Props) {
  if (!profile) {
    return (
      <>
        <Head>
          <title>Business profile not found · ClickCard</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="grid min-h-screen place-items-center bg-paper-soft px-6 text-center">
          <div>
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-white shadow-soft-lg">
              <Ghost size={34} />
            </span>
            <h1 className="mt-6 font-display text-2xl font-black text-ink">
              This business profile isn&rsquo;t available
            </h1>
            <p className="mt-2 text-sm text-ink/55">
              It may have been removed or the link is incorrect.
            </p>
            <a href="/signup" className="mt-6 inline-flex rounded-2xl bg-gradient-to-br from-primary to-secondary px-6 py-3 text-sm font-bold text-white shadow-soft">
              Create your ClickCard
            </a>
          </div>
        </div>
      </>
    );
  }

  const title = `${profile.company_name} · ClickCard`;
  const desc = profile.description || `${profile.company_name}${profile.category ? ` — ${profile.category}` : ""} on ClickCard.`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={shareUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:site_name" content="ClickCard" />
        {profile.logo_url && <meta property="og:image" content={profile.logo_url} />}
        <meta name="twitter:card" content={profile.logo_url ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        {profile.logo_url && <meta name="twitter:image" content={profile.logo_url} />}
      </Head>

      <BusinessShowcase profile={profile} ctaHref="/signup" />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug || "");
  const profile = await fetchPublicBusinessProfile(slug);
  const shareUrl = `${SITE_URL}/business/${slug}`;

  if (!profile) {
    ctx.res.statusCode = 404;
  }

  return { props: { profile, shareUrl } };
};
