import type { CardTemplate } from "@/services/profileService";

/**
 * Digital business-card / visiting-card templates.
 *
 * Template ids are a contract with the backend renderer (CardTemplateService.js)
 * and with the client preview (CardPreview.tsx) — changing an `id` here
 * requires updating both. `swatch` only drives the little thumbnail in the
 * template picker and has no effect on the rendered card.
 */
export interface CardTemplateDef extends CardTemplate {
  /** 2–4 colour stops shown on the picker thumbnail. */
  swatch: string[];
}

export const CARD_TEMPLATES: CardTemplateDef[] = [
  {
    id: "wave-bold",
    name: "Wave Bold",
    description: "A flowing wave band across a bold colour field with elegant italic type — a statement visiting card.",
    swatch: ["#0B3B8C", "#F3DFC1"],
  },
  {
    id: "chevron-pattern",
    name: "Chevron Pattern",
    description: "Repeating chevron pattern band over bold caps type — graphic and playful.",
    swatch: ["#FFFFFF", "#F97316"],
  },
  {
    id: "geo-triangle",
    name: "Geo Triangle",
    description: "Diagonal triangle blocks framing a clean centered layout — sharp and modern.",
    swatch: ["#FACC15", "#F97316"],
  },
  {
    id: "floral-mandala",
    name: "Floral Mandala",
    description: "Ivory card with a hand-drawn-style mandala bloom — shows both the front and back faces in preview.",
    swatch: ["#FBF3E4", "#0E7C86", "#083F45"],
  },
];
