import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  analyticsService,
  DashboardAnalytics,
  RecentEvent,
} from "@/services/analyticsService";
import { extractError } from "@/lib/axiosClient";
import type { RequestStatus } from "@/types";

interface AnalyticsState {
  dashboard: DashboardAnalytics | null;
  recent: RecentEvent[];
  status: RequestStatus;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboard: null,
  recent: [],
  status: "idle",
  error: null,
};

export const fetchDashboardAnalytics = createAsyncThunk(
  "analytics/dashboard",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await analyticsService.dashboard();
      return data.data ?? null;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const fetchRecentEvents = createAsyncThunk(
  "analytics/recent",
  async (limit: number | undefined, { rejectWithValue }) => {
    try {
      const { data } = await analyticsService.recent(limit ?? 20);
      return data.data ?? [];
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardAnalytics.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.dashboard = a.payload;
      })
      .addCase(fetchDashboardAnalytics.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(fetchRecentEvents.fulfilled, (s, a) => {
        s.recent = a.payload;
      });
  },
});

export default analyticsSlice.reducer;
