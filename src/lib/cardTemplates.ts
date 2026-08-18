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
  type: "text" | "shape";
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
    backgroundColor?: string;
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
  /**
   * Percentage-of-card-size (0–100) anchor points for overlaid text, keyed
   * per face. `x`/`y` is the anchor's top-left corner except where noted.
   * Used by the simpler fixed-slot templates (e.g. Floral Mandala).
   */
  layout?: {
    front: {
      name: { x: number; y: number };
      title: { x: number; y: number };
      contact: { x: number; y: number };
    };
    back: {
      /** Centered on this point (unlike the front anchors). */
      companyName: { x: number; y: number };
    };
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
    id: "floral-mandala",
    name: "Floral Mandala",
    description:
      "Ivory business card with a hand-drawn floral mandala design, featuring separate front and back backgrounds for customizable user details.",
    swatch: ["#FBF3E4", "#0E7C86", "#083F45"],

    background: {
      front: "/templates/floral-mandala/front.png",
      back: "/templates/floral-mandala/back.png",
    },

    layout: {
      front: {
        name: { x: 52, y: 28 },
        title: { x: 55, y: 42 },
        contact: { x: 55, y: 58 },
      },
      back: {
        companyName: { x: 50, y: 50 },
      },
    },

    editableFields: ["fullName", "jobTitle", "phone", "email", "website", "companyName"],

    colors: {
      background: "#FBF3E4",
      primary: "#0E7C86",
      secondary: "#083F45",
      text: "#202020",
    },
  },
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
          y: 64.8,
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
          y: 74.5,
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
}
];
