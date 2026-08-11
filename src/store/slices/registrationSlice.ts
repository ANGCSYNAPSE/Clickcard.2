import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "@/services/authService";
import { tokenService } from "@/lib/tokenService";
import { extractError } from "@/lib/axiosClient";
import type { AuthUser, RequestStatus } from "@/types";

export type RegistrationStep = "email" | "otp" | "username" | "done";

interface RegistrationState {
  step: RegistrationStep;
  email: string;
  username: string;
  referralCode: string;
  usernameAvailable: boolean | null;
  checkingUsername: boolean;
  status: RequestStatus;
  error: string | null;
}

const initialState: RegistrationState = {
  step: "email",
  email: "",
  username: "",
  referralCode: "",
  usernameAvailable: null,
  checkingUsername: false,
  status: "idle",
  error: null,
};

export const initiateRegistration = createAsyncThunk(
  "registration/initiate",
  async (email: string, { rejectWithValue }) => {
    try {
      await authService.initiateRegistration(email);
      return email;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const verifyRegistrationOtp = createAsyncThunk(
  "registration/verifyOtp",
  async (
    { email, otp }: { email: string; otp: string },
    { rejectWithValue },
  ) => {
    try {
      await authService.verifyRegistrationOtp(email, otp);
      return true;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const checkUsername = createAsyncThunk(
  "registration/checkUsername",
  async (username: string, { rejectWithValue }) => {
    try {
      const { data } = await authService.checkUsername(username);
      return Boolean(data.data?.available);
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const completeRegistration = createAsyncThunk(
  "registration/complete",
  async (
    {
      email,
      username,
      referralCode,
    }: { email: string; username: string; referralCode?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await authService.completeRegistration(
        email,
        username,
        referralCode,
      );
      const auth = data.data as AuthUser | undefined;
      if (auth?.accessToken) tokenService.setTokens(auth.accessToken, auth.refreshToken);
      return auth ?? null;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const resendRegistrationOtp = createAsyncThunk(
  "registration/resendOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      await authService.resendOtp(email);
      return true;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

const registrationSlice = createSlice({
  name: "registration",
  initialState,
  reducers: {
    setReferralCode: (state, action) => {
      state.referralCode = action.payload;
    },
    setUsernameDraft: (state, action) => {
      state.username = action.payload;
      state.usernameAvailable = null;
    },
    goToStep: (state, action) => {
      state.step = action.payload;
    },
    resetRegistration: () => initialState,
    clearRegistrationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initiateRegistration.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(initiateRegistration.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.email = a.payload;
        s.step = "otp";
      })
      .addCase(initiateRegistration.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(verifyRegistrationOtp.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(verifyRegistrationOtp.fulfilled, (s) => {
        s.status = "succeeded";
        s.step = "username";
      })
      .addCase(verifyRegistrationOtp.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(checkUsername.pending, (s) => {
        s.checkingUsername = true;
        s.error = null;
      })
      .addCase(checkUsername.fulfilled, (s, a) => {
        s.checkingUsername = false;
        s.usernameAvailable = a.payload;
      })
      .addCase(checkUsername.rejected, (s, a) => {
        s.checkingUsername = false;
        s.usernameAvailable = false;
        s.error = a.payload as string;
      })
      .addCase(completeRegistration.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(completeRegistration.fulfilled, (s) => {
        s.status = "succeeded";
        s.step = "done";
      })
      .addCase(completeRegistration.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      });
  },
});

export const {
  setReferralCode,
  setUsernameDraft,
  goToStep,
  resetRegistration,
  clearRegistrationError,
} = registrationSlice.actions;
export default registrationSlice.reducer;
