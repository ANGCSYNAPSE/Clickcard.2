import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "@/services/authService";
import { tokenService } from "@/lib/tokenService";
import { extractError } from "@/lib/axiosClient";
import type {
  AuthUser,
  CurrentUser,
  RequestStatus,
  SocialSigninPayload,
} from "@/types";

interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  status: RequestStatus;
  error: string | null;
  bootstrapped: boolean; // have we attempted to restore the session?
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
  bootstrapped: false,
};

const persist = (auth: AuthUser) =>
  tokenService.setTokens(auth.accessToken, auth.refreshToken);

/* -------- thunks -------- */

export const loginInitiate = createAsyncThunk(
  "auth/loginInitiate",
  async (credential: string, { rejectWithValue }) => {
    try {
      await authService.loginInitiate(credential);
      return credential;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const loginVerify = createAsyncThunk(
  "auth/loginVerify",
  async (
    { credential, otp }: { credential: string; otp: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await authService.loginVerify(credential, otp);
      const auth = data.data!;
      persist(auth);
      return auth;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const socialSignin = createAsyncThunk(
  "auth/socialSignin",
  async (payload: SocialSigninPayload, { rejectWithValue }) => {
    try {
      const { data } = await authService.socialSignin(payload);
      const auth = data.data!;
      persist(auth);
      return auth;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const googleSignin = createAsyncThunk(
  "auth/googleSignin",
  async (
    { credential, referralCode }: { credential: string; referralCode?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await authService.googleSignin(credential, { referralCode });
      const auth = data.data!;
      persist(auth);
      return auth;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const appleSignin = createAsyncThunk(
  "auth/appleSignin",
  async (
    { credential, name, referralCode }: { credential: string; name?: string; referralCode?: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await authService.appleSignin(credential, { name, referralCode });
      const auth = data.data!;
      persist(auth);
      return auth;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/current",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authService.currentUser();
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
  } catch {
    /* best-effort; we clear locally regardless */
  }
  tokenService.clear();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Called once on app boot to reflect whether a token exists. */
    sessionRestored: (state) => {
      const hasToken = tokenService.isAuthenticated();
      state.isAuthenticated = hasToken;
      // No token → nothing to fetch, bootstrap is already complete (lets
      // guards redirect guests instead of hanging on a spinner).
      if (!hasToken) state.bootstrapped = true;
    },
    setAuthFromTokens: (state, action: PayloadAction<AuthUser>) => {
      persist(action.payload);
      state.isAuthenticated = true;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginVerify.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(loginVerify.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.isAuthenticated = true;
        s.user = { email: a.payload.email, username: a.payload.username };
      })
      .addCase(loginVerify.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(socialSignin.fulfilled, (s, a) => {
        s.isAuthenticated = true;
        s.user = { email: a.payload.email, username: a.payload.username };
      })
      .addCase(socialSignin.rejected, (s, a) => {
        s.error = a.payload as string;
      })
      .addCase(googleSignin.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(googleSignin.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.isAuthenticated = true;
        s.user = { email: a.payload.email, username: a.payload.username };
      })
      .addCase(googleSignin.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(appleSignin.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(appleSignin.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.isAuthenticated = true;
        s.user = { email: a.payload.email, username: a.payload.username };
      })
      .addCase(appleSignin.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(fetchCurrentUser.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.user = a.payload;
        s.isAuthenticated = true;
        s.bootstrapped = true;
      })
      .addCase(fetchCurrentUser.rejected, (s) => {
        s.status = "failed";
        s.user = null;
        s.isAuthenticated = false;
        s.bootstrapped = true;
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.isAuthenticated = false;
        s.status = "idle";
      });
  },
});

export const { sessionRestored, setAuthFromTokens, clearAuthError } =
  authSlice.actions;
export default authSlice.reducer;
