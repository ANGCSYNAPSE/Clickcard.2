import Cookies from "js-cookie";

/**
 * Single source of truth for auth tokens.
 * Stored in cookies (so SSR/middleware can read them) with sane security flags.
 */

const ACCESS_KEY = "cc_access";
const REFRESH_KEY = "cc_refresh";

const isProd = process.env.NODE_ENV === "production";

const cookieOpts: Cookies.CookieAttributes = {
  secure: isProd,
  sameSite: "lax",
  expires: 7,
  path: "/",
};

export const tokenService = {
  getAccess: () => Cookies.get(ACCESS_KEY) ?? null,
  getRefresh: () => Cookies.get(REFRESH_KEY) ?? null,

  setTokens: (accessToken?: string | null, refreshToken?: string | null) => {
    if (accessToken) Cookies.set(ACCESS_KEY, accessToken, cookieOpts);
    if (refreshToken)
      Cookies.set(REFRESH_KEY, refreshToken, { ...cookieOpts, expires: 30 });
  },

  clear: () => {
    Cookies.remove(ACCESS_KEY, { path: "/" });
    Cookies.remove(REFRESH_KEY, { path: "/" });
  },

  isAuthenticated: () => Boolean(Cookies.get(ACCESS_KEY)),
};
