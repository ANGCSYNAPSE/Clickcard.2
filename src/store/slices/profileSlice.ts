import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { profileService } from "@/services/profileService";
import { extractError } from "@/lib/axiosClient";
import type { FullProfile, RequestStatus } from "@/types";

interface ProfileState {
  data: FullProfile | null;
  draft: FullProfile;
  isPublic: boolean;
  status: RequestStatus;
  saving: boolean;
  error: string | null;
  dirty: boolean;
}

const emptyProfile: FullProfile = {
  personal: {},
  contact: {},
  education: [],
  experience: [],
  business: { hours: [] },
  products: [],
  social: [],
  digitalCard: {},
};

const initialState: ProfileState = {
  data: null,
  draft: emptyProfile,
  // Profiles are public by default — visitors land on a working page unless
  // the owner explicitly makes it private (from Settings).
  isPublic: true,
  status: "idle",
  saving: false,
  error: null,
  dirty: false,
};

export const fetchProfile = createAsyncThunk(
  "profile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await profileService.getFull();
      return data.data ?? emptyProfile;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const saveProfile = createAsyncThunk(
  "profile/save",
  async (
    { profile, picture }: { profile: FullProfile; picture?: File | null },
    { rejectWithValue },
  ) => {
    try {
      await profileService.save(profile, picture);
      // Re-fetch the canonical, server-normalized profile (real picture URL,
      // computed fields, etc.) so every screen sharing this store — live
      // preview, dashboard, studio — updates immediately with the true saved
      // state instead of just echoing back what we sent.
      const { data } = await profileService.getFull();
      return data.data ?? profile;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const setVisibility = createAsyncThunk(
  "profile/visibility",
  async (isPublic: boolean, { rejectWithValue }) => {
    try {
      if (isPublic) await profileService.makePublic();
      else await profileService.makePrivate();
      return isPublic;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    /** Patch a single top-level section of the working draft. */
    updateSection: (
      state,
      action: PayloadAction<{ section: keyof FullProfile; value: unknown }>,
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (state.draft as any)[action.payload.section] = action.payload.value;
      state.dirty = true;
    },
    resetDraft: (state) => {
      state.draft = state.data ?? emptyProfile;
      state.dirty = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.data = a.payload;
        s.draft = { ...emptyProfile, ...a.payload };
        // Undefined/missing from the backend means "not set yet" — default to
        // public rather than silently treating a new profile as private.
        s.isPublic = a.payload.isPublic ?? true;
        s.dirty = false;
      })
      .addCase(fetchProfile.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(saveProfile.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(saveProfile.fulfilled, (s, a) => {
        s.saving = false;
        s.data = a.payload;
        s.draft = { ...emptyProfile, ...a.payload };
        s.dirty = false;
      })
      .addCase(saveProfile.rejected, (s, a) => {
        s.saving = false;
        s.error = a.payload as string;
      })
      .addCase(setVisibility.fulfilled, (s, a) => {
        s.isPublic = a.payload;
      });
  },
});

export const { updateSection, resetDraft } = profileSlice.actions;
export default profileSlice.reducer;
