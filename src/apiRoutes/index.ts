/**
 * Central registry of every backend endpoint.
 * Swap paths here in one place when the Swagger contract changes.
 * Base URL is configured via NEXT_PUBLIC_API_BASE_URL (see axiosClient).
 */

export const AUTH_ROUTES = {
  socialSignin: "/api/auth/social-signin",
  googleSignin: "/api/auth/google",
  appleSignin: "/api/auth/apple",
  initiateRegistration: "/api/users/initiate-registration",
  verifyEmailOtpRegistration: "/api/users/verify-email-otp-registration",
  checkUsername: "/api/users/check-username",
  completeRegistration: "/api/users/complete-registration",
  resendEmailOtp: "/api/users/resend-email-otp",
  verifyEmailOtp: "/api/users/verify-email-otp",
  loginInitiate: "/api/users/login/initiate",
  loginVerify: "/api/users/login/verify",
  refreshToken: "/api/users/refresh-token",
  logout: "/api/users/logout",
} as const;

export const USER_ROUTES = {
  current: "/api/users/current",
} as const;

export const PROFILE_ROUTES = {
  create: "/api/users/profile/create",
  full: "/api/users/profile/full",
  makePublic: "/api/users/profile/make-public",
  makePrivate: "/api/users/profile/make-private",
  visibility: "/api/users/profile/visibility",
  uploadPicture: "/api/users/profile/upload-picture",
  pdfUrl: "/api/users/profile/pdf-url",
  myResumePdf: "/api/users/profile/my-resume.pdf",
  cardTemplates: "/api/users/profile/card/templates",
  cardPreview: "/api/users/profile/card/preview",
  cardPdf: "/api/users/profile/card.pdf",
} as const;

export const SHARE_ROUTES = {
  create: "/api/share/create",
  links: "/api/share/links",
  update: (id: number | string) => `/api/share/update/${id}`,
  remove: (id: number | string) => `/api/share/${id}`,
  regenerate: (id: number | string) => `/api/share/${id}/regenerate`,
  analytics: (id: number | string) => `/api/share/${id}/analytics`,
  qr: (id: number | string) => `/api/share/${id}/qr`,
  analyticsAll: "/api/share/analytics/all",
} as const;

export const BILLING_ROUTES = {
  plans: "/api/billing/plans",
  subscription: "/api/billing/subscription",
  checkout: "/api/billing/checkout",
  confirm: "/api/billing/confirm",
  cancel: "/api/billing/cancel",
} as const;

export const STUDIO_ROUTES = {
  templates: "/api/studio/templates",
  template: (slug: string) => `/api/studio/templates/${slug}`,
  render: "/api/studio/render",
} as const;

export const ANALYTICS_ROUTES = {
  track: "/api/analytics/track",
  dashboard: "/api/analytics/dashboard",
  recent: "/api/analytics/recent",
} as const;

export const NOTIFICATION_ROUTES = {
  list: "/api/notifications",
  unreadCount: "/api/notifications/unread-count",
  read: (id: number | string) => `/api/notifications/${id}/read`,
  readAll: "/api/notifications/read-all",
} as const;

export const API_ROUTES = {
  ...AUTH_ROUTES,
  ...USER_ROUTES,
} as const;
