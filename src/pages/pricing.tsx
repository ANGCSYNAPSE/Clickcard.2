import Head from "next/head";
import Nav from "@/components/landing/Nav";
import Plans from "@/components/landing/Plans";
import BigCTA from "@/components/landing/BigCTA";
import FooterMega from "@/components/landing/FooterMega";

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>Pricing · ClickCard</title>
        <meta
          name="description"
          content="Simple, transparent pricing for ClickCard. Start free, upgrade to Pro or Business anytime."
        />
      </Head>
      <main className="relative bg-paper text-coal">
        <Nav />
        <div className="pt-20">
          <Plans />
        </div>
        <BigCTA />
        <FooterMega />
      </main>
    </>
  );
}
