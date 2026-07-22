import Head from "next/head";
import Link from "next/link";
import { ArrowRight, Home, LifeBuoy, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { WEBAPP_URL, LOGIN_URL, PLANS_URL } from "@/lib/site";

const DESTINATIONS: { label: string; href: string; description: string }[] = [
  { label: "Sign in", href: LOGIN_URL, description: "Access your ClickCard" },
  { label: "Pricing", href: PLANS_URL, description: "Plans & verticals" },
  { label: "App dashboard", href: WEBAPP_URL, description: "Your portal" },
  { label: "Home", href: "/", description: "Back to the landing" },
];

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Page not found · ClickCard</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-mist px-4 py-16">
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-70" />
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-candy-pink/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto w-full max-w-2xl text-center"
        >
          <span className="inline-block rounded-full bg-white/70 px-4 py-1 text-xs font-black uppercase tracking-[0.18em] text-brand-700 shadow-soft backdrop-blur">
            404 · Not found
          </span>
          <h1 className="mt-6 font-display text-5xl font-black leading-[1.05] text-ink sm:text-6xl">
            Lost in the digital void
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-ink/60">
            The page you&apos;re looking for has vanished like a paper business
            card in the digital age.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-105"
            >
              <Home size={16} /> Go home
            </Link>
            <a
              href="mailto:support@clickcard.app"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-brand-100 bg-white px-6 py-3 text-sm font-bold text-ink transition hover:bg-brand-50"
            >
              <LifeBuoy size={16} /> Contact support
            </a>
          </div>

          <div className="mt-12">
            <p className="mb-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-ink/45">
              <Compass size={14} /> Popular destinations
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {DESTINATIONS.map((d) => (
                <Link
                  key={d.href}
                  href={d.href}
                  className="group flex items-center justify-between rounded-2xl bg-white p-4 text-left shadow-soft ring-1 ring-black/[0.03] transition hover:-translate-y-0.5 hover:shadow-card"
                >
                  <span>
                    <span className="block font-bold text-ink">{d.label}</span>
                    <span className="text-xs text-ink/55">{d.description}</span>
                  </span>
                  <ArrowRight
                    size={16}
                    className="text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-brand-500"
                  />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
