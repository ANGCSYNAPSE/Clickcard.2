import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  WallpaperType,
  GradientDirection,
  HeaderLayout,
  ButtonStyle,
  ButtonRoundness,
  ButtonShadow,
  SocialLinksStyle,
} from "@/components/app/LiveProfileCard";
import { fetchProfile, saveProfile } from "./profileSlice";

export type { HeaderLayout, ButtonStyle, ButtonRoundness, ButtonShadow, SocialLinksStyle };
export type TitleStyle = "text" | "logo";

/**
 * The profile card's visual design (Studio). Lives in Redux — not just local
 * Studio state — so every "live preview" surface (Studio, Profile editor,
 * Dashboard) reflects the same colors/wallpaper/fonts as soon as they
 * change, not only after hitting Save.
 */
export interface DesignState {
  primary: string;
  accent: string;
  theme: "light" | "dark";
  wallpaperType: WallpaperType;
  backgroundImageUrl: string;
  backgroundColor: string;
  gradientColor: string;
  gradientColorEnd: string;
  gradientDirection: GradientDirection;
  noise: boolean;
  patternIndex: number;
  buttonColor: string;
  buttonTextColor: string;
  buttonStyle: ButtonStyle;
  buttonRoundness: ButtonRoundness;
  buttonShadow: ButtonShadow;
  socialLinksStyle: SocialLinksStyle;
  pageFont: string;
  pageTextColor: string;
  matchTitleFont: boolean;
  titleFont: string;
  titleColor: string;
  headerLayout: HeaderLayout;
  titleStyle: TitleStyle;
  titleFontSize: number;
  bioFontSize: number;
  bodyFontSize: number;
  dirty: boolean;
}

// Mirrors STYLE_PRESETS' "classic" entry (@/lib/stylePresets) exactly — a
// brand-new user who never opens Studio should see the actual Classic look,
// not a different, unnamed dark theme that happened to also set
// headerLayout: "classic".
export const DEFAULT_DESIGN: DesignState = {
  primary: "#BE5103",
  accent: "#069494",
  theme: "light",
  wallpaperType: "fill",
  backgroundImageUrl: "",
  backgroundColor: "#FFFFFF",
  gradientColor: "#BE5103",
  gradientColorEnd: "#069494",
  gradientDirection: "up",
  noise: false,
  patternIndex: 0,
  buttonColor: "#111111",
  buttonTextColor: "#FFFFFF",
  buttonStyle: "solid",
  buttonRoundness: "slight",
  buttonShadow: "none",
  socialLinksStyle: "buttons",
  pageFont: "Inter",
  pageTextColor: "#111111",
  matchTitleFont: true,
  titleFont: "Inter",
  titleColor: "#111111",
  headerLayout: "classic",
  titleStyle: "text",
  titleFontSize: 20,
  bioFontSize: 12,
  bodyFontSize: 12,
  dirty: false,
};

export const STUDIO_DESIGN_KEY = "cc_studio_design_v1";

// Font sizes used to be an "sm" | "md" | "lg" | "xl" bucket rather than a
// literal px number. Anyone who saved a design in Studio before that changed
// has these strings sitting in localStorage — hydrating them straight in
// would set fontSize to an invalid CSS value (the browser just ignores it,
// falling back to some inherited size, so the card no longer matches the
// pre-sizing-feature default). Map old buckets back to the exact px value
// each one used to render at, so existing saves still resolve to the
// original look; anything else invalid falls back to the current default.
const LEGACY_TITLE_PX: Record<string, number> = { sm: 16, md: 20, lg: 24, xl: 30 };
const LEGACY_BODY_PX: Record<string, number> = { sm: 10, md: 12, lg: 14, xl: 16 };
function coerceFontSize(value: unknown, legacyMap: Record<string, number>, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value in legacyMap) return legacyMap[value];
  return fallback;
}

function applyDesignPayload(state: any, designPayload: any) {
  const payload = { ...designPayload };
  if ("titleFontSize" in payload) {
    payload.titleFontSize = coerceFontSize(payload.titleFontSize, LEGACY_TITLE_PX, DEFAULT_DESIGN.titleFontSize);
  }
  if ("bioFontSize" in payload) {
    payload.bioFontSize = coerceFontSize(payload.bioFontSize, LEGACY_BODY_PX, DEFAULT_DESIGN.bioFontSize);
  }
  if ("bodyFontSize" in payload) {
    payload.bodyFontSize = coerceFontSize(payload.bodyFontSize, LEGACY_BODY_PX, DEFAULT_DESIGN.bodyFontSize);
  }
  Object.assign(state, payload, { dirty: false });
}

const designSlice = createSlice({
  name: "design",
  initialState: DEFAULT_DESIGN,
  reducers: {
    /** Applies a saved/loaded design without marking it dirty. */
    hydrateDesign: (state, action: PayloadAction<Partial<DesignState>>) => {
      applyDesignPayload(state, action.payload);
    },
    updateDesign: (state, action: PayloadAction<Partial<Omit<DesignState, "dirty">>>) => {
      Object.assign(state, action.payload);
      state.dirty = true;
    },
    designSaved: (state) => {
      state.dirty = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => {
        const design = action.payload?.digitalCard?.design;
        if (design) {
          applyDesignPayload(state, design);
        }
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        const design = action.payload?.digitalCard?.design;
        if (design) {
          applyDesignPayload(state, design);
        }
      });
  },
});

export const { hydrateDesign, updateDesign, designSaved } = designSlice.actions;
export default designSlice.reducer;
