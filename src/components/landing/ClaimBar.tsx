"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { WEBAPP_URL } from "@/lib/site";

type Props = { variant?: "light" | "dark" };

export default function ClaimBar({ variant = "light" }: Props) {
  const [name, setName] = useState("");
  const onDark = variant === "dark";

  const claim = () => {
    const handle = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    window.location.href = handle
      ? `${WEBAPP_URL}?username=${encodeURIComponent(handle)}`
      : WEBAPP_URL;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        claim();
      }}
      className={`flex w-full max-w-lg items-center gap-2 rounded-full p-2 min-w-0 ${
        onDark
          ? "border border-white/15 bg-white/10 backdrop-blur"
          : "border border-line bg-white shadow-soft"
      }`}
    >
      <label className="flex min-w-0 flex-1 cursor-text items-center pl-4">
        <span
          className={`shrink-0 text-sm font-semibold sm:text-base ${
            onDark ? "text-white/50" : "text-muted"
          }`}
        >
          clickcard/
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="yourname"
          aria-label="Claim your ClickCard handle"
          className={`min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none sm:text-base ${
            onDark
              ? "text-white placeholder:text-white/35"
              : "text-dark placeholder:text-muted/60"
          }`}
        />
      </label>
      <button
        type="submit"
        className={`btn group shrink-0 px-4 py-3 text-sm sm:px-6 sm:py-3.5 ${
          onDark ? "btn-accent" : "btn-secondary"
        }`}
      >
        Claim it
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}
