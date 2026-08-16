import Link from "next/link";
import { AtSign, Camera, Video } from "lucide-react";
import { LOGIN_URL, PLANS_URL, WEBAPP_URL } from "@/lib/site";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Showcase", href: "/#showcase" },
      { label: "Pricing", href: "/pricing" },
      { label: "Sign up", href: WEBAPP_URL },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: LOGIN_URL },
      { label: "Dashboard", href: WEBAPP_URL },
      { label: "Billing", href: PLANS_URL },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "mailto:support@clickcard.app" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export default function FooterMega() {
  return (
    <footer data-nav-theme="dark" className="relative overflow-hidden bg-black px-4 pt-20 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-[22rem] w-[22rem] rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-[22rem] w-[22rem] rounded-full bg-yellow/15 blur-3xl"
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-white"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-base font-extrabold text-white">
                C
              </span>
              ClickCard
            </Link>
            <p className="mt-4 max-w-xs text-sm font-medium leading-relaxed text-white/45">
              One link for your whole identity — profile, card, resume, QR and
              storefront.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { Icon: Camera, label: "Photos" },
                { Icon: Video, label: "Videos" },
                { Icon: AtSign, label: "Socials" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/60 transition hover:border-primary hover:bg-primary hover:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-3 md:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) =>
                    l.href.startsWith("/") ? (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          className="inline-block text-sm font-semibold text-white/55 transition hover:translate-x-1 hover:text-white"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ) : (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          className="inline-block text-sm font-semibold text-white/55 transition hover:translate-x-1 hover:text-white"
                        >
                          {l.label}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs font-semibold text-white/30 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} ClickCard. All rights reserved.</p>
          <p>Made with &#10084; for people worth knowing.</p>
        </div>
      </div>

      {/* giant outlined wordmark */}
      <div aria-hidden className="pointer-events-none select-none text-center">
        <span className="stroke-word text-[19vw] font-extrabold leading-[0.78] tracking-tight">
          ClickCard
        </span>
      </div>
    </footer>
  );
}
