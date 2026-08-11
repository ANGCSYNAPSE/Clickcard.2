import axios from "axios";
import { apiClient } from "@/lib/axiosClient";
import { ANALYTICS_ROUTES } from "@/apiRoutes";
import type { ApiResponse } from "@/types";

export type AnalyticsEventType =
  | "profile_view"
  | "link_tap"
  | "pdf_download"
  | "card_share";

export interface TrackPayload {
  type: AnalyticsEventType;
  slug?: string;
  userId?: number;
  linkKey?: string;
  meta?: Record<string, unknown>;
}

export interface DashboardTrendPoint {
  date: string;
  profile_views: number;
  link_taps: number;
  pdf_downloads: number;
}

export interface DashboardAnalytics {
  totals: {
    profileViews: number;
    linkTaps: number;
    pdfDownloads: number;
    cardShares: number;
    activeLinks: number;
  };
  today: {
    profileViews: number;
    linkTaps: number;
    pdfDownloads: number;
  };
  trend: DashboardTrendPoint[];
}

export interface RecentEvent {
  id: number;
  type: AnalyticsEventType;
  slug: string | null;
  link_key: string | null;
  device_type: string | null;
  platform: string | null;
  referrer_source: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

export const analyticsService = {
  dashboard: () =>
    apiClient.get<ApiResponse<DashboardAnalytics>>(ANALYTICS_ROUTES.dashboard),

  recent: (limit = 20) =>
    apiClient.get<ApiResponse<RecentEvent[]>>(
      `${ANALYTICS_ROUTES.recent}?limit=${limit}`,
    ),

  // Public track endpoint — no auth header to avoid sending a stale token.
  track: (payload: TrackPayload) => {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://clickcard-backend.vercel.app";
    return axios.post<ApiResponse<{ recorded: boolean }>>(
      `${base}${ANALYTICS_ROUTES.track}`,
      payload,
      { timeout: 5000 },
    );
  },
};
