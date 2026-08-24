/**
 * CV / Resume template definitions.
 *
 * Classic Orange — based on the provided CV reference.
 * Modern Gray Two Column — based on the provided two-column CV reference.
 */

export type CvSectionKey =
  | "summary"
  | "skills"
  | "education"
  | "experience"
  | "otherActivities"
  | "awards"
  | "languages"
  | "references";

export interface CvTemplateDef {
  id: string;
  name: string;
  description: string;

  swatch: string[];

  colors: {
    background: string;
    heading: string;
    accentBar: string;
    accentBarText: string;
    text: string;
    subtleText: string;
    /** Two-column layouts only — the sidebar's background fill. */
    sidebarBackground?: string;
    /** Hairline rule colour (under the header, between sections, etc). */
    divider?: string;
    /** Background behind the Summary block, when it's rendered as its own panel. */
    summaryBackground?: string;
    /** Timeline line colour for experience sections. */
    timeline?: string;
    /** Timeline dot colour for experience sections. */
    timelineDot?: string;
  };

  layout: {
    headerStyle: "left-aligned" | "centered";
    contactBar: boolean;

    /** "two-column" renders a sidebar + main content layout instead of the single stacked column. */
    mainLayout?: "single" | "two-column";
    /** Percent widths for the two-column layout — should sum to ~100. */
    sidebarWidth?: number;
    contentWidth?: number;
    /** Position of sidebar in two-column layout (default: left). */
    sidebarPosition?: "left" | "right";
    /** Which sections render in the sidebar vs. the main column (two-column layouts only). */
    sidebarSections?: CvSectionKey[];
    mainSections?: CvSectionKey[];

    /** Column counts per section — omitted/1 means a plain stacked list. */
    sectionColumns: Partial<Record<CvSectionKey, number>>;

    /** Render order for sections below the header. */
    sectionOrder: CvSectionKey[];

    /** Named spacing values (px, authored against the A4 page). Keys vary per template. */
    spacing: Record<string, number>;

    /** Named font sizes (px, authored against the A4 page). Keys vary per template. */
    typography: Record<string, number>;

    gridGap?: number;
    columnGap?: number;

    /** Profile photo styling — position, size, shape, and effects. */
    profileImage?: {
      position?: "left" | "right";
      size?: number;
      shape?: "circle" | "square";
      grayscale?: boolean;
    };

    /** Header styling — layout, capitalization, and dividers. */
    header?: {
      layout?: "photo-right" | "photo-left";
      nameUppercase?: boolean;
      nameLetterSpacing?: number;
      designationUppercase?: boolean;
      contactInline?: boolean;
      showDivider?: boolean;
    };

    /** Experience section styling — timeline layout and date positioning. */
    experience?: {
      layout?: "standard" | "timeline";
      showTimeline?: boolean;
      showTimelineDots?: boolean;
      timelineWidth?: number;
      dotSize?: number;
      datePosition?: "left" | "right";
    };

    /** References section styling — column count. */
    references?: {
      columns?: number;
    };
  };
}

