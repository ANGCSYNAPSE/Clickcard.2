import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Mail, Phone, Globe, MapPin } from "lucide-react";
import type { AwardItem, FullProfile, LanguageItem, ProjectItem } from "@/types";
import { CV_TEMPLATES } from "@/lib/cvTemplates";

type Icon = typeof Mail;

// A4 at 96dpi — true page proportions. The page never renders wider than
// this, but shrinks (preserving the exact aspect ratio) to fit whatever
// space its container actually has — the CV tab, the phone frame, the
// browser-preview frame — instead of overflowing and getting clipped.
export const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const PAGE_PADDING = 48;
const BLOCK_GAP = 16;

interface Block {
  key: string;
  node: ReactNode;
}

/** Tracks the rendered width of `ref`'s element, live, via ResizeObserver. */
function useMeasuredWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}

/**
 * Measures each content block off-screen, then packs them into as many
 * fixed-height A4 pages as needed — pages grow/shrink automatically as
 * experience/education entries are added, the font changes, or the
 * available width changes.
 */
function usePaginatedBlocks(blocks: Block[], contentHeight: number, signature: string) {
  const [pageKeys, setPageKeys] = useState<string[][]>([blocks.map((b) => b.key)]);
  const measureRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [fontsTick, setFontsTick] = useState(0);

  useLayoutEffect(() => {
    if (typeof document === "undefined" || !document.fonts?.ready) return;
    document.fonts.ready.then(() => setFontsTick((t) => t + 1));
  }, []);

  useLayoutEffect(() => {
    const heights = blocks.map((b) => measureRefs.current.get(b.key)?.offsetHeight ?? 0);
    const result: string[][] = [];
    let current: string[] = [];
    let used = 0;

    blocks.forEach((b, i) => {
      const h = heights[i];
      const addition = current.length ? h + BLOCK_GAP : h;
      if (used + addition > contentHeight && current.length > 0) {
        result.push(current);
        current = [b.key];
        used = h;
      } else {
        current.push(b.key);
        used += addition;
      }
    });
    if (current.length) result.push(current);
    setPageKeys(result.length ? result : [[]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, contentHeight, fontsTick, blocks.length]);

  return { pageKeys, measureRefs };
}

function HeaderBlock({
  fullName,
  tagline,
  contactItems,
  headingColor,
  subtleColor,
  centered,
  contactBarColor,
  contactBarTextColor,
}: {
  fullName: string;
  tagline?: string;
  contactItems: { icon: Icon; label: string }[];
  headingColor: string;
  subtleColor: string;
  centered?: boolean;
  /** When set, contact info renders as a solid strip instead of a plain inline row (Classic Orange). */
  contactBarColor?: string;
  contactBarTextColor?: string;
}) {
  const hasBar = Boolean(contactBarColor);
  return (
    <div className={hasBar ? (centered ? "text-center" : "") : "border-b pb-4"} style={hasBar ? undefined : { borderColor: `${headingColor}33` }}>
      <h1 className="font-display text-2xl font-black" style={{ color: headingColor }}>
        {fullName}
      </h1>
      {tagline && (
        <p className="mt-1 text-sm font-semibold uppercase tracking-wide" style={{ color: subtleColor }}>
          {tagline}
        </p>
      )}
      {contactItems.length > 0 &&
        (hasBar ? (
          <div
            className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 rounded-md px-4 py-2.5 text-[11px] font-bold"
            style={{ background: contactBarColor, color: contactBarTextColor }}
          >
            {contactItems.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <item.icon size={12} />
                {item.label}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px]" style={{ color: subtleColor }}>
            {contactItems.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                <item.icon size={11} />
                {item.label}
              </span>
            ))}
          </div>
        ))}
    </div>
  );
}

function dateRange(start?: string, end?: string, current?: boolean) {
  return [start, current ? "Present" : end].filter(Boolean).join(" – ");
}

/** A section heading rendered once per section (only shown on the section's first item). */
function SectionHeading({ children, color }: { children: ReactNode; color: string }) {
  return (
    <h2 className="mb-2 text-[11px] font-black uppercase tracking-wider" style={{ color }}>
      {children}
    </h2>
  );
}

