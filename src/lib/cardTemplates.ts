import type { CardTemplate } from "@/services/profileService";

/**
 * Digital business-card / visiting-card templates.
 *
 * Template ids are a contract with the backend renderer (CardTemplateService.js)
 * and with the client preview (CardPreview.tsx) — changing an `id` here
 * requires updating both. `swatch` only drives the little thumbnail in the
 * template picker and has no effect on the rendered card.
 */

/** A single positioned piece of content on an elements-based template face. */
export interface CardElement {
  id: string;
  type: "text" | "shape" | "icon";
  /** Profile field this text element is bound to (see CardPreview's field→value mapping). */
  field?: string;
  label?: string;
  required?: boolean;
  /** Percentage-of-card anchor — `x` is treated as the element's horizontal centre. */
  position: { x: number; y: number };
  /** Percentage-of-card box size. */
  size: { width: number; height: number };
  style: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    color?: string;
    textAlign?: "left" | "center" | "right";
    letterSpacing?: number;
    textTransform?: "uppercase" | "none";
    backgroundColor?: string;
    /** `type: "icon"` only — name of a supported icon (see ICON_LIBRARY in CardPreview.tsx). */
    iconName?: string;
    /** `type: "icon"` only — design-canvas px size, scaled the same way as fontSize. */
    iconSize?: number;
    iconColor?: string;
  };
}

/** One face (front or back) of an elements-based template. */
export interface CardFaceDef {
  background: { type: "image"; image: string };
  elements: CardElement[];
}

export interface CardTemplateDef extends CardTemplate {
  /** 2–4 colour stops shown on the picker thumbnail. */
  swatch: string[];
  category?: string;

  /**
   * Pre-designed background art for image-based templates — paths under
   * /public. If either is missing the face just falls back to `colors.background`.
   */
  background?: {
    front: string;
    back: string;
  };
  /** Reference card canvas — `front`/`back` element positions are percentages of this. */
  card?: {
    orientation: "portrait" | "landscape";
    width: number;
    height: number;
    borderRadius: number;
    sides: ("front" | "back")[];
  };
  /** Fully data-driven face definitions (arbitrary positioned text/shape elements). */
  front?: CardFaceDef;
  back?: CardFaceDef;

  /** Profile fields this template's layout has a slot for. */
  editableFields?: string[];
  /** Fallback colours used for text/background when no custom palette is set. */
  colors?: {
    background: string;
    primary: string;
    secondary: string;
    text: string;
    mutedText?: string;
  };
  design?: {
    fontFamily?: string;
    typography?: Record<string, { fontSize?: number; fontWeight?: number; color?: string }>;
  };
}

