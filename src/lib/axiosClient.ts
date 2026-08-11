import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { tokenService } from "./tokenService";
import { AUTH_ROUTES } from "@/apiRoutes";
import { API_BASE_URL } from "./config";

export { API_BASE_URL };

/** Routes that must never trigger a refresh-retry loop. */
const NO_REFRESH_PATHS = [
  AUTH_ROUTES.loginInitiate,
  AUTH_ROUTES.loginVerify,
  AUTH_ROUTES.refreshToken,
  AUTH_ROUTES.socialSignin,
  AUTH_ROUTES.initiateRegistration,
  AUTH_ROUTES.completeRegistration,
];

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

/* ---- request: attach bearer token ---- */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenService.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ---- response: transparent refresh on 401 ---- */
let isRefreshing = false;
let queue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = [];

const flushQueue = (error: unknown, token: string | null) => {
  queue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  queue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status;
    const url = original?.url ?? "";

    const refreshable =
      status === 401 &&
      original &&
      !original._retry &&
      !NO_REFRESH_PATHS.some((p) => url.includes(p)) &&
      tokenService.getRefresh();

    if (!refreshable) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token: string) => {
            if (original.headers)
              original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}${AUTH_ROUTES.refreshToken}`,
        { refreshToken: tokenService.getRefresh() },
      );
      const newAccess: string =
        data?.data?.accessToken ?? data?.accessToken ?? "";
      const newRefresh: string | undefined =
        data?.data?.refreshToken ?? data?.refreshToken;

      if (!newAccess) throw new Error("No access token in refresh response");

      tokenService.setTokens(newAccess, newRefresh);
      flushQueue(null, newAccess);

      if (original.headers)
        original.headers.Authorization = `Bearer ${newAccess}`;
      return apiClient(original);
    } catch (err) {
      flushQueue(err, null);
      tokenService.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login?session=expired";
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

/** Normalise backend errors to a readable message. */
export const extractError = (err: unknown): string => {
  const e = err as AxiosError<{ message?: string; error?: string }>;
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    "Something went wrong. Please try again."
  );
};
