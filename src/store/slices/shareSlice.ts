import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  shareService,
  CreateShareInput,
  UpdateShareInput,
} from "@/services/shareService";
import { extractError } from "@/lib/axiosClient";
import type { RequestStatus, ShareAnalytics, ShareLink } from "@/types";

interface ShareState {
  links: ShareLink[];
  totals: ShareAnalytics | null;
  status: RequestStatus;
  mutating: boolean;
  error: string | null;
}

const initialState: ShareState = {
  links: [],
  totals: null,
  status: "idle",
  mutating: false,
  error: null,
};

export const fetchShareLinks = createAsyncThunk(
  "share/list",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await shareService.list();
      return data.data ?? [];
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const createShareLink = createAsyncThunk(
  "share/create",
  async (input: CreateShareInput, { rejectWithValue }) => {
    try {
      const { data } = await shareService.create(input);
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const updateShareLink = createAsyncThunk(
  "share/update",
  async (
    { id, input }: { id: number; input: UpdateShareInput },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await shareService.update(id, input);
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const deleteShareLink = createAsyncThunk(
  "share/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await shareService.remove(id);
      return id;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const fetchShareTotals = createAsyncThunk(
  "share/totals",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await shareService.analyticsAll();
      return data.data ?? null;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

const shareSlice = createSlice({
  name: "share",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShareLinks.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchShareLinks.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.links = a.payload;
      })
      .addCase(fetchShareLinks.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(createShareLink.pending, (s) => {
        s.mutating = true;
      })
      .addCase(createShareLink.fulfilled, (s, a) => {
        s.mutating = false;
        s.links.unshift(a.payload);
      })
      .addCase(createShareLink.rejected, (s, a) => {
        s.mutating = false;
        s.error = a.payload as string;
      })
      .addCase(updateShareLink.fulfilled, (s, a) => {
        const i = s.links.findIndex((l) => l.id === a.payload.id);
        if (i !== -1) s.links[i] = a.payload;
      })
      .addCase(deleteShareLink.fulfilled, (s, a) => {
        s.links = s.links.filter((l) => l.id !== a.payload);
      })
      .addCase(fetchShareTotals.fulfilled, (s, a) => {
        s.totals = a.payload;
      });
  },
});

export default shareSlice.reducer;
