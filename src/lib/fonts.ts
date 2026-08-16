export interface FontItem {
  name: string;
  pro?: boolean;
}

export const FONT_ITEMS: FontItem[] = [
  { name: "Albert Sans" },
  { name: "Alfa Slab One", pro: true },
  { name: "Anton", pro: true },
  { name: "Belanosima", pro: true },
  { name: "BioRhyme", pro: true },
  { name: "Black Han Sans" },
  { name: "Bitter", pro: true },
  { name: "Bricolage Grotesque", pro: true },
  { name: "Caudex" },
  { name: "Caveat" },
  { name: "Chango", pro: true },
  { name: "Chillax" },
  { name: "Corben" },
  { name: "Dancing Script", pro: true },
  { name: "DM Sans" },
  { name: "Domine" },
  { name: "Epilogue" },
  { name: "Fira Code" },
  { name: "Fustat" },
  { name: "Gasoek One", pro: true },
  { name: "Great Vibes" },
  { name: "Hahmlet" },
  { name: "IBM Plex Sans" },
  { name: "IBM Plex Serif", pro: true },
  { name: "Inter" },
  { name: "JetBrains Mono" },
  { name: "Kaushan Script" },
  { name: "Kavivanar" },
  { name: "Lato", pro: true },
  { name: "Link Sans" },
  { name: "Lobster" },
  { name: "Lora", pro: true },
  { name: "M Plus Rounded", pro: true },
  { name: "Manrope" },
  { name: "Merriweather", pro: true },
  { name: "Misto" },
  { name: "Monofett", pro: true },
  { name: "Noto Serif", pro: true },
  { name: "Old Standard TT", pro: true },
  { name: "Oswald" },
  { name: "Oxanium" },
  { name: "Pacifico", pro: true },
  { name: "Playfair Display" },
  { name: "Poppins", pro: true },
  { name: "PT Serif", pro: true },
  { name: "Red Hat Display" },
  { name: "Roboto", pro: true },
  { name: "Roboto Slab" },
  { name: "Rubik", pro: true },
  { name: "Salsa", pro: true },
  { name: "Satisfy" },
  { name: "Sonder" },
  { name: "Space Grotesk", pro: true },
  { name: "Space Mono" },
  { name: "Summer Glow", pro: true },
  { name: "Syne", pro: true },
];

export const FONT_OPTIONS = FONT_ITEMS.map((f) => f.name);

export function loadGoogleFont(font: string) {
  if (!font || typeof document === "undefined") return;
  const id = `gf-${font.replace(/ /g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}&display=swap`;
  document.head.appendChild(link);
}
