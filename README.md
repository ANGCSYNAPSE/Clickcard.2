# ClickCard — Marketing Website

The public **landing site** for ClickCard (one of three apps in this repo).
Open to everyone, SEO-friendly, no auth. Its CTAs deep-link into the **web app**.

> Sibling apps: [`../Clickcard_Web`](../Clickcard_Web) (the product/app) and
> `../admin-panel` (admin).

## Stack

Next.js 14 (Pages Router) · TypeScript · Tailwind CSS · framer-motion ·
lucide-react. Vibrant, Linktree-style theme.

## Linking to the web app

All "Log in" / "Get started" / pricing buttons point at the web app via
`NEXT_PUBLIC_WEB_URL` (see `src/lib/site.ts`). Copy `.env.example` → `.env.local`
and set it for your environment:

```
NEXT_PUBLIC_WEB_URL=http://localhost:3001   # web app dev URL
```

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

If `npm install` or the build fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`,
your network intercepts TLS — see the note in `../Clickcard_Web/README.md`.
Fonts are loaded browser-side (via `_document.tsx`) for the same reason.
