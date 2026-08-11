import { apiClient } from "@/lib/axiosClient";
import { NOTIFICATION_ROUTES } from "@/apiRoutes";
import type { ApiResponse } from "@/types";

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message?: string | null;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  list: () =>
    apiClient.get<ApiResponse<{ items: AppNotification[]; unread: number }>>(
      NOTIFICATION_ROUTES.list,
    ),
  markRead: (id: number) =>
    apiClient.patch<ApiResponse>(NOTIFICATION_ROUTES.read(id)),
  markAllRead: () =>
    apiClient.patch<ApiResponse>(NOTIFICATION_ROUTES.readAll),
};
