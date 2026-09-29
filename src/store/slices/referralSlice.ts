import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { referralService } from "@/services/referralService";
import { extractError } from "@/lib/axiosClient";
import type { ReferralStats, ReferredUser, RequestStatus } from "@/types";

interface ReferralState {
  referrals: ReferredUser[];
  stats: ReferralStats | null;
  status: RequestStatus;
  error: string | null;
}

const initialState: ReferralState = {
  referrals: [],
  stats: null,
  status: "idle",
  error: null,
};

export const fetchReferrals = createAsyncThunk(
  "referrals/list",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await referralService.myReferrals();
      return {
        referrals: data.data?.referrals || [],
        stats: data.data?.stats || null,
      };
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

const referralSlice = createSlice({
  name: "referrals",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferrals.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchReferrals.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.referrals = a.payload.referrals;
        s.stats = a.payload.stats;
      })
      .addCase(fetchReferrals.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      });
  },
});

export default referralSlice.reducer;
