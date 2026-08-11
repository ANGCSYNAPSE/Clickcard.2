import { apiClient } from "@/lib/axiosClient";
import { SHARE_ROUTES } from "@/apiRoutes";
import type { ApiResponse, ShareAnalytics, ShareLink } from "@/types";

export interface CreateShareInput {
  custom_slug?: string;
  expiry_days?: number;
  requires_password?: boolean;
  share_password?: string;
}

export interface UpdateShareInput {
  custom_slug?: string;
  is_active?: boolean;
  expiry_date?: string;
  requires_password?: boolean;
  share_password?: string;
}

export const shareService = {
  create: (input: CreateShareInput) =>
    apiClient.post<ApiResponse<ShareLink>>(SHARE_ROUTES.create, input),

  list: () => apiClient.get<ApiResponse<ShareLink[]>>(SHARE_ROUTES.links),

  update: (id: number, input: UpdateShareInput) =>
    apiClient.post<ApiResponse<ShareLink>>(SHARE_ROUTES.update(id), input),

  remove: (id: number) =>
    apiClient.delete<ApiResponse>(SHARE_ROUTES.remove(id)),

  regenerate: (id: number) =>
    apiClient.post<ApiResponse<ShareLink>>(SHARE_ROUTES.regenerate(id)),

  analytics: (id: number) =>
    apiClient.get<ApiResponse<ShareAnalytics>>(SHARE_ROUTES.analytics(id)),

  qr: (id: number) =>
    apiClient.get<ApiResponse<{ qr_code: string }>>(SHARE_ROUTES.qr(id)),

  analyticsAll: () =>
    apiClient.get<ApiResponse<ShareAnalytics>>(SHARE_ROUTES.analyticsAll),
};
