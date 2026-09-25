import { apiClient } from "@/lib/axiosClient";
import { QR_DESIGN_ROUTES } from "@/apiRoutes";
import type { ApiResponse } from "@/types";
import type { QrDesignSettings } from "@/lib/qrStyling";

export const qrDesignService = {
  getMine: () =>
    apiClient.get<ApiResponse<{ settings: QrDesignSettings | null; updatedAt: string | null }>>(
      QR_DESIGN_ROUTES.mine,
    ),

  saveMine: (settings: QrDesignSettings) =>
    apiClient.put<ApiResponse<{ settings: QrDesignSettings; updatedAt: string }>>(
      QR_DESIGN_ROUTES.mine,
      { settings },
    ),
};
