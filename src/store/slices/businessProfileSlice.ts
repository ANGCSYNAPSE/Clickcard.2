import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { businessProfileService, BusinessProfileInput } from "@/services/businessProfileService";
import { extractError } from "@/lib/axiosClient";
import type { BusinessProfile, RequestStatus } from "@/types";

interface BusinessProfileState {
  items: BusinessProfile[];
  status: RequestStatus;
  mutating: boolean;
  error: string | null;
}

const initialState: BusinessProfileState = {
  items: [],
  status: "idle",
  mutating: false,
  error: null,
};

export const fetchBusinessProfiles = createAsyncThunk(
  "businessProfiles/list",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await businessProfileService.list();
      return data.data ?? [];
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const fetchBusinessProfile = createAsyncThunk(
  "businessProfiles/get",
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await businessProfileService.get(id);
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const createBusinessProfile = createAsyncThunk(
  "businessProfiles/create",
  async (input: BusinessProfileInput, { rejectWithValue }) => {
    try {
      const { data } = await businessProfileService.create(input);
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const updateBusinessProfile = createAsyncThunk(
  "businessProfiles/update",
  async ({ id, input }: { id: number; input: Partial<BusinessProfileInput> }, { rejectWithValue }) => {
    try {
      const { data } = await businessProfileService.update(id, input);
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const deleteBusinessProfile = createAsyncThunk(
  "businessProfiles/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await businessProfileService.remove(id);
      return id;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const uploadBusinessDocument = createAsyncThunk(
  "businessProfiles/uploadDocument",
  async ({ id, file }: { id: number; file: File }, { rejectWithValue }) => {
    try {
      const { data } = await businessProfileService.uploadDocument(id, file);
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const removeBusinessDocument = createAsyncThunk(
  "businessProfiles/removeDocument",
  async ({ id, docId }: { id: number; docId: string }, { rejectWithValue }) => {
    try {
      const { data } = await businessProfileService.removeDocument(id, docId);
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const uploadBusinessLogo = createAsyncThunk(
  "businessProfiles/uploadLogo",
  async ({ id, file }: { id: number; file: File }, { rejectWithValue }) => {
    try {
      const { data } = await businessProfileService.uploadLogo(id, file);
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const removeBusinessLogo = createAsyncThunk(
  "businessProfiles/removeLogo",
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await businessProfileService.removeLogo(id);
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const uploadBusinessCover = createAsyncThunk(
  "businessProfiles/uploadCover",
  async ({ id, file }: { id: number; file: File }, { rejectWithValue }) => {
    try {
      const { data } = await businessProfileService.uploadCover(id, file);
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const removeBusinessCover = createAsyncThunk(
  "businessProfiles/removeCover",
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await businessProfileService.removeCover(id);
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

const businessProfileSlice = createSlice({
  name: "businessProfiles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const replace = (s: BusinessProfileState, updated: BusinessProfile) => {
      const i = s.items.findIndex((p) => p.id === updated.id);
      if (i !== -1) s.items[i] = updated;
      else s.items.push(updated);
    };

    builder
      .addCase(fetchBusinessProfile.fulfilled, (s, a) => replace(s, a.payload))
      .addCase(fetchBusinessProfiles.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchBusinessProfiles.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.items = a.payload;
      })
      .addCase(fetchBusinessProfiles.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(createBusinessProfile.pending, (s) => {
        s.mutating = true;
        s.error = null;
      })
      .addCase(createBusinessProfile.fulfilled, (s, a) => {
        s.mutating = false;
        s.items.unshift(a.payload);
      })
      .addCase(createBusinessProfile.rejected, (s, a) => {
        s.mutating = false;
        s.error = a.payload as string;
      })
      .addCase(updateBusinessProfile.fulfilled, (s, a) => replace(s, a.payload))
      .addCase(deleteBusinessProfile.fulfilled, (s, a) => {
        s.items = s.items.filter((p) => p.id !== a.payload);
      })
      .addCase(uploadBusinessDocument.fulfilled, (s, a) => replace(s, a.payload))
      .addCase(removeBusinessDocument.fulfilled, (s, a) => replace(s, a.payload))
      .addCase(uploadBusinessLogo.fulfilled, (s, a) => replace(s, a.payload))
      .addCase(removeBusinessLogo.fulfilled, (s, a) => replace(s, a.payload))
      .addCase(uploadBusinessCover.fulfilled, (s, a) => replace(s, a.payload))
      .addCase(removeBusinessCover.fulfilled, (s, a) => replace(s, a.payload));
  },
});

export default businessProfileSlice.reducer;