export default function ResumePreview({
  profile,
  primary,
  accent,
  fontFamily,
  textColor,
  skills,
  projects,
  awards,
  languages,
  templateId,
}: {
  profile: FullProfile;
  primary: string;
  accent: string;
  fontFamily?: string;
  /** Overrides the default body text colour when set. */
  textColor?: string;
  skills?: string[];
  projects?: ProjectItem[];
  awards?: AwardItem[];
  languages?: LanguageItem[];
  /** CV template id (@/lib/cvTemplates) — changes colours, the contact bar, section grids, and section order. */
  templateId?: string;
}) {
  const p = profile.personal || {};
  const c = profile.contact || {};
  const experience = profile.experience || [];
  const education = profile.education || [];
  const fg = textColor || "#0b2e2b";
  const fullName = p.fullName || "Your name";

  const tpl = CV_TEMPLATES.find((t) => t.id === templateId);
  // Template colours override the palette-driven defaults when a template
  // is selected; with none selected this renders exactly as it always has.
  const pageBg = tpl?.colors.background || "#ffffff";
  const headingColor = tpl?.colors.heading || primary;
  const bodyFg = tpl ? tpl.colors.text : fg;
  const subtleFg = tpl ? tpl.colors.subtleText : `${fg}80`;
  const cols = tpl?.layout.sectionColumns;

  const { ref: containerRef, width: containerWidth } = useMeasuredWidth<HTMLDivElement>(PAGE_WIDTH);

  // Shrink (never grow) to fit the container, keeping the exact A4 aspect
  // ratio and proportional margins so it always reads as a real page.
  const pageWidth = Math.min(PAGE_WIDTH, containerWidth || PAGE_WIDTH);
  const pageHeight = pageWidth * (PAGE_HEIGHT / PAGE_WIDTH);
  const pagePadding = pageWidth * (PAGE_PADDING / PAGE_WIDTH);
  const contentHeight = pageHeight - pagePadding * 2;

  const contactItems = (
    [
      c.email && { icon: Mail, label: c.email },
      c.phone && { icon: Phone, label: c.phone },
      c.website && { icon: Globe, label: c.website },
      (c.city || c.country) && { icon: MapPin, label: [c.city, c.country].filter(Boolean).join(", ") },
    ].filter(Boolean) as { icon: Icon; label: string }[]
  );

  const blocks: Block[] = useMemo(() => {
    const header: Block = {
      key: "header",
      node: (
        <HeaderBlock
          fullName={fullName}
          tagline={p.tagline}
          contactItems={contactItems}
          headingColor={headingColor}
          subtleColor={subtleFg}
          centered={tpl?.layout.headerStyle === "centered"}
          contactBarColor={tpl?.layout.contactBar ? tpl.colors.accentBar : undefined}
          contactBarTextColor={tpl?.colors.accentBarText}
        />
      ),
    };

    const summaryBlocks: Block[] = p.bio
      ? [
          {
            key: "summary",
            node: (
              <div>
                <SectionHeading color={headingColor}>Summary</SectionHeading>
                <p className="text-xs leading-relaxed" style={{ color: bodyFg }}>
                  {p.bio}
                </p>
              </div>
            ),
          },
        ]
      : [];

    const skillsBlocks: Block[] =
      skills && skills.length > 0
        ? [
            {
              key: "skills",
              node: (
                <div>
                  <SectionHeading color={headingColor}>Skills</SectionHeading>
                  {cols?.skills && cols.skills > 1 ? (
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols.skills}, minmax(0, 1fr))` }}>
                      {skills.map((s, i) => (
                        <span
                          key={i}
                          className="truncate rounded-md px-2 py-1.5 text-center text-[10px] font-bold"
                          style={{ color: bodyFg, background: `${headingColor}14` }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s, i) => (
                        <span key={i} className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ color: subtleFg }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ),
            },
          ]
        : [];

    const experienceBlocks: Block[] = experience.map((e, i) => ({
      key: `exp-${e.id || i}`,
      node: (
        <div>
          {i === 0 && <SectionHeading color={headingColor}>Experience</SectionHeading>}
          <div className="flex items-baseline justify-between gap-2">
            <p className="min-w-0 flex-1 truncate text-xs font-bold" style={{ color: bodyFg }}>
              {e.role || "Role"}
              {e.company ? ` · ${e.company}` : ""}
            </p>
            <p className="shrink-0 whitespace-nowrap text-[10px]" style={{ color: subtleFg }}>
              {dateRange(e.startDate, e.endDate, e.current)}
            </p>
          </div>
          {e.location && (
            <p className="text-[10px]" style={{ color: subtleFg }}>
              {e.location}
            </p>
          )}
          {e.description && (
            <p className="mt-1 text-[11px] leading-relaxed" style={{ color: bodyFg }}>
              {e.description}
            </p>
          )}
        </div>
      ),
    }));

    // Project entry — reused both stacked (default, one block per entry) and
    // inside a multi-column grid (a template with otherActivities > 1).
    const projectItem = (proj: ProjectItem) => (
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-xs font-bold" style={{ color: bodyFg }}>
            {proj.name || "Project"}
            {proj.role ? ` · ${proj.role}` : ""}
          </p>
          <p className="shrink-0 whitespace-nowrap text-[10px]" style={{ color: subtleFg }}>
            {dateRange(proj.startDate, proj.endDate)}
          </p>
        </div>
        {proj.link && (
          <p className="text-[10px]" style={{ color: accent }}>
            {proj.link}
          </p>
        )}
        {proj.description && (
          <p className="mt-1 text-[11px] leading-relaxed" style={{ color: bodyFg }}>
            {proj.description}
          </p>
        )}
      </div>
    );
    const projectHeading = tpl ? "Other Activities & Projects" : "Projects";
    const projectBlocks: Block[] =
      !projects || projects.length === 0
        ? []
        : cols?.otherActivities && cols.otherActivities > 1 && projects.length > 1
        ? [
            {
              key: "projects",
              node: (
                <div>
                  <SectionHeading color={headingColor}>{projectHeading}</SectionHeading>
                  <div className="grid gap-x-6 gap-y-3" style={{ gridTemplateColumns: `repeat(${cols.otherActivities}, minmax(0, 1fr))` }}>
                    {projects.map((proj, i) => (
                      <div key={proj.id || i}>{projectItem(proj)}</div>
                    ))}
                  </div>
                </div>
              ),
            },
          ]
        : projects.map((proj, i) => ({
            key: `proj-${proj.id || i}`,
            node: (
              <div>
                {i === 0 && <SectionHeading color={headingColor}>{projectHeading}</SectionHeading>}
                {projectItem(proj)}
              </div>
            ),
          }));

    // Education entry — reused stacked or in a multi-column grid.
    const educationItem = (ed: (typeof education)[number]) => (
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-xs font-bold" style={{ color: bodyFg }}>
            {ed.degree ? `${ed.degree}${ed.field ? `, ${ed.field}` : ""}` : ed.institution}
          </p>
          <p className="shrink-0 whitespace-nowrap text-[10px]" style={{ color: subtleFg }}>
            {dateRange(ed.startYear, ed.endYear)}
          </p>
        </div>
        {ed.degree && (
          <p className="text-[10px]" style={{ color: subtleFg }}>
            {ed.institution}
          </p>
        )}
        {ed.description && (
          <p className="mt-1 text-[11px] leading-relaxed" style={{ color: bodyFg }}>
            {ed.description}
          </p>
        )}
      </div>
    );
    const educationBlocks: Block[] =
      education.length === 0
        ? []
        : cols?.education && cols.education > 1 && education.length > 1
        ? [
            {
              key: "education",
              node: (
                <div>
                  <SectionHeading color={headingColor}>Education</SectionHeading>
                  <div className="grid gap-x-6 gap-y-3" style={{ gridTemplateColumns: `repeat(${cols.education}, minmax(0, 1fr))` }}>
                    {education.map((ed, i) => (
                      <div key={ed.id || i}>{educationItem(ed)}</div>
                    ))}
                  </div>
                </div>
              ),
            },
          ]
        : education.map((ed, i) => ({
            key: `edu-${ed.id || i}`,
            node: (
              <div>
                {i === 0 && <SectionHeading color={headingColor}>Education</SectionHeading>}
                {educationItem(ed)}
              </div>
            ),
          }));

    const awardsBlocks: Block[] =
      awards && awards.length > 0
        ? [
            {
              key: "awards",
              node: (
                <div>
                  <SectionHeading color={headingColor}>Awards</SectionHeading>
                  <div
                    className="grid gap-x-6 gap-y-3"
                    style={{ gridTemplateColumns: `repeat(${cols?.awards && cols.awards > 1 ? cols.awards : 1}, minmax(0, 1fr))` }}
                  >
                    {awards.map((a, i) => (
                      <div key={a.id || i}>
                        <p className="text-xs font-bold" style={{ color: bodyFg }}>
                          {a.title}
                        </p>
                        {a.description && (
                          <p className="mt-0.5 text-[10px] leading-relaxed" style={{ color: subtleFg }}>
                            {a.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            },
          ]
        : [];

    const languagesBlocks: Block[] =
      languages && languages.length > 0
        ? [
            {
              key: "languages",
              node: (
                <div>
                  <SectionHeading color={headingColor}>Languages</SectionHeading>
                  <div
                    className="grid gap-x-6 gap-y-3"
                    style={{ gridTemplateColumns: `repeat(${cols?.languages && cols.languages > 1 ? cols.languages : 1}, minmax(0, 1fr))` }}
                  >
                    {languages.map((l, i) => (
                      <div key={l.id || i}>
                        <p className="text-xs font-bold" style={{ color: bodyFg }}>
                          {l.name}
                        </p>
                        {l.level && (
                          <p className="mt-0.5 text-[10px] leading-relaxed" style={{ color: subtleFg }}>
                            {l.level}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            },
          ]
        : [];

    const sectionMap: Record<string, Block[]> = {
      skills: skillsBlocks,
      education: educationBlocks,
      experience: experienceBlocks,
      otherActivities: projectBlocks,
      awards: awardsBlocks,
      languages: languagesBlocks,
    };
    const order = tpl?.layout.sectionOrder ?? ["skills", "experience", "otherActivities", "education"];
    const orderedSections = order.flatMap((key) => sectionMap[key] ?? []);

    const list = [header, ...summaryBlocks, ...orderedSections];

    if (list.length === 1) {
      list.push({
        key: "empty",
        node: (
          <p className="mt-2 text-center text-xs" style={{ color: `${fg}66` }}>
            Add a bio, experience and education to see your resume take shape here.
          </p>
        ),
      });
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fullName,
    p.tagline,
    p.bio,
    JSON.stringify(c),
    JSON.stringify(experience),
    JSON.stringify(education),
    JSON.stringify(skills),
    JSON.stringify(projects),
    JSON.stringify(awards),
    JSON.stringify(languages),
    primary,
    accent,
    fg,
    tpl,
    headingColor,
    bodyFg,
    subtleFg,
    cols,
  ]);

  const signature = useMemo(
    () => JSON.stringify({ n: blocks.map((b) => b.key), fontFamily, fg, primary, accent, pageWidth, templateId }),
    [blocks, fontFamily, fg, primary, accent, pageWidth, templateId],
  );

  const { pageKeys, measureRefs } = usePaginatedBlocks(blocks, contentHeight, signature);
  const blockMap = useMemo(() => new Map(blocks.map((b) => [b.key, b.node])), [blocks]);

  const sharedStyle: CSSProperties = {
    color: bodyFg,
    fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : undefined,
  };

  return (
    <div ref={containerRef} className="flex w-full flex-col items-center gap-6">
      {/* Off-screen measurement pass — invisible, same width as a real page's content area */}
      <div
        aria-hidden
        className="break-words"
        style={{ position: "absolute", top: -99999, left: -99999, width: pageWidth - pagePadding * 2, ...sharedStyle }}
      >
        {blocks.map((b) => (
          <div
            key={b.key}
            ref={(el) => {
              if (el) measureRefs.current.set(b.key, el);
            }}
          >
            {b.node}
          </div>
        ))}
      </div>

      {pageKeys.map((keys, pageIndex) => (
        <div
          key={pageIndex}
          data-cv-page
          className="shrink-0 overflow-hidden rounded-lg break-words"
          style={{
            width: pageWidth,
            minHeight: pageHeight,
            padding: pagePadding,
            background: pageBg,
            ...sharedStyle,
          }}
        >
          <div className="space-y-4">{keys.map((k) => <div key={k}>{blockMap.get(k)}</div>)}</div>
          {pageKeys.length > 1 && (
            <div className="mt-6 text-center text-[10px]" style={{ color: `${bodyFg}88` }}>
              Page {pageIndex + 1} of {pageKeys.length}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