export const CV_TEMPLATES: CvTemplateDef[] = [
  {
    id: "classic-orange",
    name: "Classic Orange",
    description:
      "Compact one-page CV with a left-aligned header, orange contact bar, orange section headings, and structured multi-column content.",

    swatch: [
      "#FFFFFF",
      "#F15A24",
      "#222222",
    ],

    colors: {
      background: "#FFFFFF",
      heading: "#F15A24",
      accentBar: "#F15A24",
      accentBarText: "#FFFFFF",
      text: "#222222",
      subtleText: "#555555",
    },

    layout: {
      headerStyle: "left-aligned",

      contactBar: true,

      sectionColumns: {
        skills: 3,
        education: 2,
        experience: 1,
        otherActivities: 3,
        awards: 3,
        languages: 3,
      },

      sectionOrder: [
        "skills",
        "education",
        "experience",
        "otherActivities",
        "awards",
        "languages",
      ],

      spacing: {
        pagePadding: 26,
        headerBottom: 7,
        sectionGap: 10,
        itemGap: 3,
        contactBarHeight: 22,
      },

      typography: {
        nameSize: 21,
        subtitleSize: 11,
        descriptionSize: 9,
        contactSize: 8,
        sectionTitleSize: 13,
        bodySize: 9,
        metaSize: 8,
      },

      gridGap: 18,
    },
  },
  {
    id: "modern-gray-two-column",

    name: "Modern Gray Two Column",

    description:
      "Modern two-column CV with a gray sidebar, right-aligned contact details, summary section, experience, education and references.",

    swatch: [
      "#FFFFFF",
      "#F1F1F1",
      "#333333",
    ],

    colors: {
      background: "#FFFFFF",
      heading: "#333333",
      accentBar: "#333333",
      accentBarText: "#FFFFFF",
      text: "#333333",
      subtleText: "#666666",
      sidebarBackground: "#F1F1F1",
      divider: "#AFAFAF",
      summaryBackground: "#F1F1F1",
    },

    layout: {
      headerStyle: "left-aligned",
      contactBar: false,

      mainLayout: "two-column",

      sidebarWidth: 35,
      contentWidth: 65,

      sidebarSections: ["skills", "languages", "awards"],

      mainSections: ["experience", "education", "references"],

      sectionColumns: {
        skills: 1,
        languages: 1,
        awards: 1,
        experience: 1,
        education: 1,
        references: 2,
      },

      sectionOrder: [
        "summary",
        "skills",
        "languages",
        "awards",
        "experience",
        "education",
        "references",
      ],

      spacing: {
        pagePadding: 36,
        headerBottom: 16,
        summaryPadding: 12,
        sectionGap: 18,
        sidebarPadding: 17,
        contentPadding: 17,
        itemGap: 6,
      },

      typography: {
        nameSize: 21,
        designationSize: 9,
        contactSize: 7,
        summaryTitleSize: 10,
        summaryTextSize: 7,
        sectionTitleSize: 10,
        bodySize: 7,
        metaSize: 6.5,
        sidebarTextSize: 7,
      },

      columnGap: 17,
    },
  },
  {
    id: "elegant-timeline",

    name: "Elegant Timeline",

    description:
      "Elegant two-column CV with a right-aligned profile photo, timeline-based experience, and clean monochrome typography.",

    swatch: [
      "#FFFFFF",
      "#666666",
      "#333333",
    ],

    colors: {
      background: "#FFFFFF",
      heading: "#555A60",
      accentBar: "#555A60",
      accentBarText: "#FFFFFF",
      text: "#333333",
      subtleText: "#777777",
      sidebarBackground: "#FFFFFF",
      divider: "#A8A8A8",
      summaryBackground: "#FFFFFF",
      timeline: "#B8B8B8",
      timelineDot: "#555555",
    },

    layout: {
      headerStyle: "left-aligned",

      contactBar: false,

      mainLayout: "two-column",

      sidebarWidth: 31,
      contentWidth: 69,
      sidebarPosition: "right",

      sidebarSections: [
        "education",
        "skills",
        "languages",
      ],

      mainSections: [
        "summary",
        "experience",
        "references",
      ],

      sectionColumns: {
        skills: 1,
        education: 1,
        experience: 1,
        awards: 1,
        languages: 1,
        references: 2,
      },

      sectionOrder: [
        "summary",
        "experience",
        "education",
        "skills",
        "references",
        "languages",
      ],

      spacing: {
        pagePadding: 24,
        headerBottom: 12,
        summaryPadding: 0,
        sectionGap: 16,
        sidebarPadding: 16,
        contentPadding: 16,
        itemGap: 5,
      },

      typography: {
        nameSize: 22,
        designationSize: 9,
        contactSize: 6.5,
        summaryTitleSize: 9,
        summaryTextSize: 6.5,
        sectionTitleSize: 9,
        bodySize: 6.5,
        metaSize: 6,
        sidebarTextSize: 6.5,
      },

      columnGap: 18,

      profileImage: {
        position: "right",
        size: 74,
        shape: "circle",
        grayscale: true,
      },

      header: {
        layout: "photo-right",
        nameUppercase: true,
        nameLetterSpacing: 2,
        designationUppercase: false,
        contactInline: true,
        showDivider: true,
      },

      experience: {
        layout: "timeline",
        showTimeline: true,
        showTimelineDots: true,
        timelineWidth: 1,
        dotSize: 5,
        datePosition: "right",
      },

      references: {
        columns: 2,
      },
    },
  },
];
