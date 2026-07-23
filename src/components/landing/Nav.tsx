"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LOGIN_URL, WEBAPP_URL } from "@/lib/site";

const LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Showcase", href: "/#showcase" },
  { label: "Wall of love", href: "/#love" },
  { label: "Pricing", href: "/pricing" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-300 ${
          scrolled
            ? "border border-line bg-white/85 shadow-soft backdrop-blur-xl"
            : "border border-transparent bg-transparent"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-dark"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-base font-extrabold text-dark">
            C
          </span>
          ClickCard
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-subtle transition hover:bg-paper-tint hover:text-dark"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={LOGIN_URL}
            className="rounded-full px-4 py-2.5 text-sm font-bold text-dark transition hover:bg-paper-tint"
          >
            Log in
          </a>
          <a href={WEBAPP_URL} className="btn btn-primary px-5 py-2.5 text-sm">
            Sign up free
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-dark md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-card border border-line bg-white p-4 shadow-soft md:hidden">
          <div className="flex flex-col">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-semibold text-dark transition hover:bg-paper-tint"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex gap-3 border-t border-line pt-4">
            <a
              href={LOGIN_URL}
              className="btn btn-outline flex-1 px-4 py-3 text-sm"
            >
              Log in
            </a>
            <a
              href={WEBAPP_URL}
              className="btn btn-primary flex-1 px-4 py-3 text-sm"
            >
              Sign up free
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
