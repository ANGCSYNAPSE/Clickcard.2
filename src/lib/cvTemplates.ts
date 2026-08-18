/**
 * CV / Resume template definitions.
 *
 * Classic Orange — based on the provided CV reference.
 */

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
  };

  layout: {
    headerStyle: "left-aligned" | "centered";
    contactBar: boolean;

    sectionColumns: {
      skills: number;
      education: number;
      experience: number;
      otherActivities: number;
      awards: number;
      languages: number;
    };

    sectionOrder: (
      | "skills"
      | "education"
      | "experience"
      | "otherActivities"
      | "awards"
      | "languages"
    )[];

    spacing: {
      pagePadding: number;
      headerBottom: number;
      sectionGap: number;
      itemGap: number;
      contactBarHeight: number;
    };

    typography: {
      nameSize: number;
      subtitleSize: number;
      descriptionSize: number;
      contactSize: number;
      sectionTitleSize: number;
      bodySize: number;
      metaSize: number;
    };

    gridGap: number;
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
];