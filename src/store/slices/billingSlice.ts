import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  billingService,
  Plan,
  Vertical,
  Subscription,
} from "@/services/billingService";
import { extractError } from "@/lib/axiosClient";
import type { RequestStatus } from "@/types";

interface BillingState {
  plans: Plan[];
  verticals: Vertical[];
  subscription: Subscription | null;
  status: RequestStatus;
  upgrading: string | null; // planId being purchased
  error: string | null;
}

const initialState: BillingState = {
  plans: [],
  verticals: [],
  subscription: null,
  status: "idle",
  upgrading: null,
  error: null,
};

export const fetchPlans = createAsyncThunk(
  "billing/plans",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await billingService.getPlans();
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

export const fetchSubscription = createAsyncThunk(
  "billing/subscription",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await billingService.getSubscription();
      return data.data!;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

/**
 * Full purchase flow.
 * - razorpay: open Razorpay Checkout, capture payment_id/signature, confirm.
 * - stub:     checkout → confirm immediately (dev mode).
 */
export const upgradePlan = createAsyncThunk(
  "billing/upgrade",
  async (
    {
      planId,
      billingCycle,
      userEmail,
      userName,
    }: {
      planId: string;
      billingCycle: "monthly" | "yearly";
      userEmail?: string;
      userName?: string;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const { data } = await billingService.checkout(planId, billingCycle);
      const order = data.data!;

      if (order.provider === "razorpay") {
        await ensureRazorpayLoaded();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        const result = await new Promise<{
          payment_id: string;
          order_id: string;
          signature: string;
        }>((resolve, reject) => {
          const rzp = new w.Razorpay({
            key: order.razorpayKeyId,
            amount: order.amount,
            currency: order.currency,
            order_id: order.razorpayOrderId,
            name: "ClickCard",
            description: `Upgrade to ${planId.toUpperCase()} (${billingCycle})`,
            prefill: { email: userEmail || "", name: userName || "" },
            theme: { color: "#6E2BFF" },
            handler: (res: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature: string;
            }) =>
              resolve({
                payment_id: res.razorpay_payment_id,
                order_id: res.razorpay_order_id,
                signature: res.razorpay_signature,
              }),
            modal: {
              ondismiss: () => reject(new Error("Payment cancelled")),
            },
          });
          rzp.on(
            "payment.failed",
            (e: { error: { description: string } }) =>
              reject(new Error(e.error?.description || "Payment failed")),
          );
          rzp.open();
        });

        await billingService.confirm({
          planId,
          billingCycle,
          orderRef: order.orderRef,
          razorpayPaymentId: result.payment_id,
          razorpayOrderId: result.order_id,
          razorpaySignature: result.signature,
        });
      } else {
        // stub provider
        await billingService.confirm({
          planId,
          billingCycle,
          orderRef: order.orderRef,
        });
      }

      await dispatch(fetchSubscription());
      return planId;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

function ensureRazorpayLoaded(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });
}

export const cancelPlan = createAsyncThunk(
  "billing/cancel",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await billingService.cancel();
      await dispatch(fetchSubscription());
      return true;
    } catch (e) {
      return rejectWithValue(extractError(e));
    }
  },
);

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPlans.pending, (s) => {
      s.status = "loading";
    })
      .addCase(fetchPlans.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.plans = a.payload.plans;
        s.verticals = a.payload.verticals;
      })
      .addCase(fetchPlans.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload as string;
      })
      .addCase(fetchSubscription.fulfilled, (s, a) => {
        s.subscription = a.payload;
      })
      .addCase(upgradePlan.pending, (s, a) => {
        s.upgrading = a.meta.arg.planId;
      })
      .addCase(upgradePlan.fulfilled, (s) => {
        s.upgrading = null;
      })
      .addCase(upgradePlan.rejected, (s, a) => {
        s.upgrading = null;
        s.error = a.payload as string;
      });
  },
});

export default billingSlice.reducer;
