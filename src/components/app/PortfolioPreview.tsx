import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import type { FullProfile, ProjectItem, SocialLink } from "@/types";
import { getSocialIcon } from "@/lib/socialPlatforms";

/**
 * A short, single-page portfolio document — Name, Role, About Me, Skills,
 * Experience, Selected Projects, Education, Contact, in that order. Reuses
 * the same profile/experience/education/skills/projects data as the CV, just
 * laid out as a plain scrolling document rather than a paginated A4 sheet.
 */
export default function PortfolioPreview({
  profile,
  primary,
  accent,
  fontFamily,
  textColor,
  skills,
  projects,
  socialLinks,
}: {
  profile: FullProfile;
  primary: string;
  accent: string;
  fontFamily?: string;
  /** Overrides the default body text colour when set. */
  textColor?: string;
  skills?: string[];
  projects?: ProjectItem[];
  /**
   * Portfolio-only social links — kept separate from profile.social so
   * editing them here doesn't change the Share page or public profile.
   */
  socialLinks?: SocialLink[];
}) {
  const p = profile.personal || {};
  const c = profile.contact || {};
  const experience = profile.experience || [];
  const education = profile.education || [];
  const social = (socialLinks || []).filter((s) => s.url);
  const linkedin = social.find((s) => s.platform.toLowerCase() === "linkedin");
  const github = social.find((s) => s.platform.toLowerCase() === "github");
  const otherSocial = social.filter((s) => s !== linkedin && s !== github);
  const hasContactInfo = Boolean(c.email || c.phone || c.city || c.country || c.website) || social.length > 0;
  const fg = textColor || "#0b2e2b";
  const fullName = p.fullName || "Your name";

  const dateRange = (start?: string, end?: string, current?: boolean) =>
    [start, current ? "Present" : end].filter(Boolean).join(" – ");

  const hasContent =
    Boolean(p.bio) ||
    (skills?.length ?? 0) > 0 ||
    experience.length > 0 ||
    (projects?.length ?? 0) > 0 ||
    education.length > 0;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mt-6 first:mt-0">
      <h2 className="text-xs font-black uppercase tracking-wider" style={{ color: primary }}>
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );

  return (
    <div
      className="w-full overflow-hidden rounded-2xl bg-white p-8 break-words"
      style={{
        color: fg,
        fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : undefined,
        // boxShadow: "0 30px 60px -20px rgba(11,46,43,0.22)",
      }}
    >
      {/* Name + Role */}
      <h1 className="font-display text-3xl font-black" style={{ color: primary }}>
        {fullName}
      </h1>
      {p.tagline && (
        <p className="mt-1 text-base font-semibold" style={{ color: accent }}>
          {p.tagline}
        </p>
      )}

      {p.bio && (
        <Section title="About Me">
          <p className="text-sm leading-relaxed" style={{ color: `${fg}cc` }}>
            {p.bio}
          </p>
        </Section>
      )}

      {skills && skills.length > 0 && (
        <Section title="Skills">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
            {skills.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: primary }} />
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-4">
            {experience.map((e, i) => (
              <div key={e.id || i}>
                <p className="text-sm font-bold">
                  {e.company || "Company"}
                  {e.role ? ` — ${e.role}` : ""}
                </p>
                <p className="text-xs" style={{ color: `${fg}80` }}>
                  {dateRange(e.startDate, e.endDate, e.current)}
                </p>
                {e.description && (
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: `${fg}cc` }}>
                    {e.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {projects && projects.length > 0 && (
        <Section title="Selected Projects">
          <div className="space-y-4">
            {projects.map((proj, i) => (
              <div key={proj.id || i}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-bold">
                    {proj.name || "Project"}
                    {proj.role ? ` · ${proj.role}` : ""}
                  </p>
                  <p className="shrink-0 text-xs" style={{ color: `${fg}80` }}>
                    {dateRange(proj.startDate, proj.endDate)}
                  </p>
                </div>
                {proj.description && (
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: `${fg}cc` }}>
                    {proj.description}
                  </p>
                )}
                {proj.link && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold" style={{ color: accent }}>
                    <ExternalLink size={11} className="shrink-0" />
                    {proj.link}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          <div className="space-y-2">
            {education.map((ed, i) => (
              <div key={ed.id || i}>
                <p className="text-sm font-bold">
                  {ed.degree ? `${ed.degree}${ed.field ? `, ${ed.field}` : ""}` : "Degree"}
                  {ed.institution ? ` — ${ed.institution}` : ""}
                </p>
                <p className="text-xs" style={{ color: `${fg}80` }}>
                  {dateRange(ed.startYear, ed.endYear)}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {hasContactInfo && (
        <Section title="Contact">
          <div className="space-y-1.5 text-sm">
            {c.email && (
              <p className="flex items-center gap-2">
                <Mail size={14} style={{ color: primary }} />
                {c.email}
              </p>
            )}
            {c.phone && (
              <p className="flex items-center gap-2">
                <Phone size={14} style={{ color: primary }} />
                {c.phone}
              </p>
            )}
            {(c.city || c.country) && (
              <p className="flex items-center gap-2">
                <MapPin size={14} style={{ color: primary }} />
                {[c.city, c.country].filter(Boolean).join(", ")}
              </p>
            )}
            {(linkedin || c.website) && (
              <p className="flex items-center gap-2">
                <ExternalLink size={14} style={{ color: primary }} />
                {linkedin ? linkedin.url : c.website}
              </p>
            )}
            {github && (
              <p className="flex items-center gap-2">
                {(() => {
                  const GithubIcon = getSocialIcon("GitHub");
                  return <GithubIcon size={14} style={{ color: primary }} />;
                })()}
                {github.url}
              </p>
            )}
            {otherSocial.map((s, i) => {
              const SIcon = getSocialIcon(s.platform);
              return (
                <p key={i} className="flex items-center gap-2">
                  <SIcon size={14} style={{ color: primary }} />
                  {s.url}
                </p>
              );
            })}
          </div>
        </Section>
      )}

      {!hasContent && (
        <p className="mt-6 text-center text-xs" style={{ color: `${fg}66` }}>
          Add a bio, skills, experience and a project or two to see your portfolio take shape here.
        </p>
      )}
    </div>
  );
}
