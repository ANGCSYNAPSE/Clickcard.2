import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscription } from "@/store/slices/billingSlice";
import type { Entitlement } from "./entitlements";

/**
 * Central entitlement gate. Reads the user's active subscription (loaded once
 * app-wide in Providers) and answers: which plan, which features, which limits.
 * Limits use -1 for "unlimited" (backend convention).
 */
export function useEntitlement() {
  const dispatch = useAppDispatch();
  const { subscription, status } = useAppSelector((s) => s.billing);

  // Self-heal: if a screen needs entitlements before Providers loaded them.
  useEffect(() => {
    if (status === "idle") dispatch(fetchSubscription());
  }, [status, dispatch]);

  const entitlements = subscription?.entitlements ?? [];
  const limits = subscription?.limits ?? { links: 5, cardTemplates: 1 };
  const planId = subscription?.planId ?? "free";

  const has = (e: Entitlement) => entitlements.includes(e);

  /** -1 = unlimited. */
  const limit = (key: keyof typeof limits) => limits[key] ?? 0;

  /** Is `count` still within the plan's limit for `key`? */
  const withinLimit = (key: keyof typeof limits, count: number) => {
    const max = limit(key);
    return max === -1 || count < max;
  };

  return {
    planId,
    planName: subscription?.planName ?? "Free",
    isPaid: planId !== "free",
    loading: status === "loading" && !subscription,
    entitlements,
    limits,
    has,
    limit,
    withinLimit,
  };
}
