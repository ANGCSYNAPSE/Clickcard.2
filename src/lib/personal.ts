import type { PersonalSection } from "@/types";

/** Prefixes the optional honorific (Mr., Dr., …) onto the full name for display. */
export function displayName(personal?: Pick<PersonalSection, "title" | "fullName"> | null, fallback = "Your name") {
  const name = personal?.fullName || fallback;
  return personal?.title ? `${personal.title} ${name}` : name;
}
