/**
 * CV / Resume template definitions.
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
    sidebarBackground?: string;
    divider?: string;
    summaryBackground?: string;
    timeline?: string;
    timelineDot?: string;
  };

  layout: {
    headerStyle: "left-aligned" | "centered";
    contactBar: boolean;

    mainLayout?: "single" | "two-column";
    sidebarWidth?: number;
    contentWidth?: number;
    sidebarPosition?: "left" | "right";

    sidebarSections?: CvSectionKey[];
    mainSections?: CvSectionKey[];

    sectionColumns: Partial<Record<CvSectionKey, number>>;

    sectionOrder: CvSectionKey[];

    spacing: Record<string, number>;

    typography: Record<string, number>;

    gridGap?: number;
    columnGap?: number;

    profileImage?: {
      position?: "left" | "right";
      size?: number;
      shape?: "circle" | "square";
      grayscale?: boolean;
    };

    header?: {
      layout?: "photo-right" | "photo-left";
      nameUppercase?: boolean;
      nameLetterSpacing?: number;
      designationUppercase?: boolean;
      contactInline?: boolean;
      showDivider?: boolean;
    };

    experience?: {
      layout?: "standard" | "timeline";
      showTimeline?: boolean;
      showTimelineDots?: boolean;
      timelineWidth?: number;
      dotSize?: number;
      datePosition?: "left" | "right";
    };

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
        skills: 5,
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
      "Modern two-column CV with a gray sidebar, clean typography, summary section, experience, education and references.",

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
      sidebarPosition: "left",

      sidebarSections: [
        "skills",
        "languages",
        "awards",
      ],

      mainSections: [
        "summary",
        "experience",
        "education",
        "references",
      ],

      sectionColumns: {
        summary: 1,
        skills: 1,
        education: 1,
        experience: 1,
        awards: 1,
        languages: 1,
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
      "Elegant two-column CV with a right-side profile photo, full-width summary, timeline experience, references, education, skills and languages.",

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

      /*
       * RIGHT COLUMN
       */
      sidebarSections: [
        "education",
        "skills",
        "languages",
      ],

      /*
       * LEFT COLUMN
       */
      mainSections: [
        "summary",
        "experience",
        "references",
      ],

      sectionColumns: {
        summary: 1,
        experience: 1,
        education: 1,
        skills: 1,
        languages: 1,
        references: 2,
        awards: 1,
      },

      /*
       * Summary is intentionally included
       * in mainSections so it renders full-width
       * before the two-column content.
       */
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
        sidebarPadding: 0,
        contentPadding: 0,
        itemGap: 5,

        headerHeight: 92,

        photoTop: 0,
        photoRight: 0,

        summaryBottom: 14,

        timelineGap: 10,

        referenceGap: 16,

        sidebarSectionGap: 18,
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

        referenceNameSize: 6.5,
        referenceMetaSize: 5.5,
      },

      columnGap: 18,

      gridGap: 10,

      /*
       * Profile image from the reference:
       * small circular grayscale image
       * positioned in the top-right.
       */
      profileImage: {
        position: "right",
        size: 74,
        shape: "circle",
        grayscale: true,
      },

      /*
       * Header:
       *
       * NAME                         PHOTO
       * DESIGNATION                  CONTACT
       * CONTACT
       * ----------------------------------
       */
      header: {
        layout: "photo-right",

        nameUppercase: true,

        nameLetterSpacing: 2,

        designationUppercase: false,

        contactInline: true,

        showDivider: true,
      },

      /*
       * Experience uses a vertical timeline.
       */
      experience: {
        layout: "timeline",

        showTimeline: true,

        showTimelineDots: true,

        timelineWidth: 1,

        dotSize: 5,

        datePosition: "right",
      },

      /*
       * References appear in two columns
       * inside the left/main column.
       */
      references: {
        columns: 2,
      },
    },
  },
];