export const CARD_TEMPLATES: CardTemplateDef[] = [
  {
  id: "orange-geometric",
  name: "Orange Geometric",
  description:
    "Minimal white portrait business card with bold orange geometric artwork and a clean professional contact layout.",

  category: "business",

  swatch: ["#FFFFFF", "#F47700", "#555555"],

  background: {
    // RIGHT CARD = FRONT
    front: "/templates/orange-geometric/front.png",

    // LEFT CARD = BACK
    back: "/templates/orange-geometric/back.png",
  },

  card: {
    orientation: "portrait",
    width: 600,
    height: 1050,
    borderRadius: 10,
    sides: ["front", "back"],
  },

  front: {
    background: {
      type: "image",
      image: "/templates/orange-geometric/front.png",
    },

    elements: [
      // -----------------------------------------
      // LOGO — sits directly above the company name
      // -----------------------------------------
      {
        id: "logo",
        type: "icon",
        field: "logo",
        label: "Business Logo",
        required: false,

        position: {
          x: 50,
          y: 62,
        },

        size: {
          width: 16,
          height: 9,
        },

        style: {
          iconName: "brandLogo",
          iconSize: 46,
          iconColor: "#555555",
        },
      },

      // -----------------------------------------
      // COMPANY NAME
      // -----------------------------------------
      {
        id: "companyName",
        type: "text",
        field: "companyName",
        label: "Company Name",
        required: true,

        position: {
          x: 50,
          y: 76.5,
        },

        size: {
          width: 88,
          height: 7,
        },

        style: {
          fontFamily: "Inter",
          fontSize: 52,
          fontWeight: 800,
          color: "#555555",
          textAlign: "center",
          letterSpacing: 0.5,
        },
      },

      // -----------------------------------------
      // TAGLINE
      // -----------------------------------------
      {
        id: "tagline",
        type: "text",
        field: "tagline",
        label: "Tagline",
        required: false,

        position: {
          x: 50,
          y: 82.5,
        },

        size: {
          width: 70,
          height: 4,
        },

        style: {
          fontFamily: "Inter",
          fontSize: 27,
          fontWeight: 500,
          color: "#666666",
          textAlign: "center",
          letterSpacing: 3,
        },
      },

      // -----------------------------------------
      // ORANGE DIVIDER
      // -----------------------------------------
      {
        id: "backDivider",
        type: "shape",

        position: {
          x: 50,
          y: 87.5,
        },

        size: {
          width: 12,
          height: 0.8,
        },

        style: {
          backgroundColor: "#F47700",
        },
      },
    ],
  },

  // ==================================================
  // BACK
  // ==================================================

  back: {
    background: {
      type: "image",
      image: "/templates/orange-geometric/back.png",
    },

    elements: [
      // -----------------------------------------
      // NAME
      // -----------------------------------------
      {
        id: "fullName",
        type: "text",
        field: "fullName",
        label: "Full Name",
        required: true,

        position: {
          x: 50,
          y: 62.8,
        },

        size: {
          width: 86,
          height: 7,
        },

        style: {
          fontFamily: "Inter",
          fontSize: 55,
          fontWeight: 800,
          color: "#555555",
          textAlign: "center",
          letterSpacing: 0.5,
        },
      },

      // -----------------------------------------
      // POSITION
      // -----------------------------------------
      {
        id: "jobTitle",
        type: "text",
        field: "jobTitle",
        label: "Position",
        required: false,

        position: {
          x: 50,
          y: 70.5,
        },

        size: {
          width: 70,
          height: 4,
        },

        style: {
          fontFamily: "Inter",
          fontSize: 30,
          fontWeight: 500,
          color: "#666666",
          textAlign: "center",
          letterSpacing: 1.8,
        },
      },

      // -----------------------------------------
      // ORANGE DIVIDER
      // -----------------------------------------
      {
        id: "frontDivider",
        type: "shape",

        position: {
          x: 50,
          y: 75,
        },

        size: {
          width: 12,
          height: 0.8,
        },

        style: {
          backgroundColor: "#F47700",
        },
      },

      // -----------------------------------------
      // ADDRESS
      // -----------------------------------------
      {
        id: "address",
        type: "text",
        field: "address",
        label: "Address",
        required: false,

        position: {
          x: 50,
          y: 79.5,
        },

        size: {
          width: 82,
          height: 4,
        },

        style: {
          fontFamily: "Inter",
          fontSize: 28,
          fontWeight: 400,
          color: "#555555",
          textAlign: "center",
        },
      },

      // -----------------------------------------
      // EMAIL
      // -----------------------------------------
      {
        id: "email",
        type: "text",
        field: "email",
        label: "Email",
        required: false,

        position: {
          x: 50,
          y: 83.5,
        },

        size: {
          width: 82,
          height: 4,
        },

        style: {
          fontFamily: "Inter",
          fontSize: 28,
          fontWeight: 400,
          color: "#555555",
          textAlign: "center",
        },
      },

      // -----------------------------------------
      // WEBSITE
      // -----------------------------------------
      {
        id: "website",
        type: "text",
        field: "website",
        label: "Website",
        required: false,

        position: {
          x: 50,
          y: 87.5,
        },

        size: {
          width: 82,
          height: 4,
        },

        style: {
          fontFamily: "Inter",
          fontSize: 28,
          fontWeight: 400,
          color: "#555555",
          textAlign: "center",
        },
      },

      // -----------------------------------------
      // PHONE
      // -----------------------------------------
      {
        id: "phone",
        type: "text",
        field: "phone",
        label: "Phone",
        required: false,

        position: {
          x: 50,
          y: 91.5,
        },

        size: {
          width: 92,
          height: 4,
        },

        style: {
          fontFamily: "Inter",
          fontSize: 24,
          fontWeight: 400,
          color: "#555555",
          textAlign: "center",
        },
      },
    ],
  },

  editableFields: [
    "fullName",
    "jobTitle",
    "companyName",
    "tagline",
    "address",
    "email",
    "website",
    "phone",
    "whatsapp",
    "logo",
  ],

  colors: {
    background: "#FFFFFF",
    primary: "#F47700",
    secondary: "#FF9D00",
    text: "#555555",
    mutedText: "#777777",
  },

  design: {
    fontFamily: "Inter",

    typography: {
      name: {
        fontSize: 52,
        fontWeight: 800,
        color: "#555555",
      },

      jobTitle: {
        fontSize: 30,
        fontWeight: 500,
        color: "#666666",
      },

      body: {
        fontSize: 28,
        fontWeight: 400,
        color: "#555555",
      },

      companyName: {
        fontSize: 52,
        fontWeight: 800,
        color: "#555555",
      },

      tagline: {
        fontSize: 27,
        fontWeight: 500,
        color: "#666666",
      },
    },
  },
},
{
  id: "navy-geometric",
  name: "Navy Geometric",

  description:
    "Modern navy business card with a dark geometric back, white patterned front, angled navy contact panel, and clean professional typography.",

  category: "business",

  swatch: ["#071D35", "#FFFFFF", "#DCE1E5"],

  // Actual asset folder is /public/templates/navy-chevron/ (not navy-geometric).
  background: {
    front: "/templates/navy-chevron/front.png",
    back: "/templates/navy-chevron/back.png",
  },

  card: {
    orientation: "landscape",
    width: 1050,
    height: 600,
    borderRadius: 28,
    sides: ["front", "back"],
  },

  // =========================================================
  // FRONT — white geometric background, navy contact panel on
  // the left, name + designation on the right.
  // =========================================================
  front: {
    background: {
      type: "image",
      image: "/templates/navy-chevron/front.png",
    },

    elements: [
      {
        id: "logo",
        type: "icon",
        field: "logo",
        label: "Business Logo",
        required: false,
        position: { x: 50, y: 35 },
        size: { width: 13, height: 13 },
        style: { iconName: "brandLogo", iconSize: 68, iconColor: "#FFFFFF" },
      },
      {
        id: "companyName",
        type: "text",
        field: "companyName",
        label: "Company Name",
        required: true,
        position: { x: 50, y: 51 },
        size: { width: 60, height: 9 },
        style: {
          fontFamily: "Inter",
          fontSize: 46,
          fontWeight: 800,
          color: "#FFFFFF",
          textAlign: "center",
          letterSpacing: 5,
          textTransform: "uppercase",
        },
      },
      {
        id: "tagline",
        type: "text",
        field: "tagline",
        label: "Tagline",
        required: false,
        position: { x: 50, y: 60.5 },
        size: { width: 40, height: 4 },
        style: {
          fontFamily: "Inter",
          fontSize: 20,
          fontWeight: 500,
          color: "#FFFFFF",
          textAlign: "center",
          letterSpacing: 4,
          textTransform: "uppercase",
        },
      },
    ],
  },

  // =========================================================
  // BACK — dark navy geometric pattern, logo, company name, tagline.
  // =========================================================
  back: {
    background: {
      type: "image",
      image: "/templates/navy-chevron/back.png",
    },

    elements: [
      {
        id: "addressIcon",
        type: "icon",
        position: { x: 4.8, y: 30.5 },
        size: { width: 6, height: 6 },
        style: { iconName: "location", iconSize: 34, iconColor: "#FFFFFF" },
      },
      {
        id: "address",
        type: "text",
        field: "address",
        label: "Address",
        required: false,
        position: { x: 8, y: 30.5 },
        size: { width: 34, height: 4 },
        style: { fontFamily: "Inter", fontSize: 32, fontWeight: 700, color: "#FFFFFF", textAlign: "left" },
      },
      {
        id: "phoneIcon",
        type: "icon",
        position: { x: 4.8, y: 42 },
        size: { width: 6, height: 6 },
        style: { iconName: "phone", iconSize: 34, iconColor: "#FFFFFF" },
      },
      {
        id: "phone",
        type: "text",
        field: "phone",
        label: "Phone",
        required: false,
        position: { x: 8, y: 42 },
        size: { width: 34, height: 4 },
        style: { fontFamily: "Inter", fontSize: 32, fontWeight: 700, color: "#FFFFFF", textAlign: "left" },
      },
      {
        id: "emailIcon",
        type: "icon",
        position: { x: 4.8, y: 53.5 },
        size: { width: 6, height: 6 },
        style: { iconName: "mail", iconSize: 34, iconColor: "#FFFFFF" },
      },
      {
        id: "email",
        type: "text",
        field: "email",
        label: "Email",
        required: false,
        position: { x: 8, y: 52.5 },
        size: { width: 43, height: 4 },
        style: { fontFamily: "Inter", fontSize: 32, fontWeight: 700, color: "#FFFFFF", textAlign: "left" },
      },
      {
        id: "websiteIcon",
        type: "icon",
        position: { x: 4.8, y: 63.5 },
        size: { width: 6, height: 6 },
        style: { iconName: "globe", iconSize: 34, iconColor: "#FFFFFF" },
      },
      {
        id: "website",
        type: "text",
        field: "website",
        label: "Website",
        required: false,
        position: { x: 8, y: 63 },
        size: { width: 34, height: 4 },
        style: { fontFamily: "Inter", fontSize: 32, fontWeight: 700, color: "#FFFFFF", textAlign: "left" },
      },
      {
        id: "fullName",
        type: "text",
        field: "fullName",
        label: "Full Name",
        required: true,
        position: { x: 78, y: 40 },
        size: { width: 46, height: 10 },
        style: {
          fontFamily: "Inter",
          fontSize: 46,
          fontWeight: 800,
          color: "#071D35",
          textAlign: "center",
          letterSpacing: 2,
          textTransform: "uppercase",
        },
      },
      {
        id: "jobTitle",
        type: "text",
        field: "jobTitle",
        label: "Job Title",
        required: false,
        position: { x: 78, y: 51 },
        size: { width: 38, height: 5 },
        style: {
          fontFamily: "Inter",
          fontSize: 22,
          fontWeight: 600,
          color: "#071D35",
          textAlign: "center",
          letterSpacing: 0.5,
        },
      },
      {
        id: "frontDivider",
        type: "shape",
        position: { x: 78, y: 57 },
        size: { width: 15, height: 0.7 },
        style: { backgroundColor: "#071D35" },
      },
    ],
  },

  editableFields: ["fullName", "jobTitle", "companyName", "tagline", "address", "phone", "email", "website", "logo"],

  colors: {
    background: "#FFFFFF",
    primary: "#071D35",
    secondary: "#DCE1E5",
    text: "#071D35",
    mutedText: "#657080",
  },

  design: {
    fontFamily: "Inter",
    typography: {
      name: { fontSize: 40, fontWeight: 700, color: "#071D35" },
      jobTitle: { fontSize: 20, fontWeight: 600, color: "#071D35" },
      contact: { fontSize: 18, fontWeight: 500, color: "#FFFFFF" },
      companyName: { fontSize: 38, fontWeight: 700, color: "#FFFFFF" },
      tagline: { fontSize: 18, fontWeight: 500, color: "#FFFFFF" },
    },
  },
},
];
