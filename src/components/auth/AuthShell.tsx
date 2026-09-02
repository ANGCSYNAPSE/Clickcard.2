import { motion } from "framer-motion";
import { CreditCard, ShieldCheck, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";

const PERKS = [
  {
    icon: Zap,
    tint: "bg-brand-500",
    wash: "bg-brand-500/10 dark:bg-brand-500/15",
    lead: "Claim ",
    accent: "clickcard.app/you",
    accentClass: "text-brand-500",
    tail: " in seconds",
  },
  {
    icon: CreditCard,
    tint: "bg-candy-yellow",
    wash: "bg-candy-yellow/20 dark:bg-candy-yellow/15",
    lead: "Design cards, resumes & QR in the ",
    accent: "Studio",
    accentClass: "text-brand-500",
    tail: "",
  },
  {
    icon: ShieldCheck,
    tint: "bg-candy-pink",
    wash: "bg-candy-pink/10 dark:bg-candy-pink/20",
    lead: "Passwordless, ",
    accent: "secure",
    accentClass: "text-candy-pink",
    tail: " email OTP login",
  },
];

/** Split-screen auth layout: cream brand panel + clean form panel. */
export default function AuthShell({
  title,
  subtitle,
  children,
  onBack,
  navLink,
  pageLabel,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** If provided, renders a ← back button in the top-left of the form panel */
  onBack?: () => void;
  /** If provided, renders a contextual link (e.g. "Log in" / "Sign up") in the top-right */
  navLink?: { label: string; href: string };
  /** Small eyebrow label rendered above the h1 (e.g. "Log In", "Sign Up") */
  pageLabel?: string;
}) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-[#1a1a1a]">
      {/* brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-mist dark:bg-[#0e3a36] lg:block">
        {/* Decorative corner shapes. Anchored bottom-right: the panel's copy
            (headline, perks, copyright) is all left-aligned, so the right corner
            is the only spot where they don't sit under text. */}
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-candy-pink" />
        <div className="pointer-events-none absolute -bottom-16 right-20 h-48 w-48 rounded-full bg-candy-yellow" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16 2xl:p-20">
          <Logo href="/" solid />

          <div className="py-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-[2.6rem] font-black leading-[1.08] tracking-tight text-ink dark:text-white xl:text-[3.25rem] 2xl:text-[3.75rem]"
            >
              One link for your
              <br />
              whole{" "}
              <span className="relative inline-block text-candy-pink">
                identity.
                <svg
                  aria-hidden
                  viewBox="0 0 180 12"
                  className="absolute -bottom-1 left-0 h-2.5 w-full"
                  fill="none"
                >
                  <path
                    d="M2 8C18 4 34 4 50 7"
                    stroke="#BE5103"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M60 8C76 4 92 4 108 7"
                    stroke="#FFCE1B"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M118 8C134 4 150 4 166 7"
                    stroke="#069494"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h2>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/60 dark:text-white/60 xl:max-w-md xl:text-base 2xl:max-w-lg 2xl:text-lg">
              Profile, digital card, resume, QR & analytics — beautifully
              shareable.
            </p>

            <div className="mt-8 max-w-sm space-y-3 xl:mt-10 xl:max-w-md xl:space-y-4 2xl:max-w-lg">
              {PERKS.map((p, i) => (
                <motion.div
                  key={p.accent}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i + 0.2 }}
                  className={`flex items-center gap-3 rounded-2xl p-3 xl:gap-4 xl:p-4 ${p.wash}`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white xl:h-11 xl:w-11 ${p.tint}`}
                  >
                    <p.icon size={17} />
                  </span>
                  <span className="text-[13px] font-semibold text-ink/80 dark:text-white/80 xl:text-[15px]">
                    {p.lead}
                    <span className={`font-bold ${p.accentClass}`}>
                      {p.accent}
                    </span>
                    {p.tail}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-ink/40 dark:text-white/40">
            © {new Date().getFullYear()} ClickCard. Crafted with care.
          </p>
        </div>
      </div>

      {/* form panel */}
      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden px-5 py-10 sm:px-10">
        {/* Decorative corner blocks. Only shown when the viewport is tall enough
            that the vertically-centred form can't reach them — below ~900px the
            signup form's submit button lands on top of these. */}
        <div className="pointer-events-none absolute bottom-0 right-0 hidden select-none [@media(min-width:640px)_and_(min-height:900px)]:block">
          <div className="h-[104px] w-[176px] rounded-tl-full bg-candy-pink" />
          <div className="flex">
            <div className="h-[100px] w-[88px] bg-candy-yellow" />
            <div className="h-[100px] w-[88px] bg-brand-500" />
          </div>
        </div>

        {/* Back button — top-left */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink/60 transition hover:bg-ink/5 hover:text-ink dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}

        {/* Top-right: nav link + theme toggle */}
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          {/* {navLink && (
            <Link
              href={navLink.href}
              className="rounded-xl px-4 py-2 text-sm font-bold text-brand-500 transition hover:bg-brand-50 dark:hover:bg-brand-500/10"
            >
              {navLink.label}
            </Link>
          )} */}
          <ThemeToggle />
        </div>



        <div className="relative z-10 w-full max-w-md lg:max-w-lg 2xl:max-w-xl">
          <div className="mb-8 lg:hidden">
            <Logo href="/" solid />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {pageLabel && (
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink/40 dark:text-white/40">
                {pageLabel}
              </p>
            )}
            <h1 className="font-display text-3xl font-black tracking-tight text-ink dark:text-white lg:text-4xl 2xl:text-[2.75rem]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-ink/60 dark:text-white/60 lg:text-base">
                {subtitle}
              </p>
            )}
            <div className="mt-7 lg:mt-9">{children}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
