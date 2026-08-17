import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Mail, Phone, Globe, MapPin } from "lucide-react";
import type { FullProfile, ProjectItem } from "@/types";

type Icon = typeof Mail;

// A4 at 96dpi — true page proportions so what you see here matches print/PDF.
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const PAGE_PADDING = 48;
const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PADDING * 2;
const BLOCK_GAP = 16;

interface Block {
  key: string;
  node: ReactNode;
}

/**
 * Measures each content block off-screen, then packs them into as many
 * fixed-height A4 pages as needed — pages grow/shrink automatically as
 * experience/education entries are added or the font changes.
 */
function usePaginatedBlocks(blocks: Block[], signature: string) {
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
      if (used + addition > CONTENT_HEIGHT && current.length > 0) {
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
  }, [signature, fontsTick, blocks.length]);

  return { pageKeys, measureRefs };
}

function HeaderBlock({
  fullName,
  tagline,
  contactItems,
  primary,
  accent,
  fg,
}: {
  fullName: string;
  tagline?: string;
  contactItems: { icon: Icon; label: string }[];
  primary: string;
  accent: string;
  fg: string;
}) {
  return (
    <div className="border-b pb-4" style={{ borderColor: `${primary}33` }}>
      <h1 className="font-display text-2xl font-black" style={{ color: primary }}>
        {fullName}
      </h1>
      {tagline && (
        <p className="mt-1 text-sm font-semibold" style={{ color: accent }}>
          {tagline}
        </p>
      )}
      {contactItems.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px]" style={{ color: `${fg}99` }}>
          {contactItems.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              <item.icon size={11} />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function dateRange(start?: string, end?: string, current?: boolean) {
  return [start, current ? "Present" : end].filter(Boolean).join(" – ");
}

export default function ResumePreview({
  profile,
  primary,
  accent,
  fontFamily,
  textColor,
  skills,
  projects,
}: {
  profile: FullProfile;
  primary: string;
  accent: string;
  fontFamily?: string;
  /** Overrides the default body text colour when set. */
  textColor?: string;
  skills?: string[];
  projects?: ProjectItem[];
}) {
  const p = profile.personal || {};
  const c = profile.contact || {};
  const experience = profile.experience || [];
  const education = profile.education || [];
  const fg = textColor || "#0b2e2b";
  const fullName = p.fullName || "Your name";

  const contactItems = (
    [
      c.email && { icon: Mail, label: c.email },
      c.phone && { icon: Phone, label: c.phone },
      c.website && { icon: Globe, label: c.website },
      (c.city || c.country) && { icon: MapPin, label: [c.city, c.country].filter(Boolean).join(", ") },
    ].filter(Boolean) as { icon: Icon; label: string }[]
  );

  const blocks: Block[] = useMemo(() => {
    const list: Block[] = [
      {
        key: "header",
        node: (
          <HeaderBlock
            fullName={fullName}
            tagline={p.tagline}
            contactItems={contactItems}
            primary={primary}
            accent={accent}
            fg={fg}
          />
        ),
      },
    ];

    if (p.bio) {
      list.push({
        key: "summary",
        node: (
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-wider" style={{ color: primary }}>
              Summary
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed" style={{ color: `${fg}cc` }}>
              {p.bio}
            </p>
          </div>
        ),
      });
    }

    if (skills && skills.length > 0) {
      list.push({
        key: "skills",
        node: (
          <div>
            <h2 className="mb-2 text-[11px] font-black uppercase tracking-wider" style={{ color: primary }}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                  style={{ background: `${primary}1a`, color: primary }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ),
      });
    }

    experience.forEach((e, i) => {
      list.push({
        key: `exp-${e.id || i}`,
        node: (
          <div>
            {i === 0 && (
              <h2 className="mb-2 text-[11px] font-black uppercase tracking-wider" style={{ color: primary }}>
                Experience
              </h2>
            )}
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs font-bold">
                {e.role || "Role"}
                {e.company ? ` · ${e.company}` : ""}
              </p>
              <p className="shrink-0 text-[10px]" style={{ color: `${fg}80` }}>
                {dateRange(e.startDate, e.endDate, e.current)}
              </p>
            </div>
            {e.location && (
              <p className="text-[10px]" style={{ color: `${fg}80` }}>
                {e.location}
              </p>
            )}
            {e.description && (
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: `${fg}cc` }}>
                {e.description}
              </p>
            )}
          </div>
        ),
      });
    });

    (projects || []).forEach((proj, i) => {
      list.push({
        key: `proj-${proj.id || i}`,
        node: (
          <div>
            {i === 0 && (
              <h2 className="mb-2 text-[11px] font-black uppercase tracking-wider" style={{ color: primary }}>
                Projects
              </h2>
            )}
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs font-bold">
                {proj.name || "Project"}
                {proj.role ? ` · ${proj.role}` : ""}
              </p>
              <p className="shrink-0 text-[10px]" style={{ color: `${fg}80` }}>
                {dateRange(proj.startDate, proj.endDate)}
              </p>
            </div>
            {proj.link && (
              <p className="text-[10px]" style={{ color: accent }}>
                {proj.link}
              </p>
            )}
            {proj.description && (
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: `${fg}cc` }}>
                {proj.description}
              </p>
            )}
          </div>
        ),
      });
    });

    education.forEach((ed, i) => {
      list.push({
        key: `edu-${ed.id || i}`,
        node: (
          <div>
            {i === 0 && (
              <h2 className="mb-2 text-[11px] font-black uppercase tracking-wider" style={{ color: primary }}>
                Education
              </h2>
            )}
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs font-bold">
                {ed.degree ? `${ed.degree}${ed.field ? `, ${ed.field}` : ""}` : ed.institution}
              </p>
              <p className="shrink-0 text-[10px]" style={{ color: `${fg}80` }}>
                {dateRange(ed.startYear, ed.endYear)}
              </p>
            </div>
            {ed.degree && (
              <p className="text-[10px]" style={{ color: `${fg}80` }}>
                {ed.institution}
              </p>
            )}
            {ed.description && (
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: `${fg}cc` }}>
                {ed.description}
              </p>
            )}
          </div>
        ),
      });
    });

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
    primary,
    accent,
    fg,
  ]);

  const signature = useMemo(
    () => JSON.stringify({ n: blocks.map((b) => b.key), fontFamily, fg, primary, accent }),
    [blocks, fontFamily, fg, primary, accent],
  );

  const { pageKeys, measureRefs } = usePaginatedBlocks(blocks, signature);
  const blockMap = useMemo(() => new Map(blocks.map((b) => [b.key, b.node])), [blocks]);

  const sharedStyle = {
    color: fg,
    fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : undefined,
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Off-screen measurement pass — invisible, same width as a real page's content area */}
      <div
        aria-hidden
        style={{ position: "absolute", top: -99999, left: -99999, width: PAGE_WIDTH - PAGE_PADDING * 2, ...sharedStyle }}
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
          className="w-full shrink-0 overflow-hidden rounded-lg bg-white"
          style={{
            maxWidth: PAGE_WIDTH,
            minHeight: PAGE_HEIGHT,
            padding: PAGE_PADDING,
            // boxShadow: "0 30px 60px -20px rgba(11,46,43,0.22)",
            ...sharedStyle,
          }}
        >
          <div className="space-y-4">{keys.map((k) => <div key={k}>{blockMap.get(k)}</div>)}</div>
          {pageKeys.length > 1 && (
            <div className="mt-6 text-center text-[10px]" style={{ color: `${fg}55` }}>
              Page {pageIndex + 1} of {pageKeys.length}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
