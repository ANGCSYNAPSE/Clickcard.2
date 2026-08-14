import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { WallpaperType, GradientDirection } from "@/components/app/LiveProfileCard";

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
  backgroundColor: string;
  gradientColor: string;
  gradientDirection: GradientDirection;
  noise: boolean;
  patternIndex: number;
  pageFont: string;
  pageTextColor: string;
  matchTitleFont: boolean;
  titleFont: string;
  titleColor: string;
  dirty: boolean;
}

export const DEFAULT_DESIGN: DesignState = {
  primary: "#BE5103",
  accent: "#069494",
  theme: "light",
  wallpaperType: "fill",
  backgroundColor: "#301414",
  gradientColor: "#301414",
  gradientDirection: "up",
  noise: true,
  patternIndex: 0,
  pageFont: "Inter",
  pageTextColor: "#FFEED5",
  matchTitleFont: true,
  titleFont: "Inter",
  titleColor: "#FFEED5",
  dirty: false,
};

export const STUDIO_DESIGN_KEY = "cc_studio_design_v1";

const designSlice = createSlice({
  name: "design",
  initialState: DEFAULT_DESIGN,
  reducers: {
    /** Applies a saved/loaded design without marking it dirty. */
    hydrateDesign: (state, action: PayloadAction<Partial<DesignState>>) => {
      Object.assign(state, action.payload, { dirty: false });
    },
    updateDesign: (state, action: PayloadAction<Partial<Omit<DesignState, "dirty">>>) => {
      Object.assign(state, action.payload);
      state.dirty = true;
    },
    designSaved: (state) => {
      state.dirty = false;
    },
  },
});

export const { hydrateDesign, updateDesign, designSaved } = designSlice.actions;
export default designSlice.reducer;
