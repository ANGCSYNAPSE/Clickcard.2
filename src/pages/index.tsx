import Head from "next/head";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import BentoGrid from "@/components/landing/BentoGrid";
import ShowcaseBlocks from "@/components/landing/ShowcaseBlocks";
import Audiences from "@/components/landing/Audiences";
import Wall from "@/components/landing/Wall";
import BigCTA from "@/components/landing/BigCTA";
import FooterMega from "@/components/landing/FooterMega";

const TITLE = "ClickCard — One link for your whole identity";
const DESC =
  "ClickCard turns your identity into one beautiful, shareable link. Build a digital profile, branded business card, resume & QR — share anywhere in seconds.";

export default function Home() {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESC} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ClickCard" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main className="relative bg-paper text-dark">
        <Nav />
        <Hero />
        {/* <Marquee /> */}
        <BentoGrid />
        <ShowcaseBlocks />
        <Audiences />
        <Wall />
        <BigCTA />
        <FooterMega />
      </main>
    </>
  );
}
