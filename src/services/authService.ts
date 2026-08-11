import { apiClient } from "@/lib/axiosClient";
import { AUTH_ROUTES, USER_ROUTES } from "@/apiRoutes";
import type {
  ApiResponse,
  AuthUser,
  CurrentUser,
  SocialSigninPayload,
} from "@/types";

export const authService = {
  /* ----- registration (4 steps) ----- */
  initiateRegistration: (email: string) =>
    apiClient.post<ApiResponse<{ email: string }>>(
      AUTH_ROUTES.initiateRegistration,
      { email },
    ),

  verifyRegistrationOtp: (email: string, otp: string) =>
    apiClient.post<ApiResponse<{ email: string; verified: boolean }>>(
      AUTH_ROUTES.verifyEmailOtpRegistration,
      { email, otp },
    ),

  checkUsername: (username: string) =>
    apiClient.post<ApiResponse<{ available: boolean }>>(
      AUTH_ROUTES.checkUsername,
      { username },
    ),

  completeRegistration: (
    email: string,
    username: string,
    referralCode?: string,
  ) =>
    apiClient.post<ApiResponse<AuthUser>>(AUTH_ROUTES.completeRegistration, {
      email,
      username,
      ...(referralCode ? { referralCode } : {}),
    }),

  resendOtp: (email: string) =>
    apiClient.post<ApiResponse>(AUTH_ROUTES.resendEmailOtp, { email }),

  /* ----- login (passwordless OTP) ----- */
  loginInitiate: (credential: string) =>
    apiClient.post<ApiResponse>(AUTH_ROUTES.loginInitiate, { credential }),

  loginVerify: (credential: string, otp: string) =>
    apiClient.post<ApiResponse<AuthUser>>(AUTH_ROUTES.loginVerify, {
      credential,
      otp,
    }),

  /* ----- existing-user email OTP (e.g. password reset) ----- */
  verifyEmailOtp: (email: string, otp: string) =>
    apiClient.post<ApiResponse<AuthUser>>(AUTH_ROUTES.verifyEmailOtp, {
      email,
      otp,
    }),

  /* ----- social ----- */
  socialSignin: (payload: SocialSigninPayload) =>
    apiClient.post<ApiResponse<AuthUser>>(AUTH_ROUTES.socialSignin, payload),

  /** Server-verified Google ID token sign-in (or auto-register). */
  googleSignin: (credential: string, opts?: { referralCode?: string; deviceId?: string }) =>
    apiClient.post<ApiResponse<AuthUser>>(AUTH_ROUTES.googleSignin, {
      credential,
      ...opts,
    }),

  /** Server-verified Apple ID token sign-in (or auto-register). */
  appleSignin: (credential: string, opts?: { name?: string; referralCode?: string; deviceId?: string }) =>
    apiClient.post<ApiResponse<AuthUser>>(AUTH_ROUTES.appleSignin, {
      credential,
      ...opts,
    }),

  /* ----- session ----- */
  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthUser>>(AUTH_ROUTES.refreshToken, {
      refreshToken,
    }),

  logout: () => apiClient.post<ApiResponse>(AUTH_ROUTES.logout),

  currentUser: () =>
    apiClient.get<ApiResponse<CurrentUser>>(USER_ROUTES.current),
};
