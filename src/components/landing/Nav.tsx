"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LOGIN_URL, WEBAPP_URL } from "@/lib/site";
import Img1 from "../../images/Untitled design (1).png";


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
        className={`mx-auto mt-4 flex max-w-5xl items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-300 ${
          scrolled
            ? "border-line bg-paper/80 shadow-soft backdrop-blur-xl"
            : "border-line bg-paper/50 backdrop-blur-md"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-dark"
        >
          <img src={Img1.src} alt="Clickcard logo" className="h-10" />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-subtle transition hover:bg-dark/5 hover:text-dark"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={LOGIN_URL}
            className="rounded-full px-4 py-2.5 text-sm font-bold text-dark transition hover:bg-dark/5"
          >
            Log in
          </a>
          <a href={WEBAPP_URL} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover">
            Join the Beta
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-dark/5 text-dark lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-5xl rounded-3xl border border-line bg-paper/95 p-4 shadow-soft-lg backdrop-blur-xl lg:hidden">
          <div className="flex flex-col">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-semibold text-dark transition hover:bg-dark/5"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex gap-3 border-t border-line pt-4">
            <a
              href={LOGIN_URL}
              className="flex-1 rounded-full border border-line px-4 py-3 text-center text-sm font-semibold text-dark transition hover:bg-dark/5"
            >
              Log in
            </a>
            <a
              href={WEBAPP_URL}
              className="flex-1 rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Join the Beta
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
