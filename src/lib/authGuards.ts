import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppSelector } from "@/store/hooks";
import { tokenService } from "./tokenService";

/** Redirect already-authenticated users away from auth screens. */
export function useRequireGuest(redirectTo = "/dashboard") {
  const router = useRouter();
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
  useEffect(() => {
    if (isAuth || tokenService.isAuthenticated()) router.replace(redirectTo);
  }, [isAuth, redirectTo, router]);
}

/** Gate a protected page; bounce guests to /login. Returns readiness flag. */
export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, bootstrapped } = useAppSelector((s) => s.auth);
  // Cookies aren't available during SSR. Gate on a mount flag so the server
  // and the first client render agree (avoids hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasToken = mounted && tokenService.isAuthenticated();

  useEffect(() => {
    if (mounted && !tokenService.isAuthenticated() && bootstrapped && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [mounted, bootstrapped, isAuthenticated, router]);

  return { ready: mounted && (hasToken || isAuthenticated) };
}
