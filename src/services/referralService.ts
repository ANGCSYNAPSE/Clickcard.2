import { apiClient } from "@/lib/axiosClient";
import { REFERRAL_ROUTES } from "@/apiRoutes";
import type { ApiResponse, ReferralStats, ReferredUser } from "@/types";

export const referralService = {
  myReferrals: () =>
    apiClient.get<ApiResponse<{ referrals: ReferredUser[]; stats: ReferralStats }>>(
      REFERRAL_ROUTES.my,
    ),
};
