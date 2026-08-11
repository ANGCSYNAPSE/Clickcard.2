import { apiClient } from "@/lib/axiosClient";
import { BILLING_ROUTES } from "@/apiRoutes";
import type { ApiResponse } from "@/types";

export interface Vertical {
  id: string;
  name: string;
  tagline: string;
  entitlements: string[];
}
export interface Plan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number; // paise
  priceYearly: number;
  currency: string;
  popular?: boolean;
  limits: { links: number; cardTemplates: number };
  verticals: string[];
  entitlements: string[];
}
export interface Subscription {
  planId: string;
  planName: string;
  status: string;
  billingCycle: string;
  currentPeriodEnd: string | null;
  limits: { links: number; cardTemplates: number };
  verticals: string[];
  entitlements: string[];
}

export interface CheckoutOrder {
  provider: "razorpay" | "stub";
  orderRef: string;
  amount: number;
  currency: string;
  // razorpay-only
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  // stub-only
  confirmToken?: string;
}

export interface ConfirmInput {
  planId: string;
  billingCycle: "monthly" | "yearly";
  orderRef?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

export const billingService = {
  getPlans: () =>
    apiClient.get<
      ApiResponse<{
        plans: Plan[];
        verticals: Vertical[];
        provider?: "razorpay" | "stub";
        razorpayKeyId?: string;
      }>
    >(BILLING_ROUTES.plans),
  getSubscription: () =>
    apiClient.get<ApiResponse<Subscription>>(BILLING_ROUTES.subscription),
  checkout: (planId: string, billingCycle: "monthly" | "yearly") =>
    apiClient.post<ApiResponse<CheckoutOrder>>(BILLING_ROUTES.checkout, {
      planId,
      billingCycle,
    }),
  confirm: (input: ConfirmInput) =>
    apiClient.post<ApiResponse>(BILLING_ROUTES.confirm, input),
  cancel: () => apiClient.post<ApiResponse>(BILLING_ROUTES.cancel),
};
