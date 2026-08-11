import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import { useAppDispatch } from "@/store/hooks";
import { googleSignin, appleSignin } from "@/store/slices/authSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { GOOGLE_CLIENT_ID, APPLE_CLIENT_ID, APPLE_REDIRECT_URI } from "@/lib/config";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: any;
    AppleID?: any;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Real OAuth sign-in via Google Identity Services + Sign in with Apple JS.
 * Falls back to a graceful "not configured" toast when the env client IDs are missing,
 * so the page still renders during dev without throwing.
 */
export default function SocialButtons() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [gsiReady, setGsiReady] = useState(false);
  const [appleReady, setAppleReady] = useState(false);
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);

  // Initialise Apple ID JS once the script loads
  useEffect(() => {
    if (!appleReady || !APPLE_CLIENT_ID || typeof window === "undefined") return;
    try {
      window.AppleID?.auth?.init({
        clientId: APPLE_CLIENT_ID,
        scope: "name email",
        redirectURI: APPLE_REDIRECT_URI,
        usePopup: true,
      });
    } catch (e) {
      console.warn("Apple ID init failed:", e);
    }
  }, [appleReady]);

  const finish = (label: string) => {
    dispatch(pushToast(`Welcome ${label}!`, "success"));
    const redirect = (router.query.redirect as string) || "/dashboard";
    router.replace(redirect);
  };

  const handleGoogle = async () => {
    if (!GOOGLE_CLIENT_ID) {
      dispatch(pushToast("Google sign-in not configured (set NEXT_PUBLIC_GOOGLE_CLIENT_ID).", "info"));
      return;
    }
    if (!gsiReady || !window.google?.accounts?.oauth2) {
      dispatch(pushToast("Google sign-in still loading — try again in a sec.", "info"));
      return;
    }
    setBusy("google");
    try {
      // Use ID-token flow — gives us a verifiable JWT in `credential`.
      const tokenClient = window.google.accounts.id;
      tokenClient.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential?: string }) => {
          if (!response?.credential) {
            dispatch(pushToast("Google sign-in cancelled.", "info"));
            setBusy(null);
            return;
          }
          const referralCode =
            typeof window !== "undefined"
              ? localStorage.getItem("clickcard_ref") || undefined
              : undefined;
          const res = await dispatch(
            googleSignin({ credential: response.credential, referralCode }),
          );
          setBusy(null);
          if (googleSignin.fulfilled.match(res)) finish("aboard");
          else dispatch(pushToast(typeof res.payload === "string" ? res.payload : "Google sign-in failed", "error"));
        },
        ux_mode: "popup",
        auto_select: false,
      });
      tokenClient.prompt();
    } catch (e) {
      console.error(e);
      setBusy(null);
      dispatch(pushToast("Google sign-in failed.", "error"));
    }
  };

  const handleApple = async () => {
    if (!APPLE_CLIENT_ID) {
      dispatch(pushToast("Apple sign-in not configured (set NEXT_PUBLIC_APPLE_CLIENT_ID).", "info"));
      return;
    }
    if (!appleReady || !window.AppleID?.auth) {
      dispatch(pushToast("Apple sign-in still loading — try again in a sec.", "info"));
      return;
    }
    setBusy("apple");
    try {
      const result = await window.AppleID.auth.signIn();
      const credential = result?.authorization?.id_token;
      if (!credential) throw new Error("No Apple id_token returned");
      const name =
        result?.user?.name &&
        [result.user.name.firstName, result.user.name.lastName].filter(Boolean).join(" ");
      const referralCode =
        typeof window !== "undefined"
          ? localStorage.getItem("clickcard_ref") || undefined
          : undefined;
      const res = await dispatch(appleSignin({ credential, name, referralCode }));
      setBusy(null);
      if (appleSignin.fulfilled.match(res)) finish("aboard");
      else dispatch(pushToast(typeof res.payload === "string" ? res.payload : "Apple sign-in failed", "error"));
    } catch (e) {
      console.error(e);
      setBusy(null);
      dispatch(pushToast("Apple sign-in cancelled.", "info"));
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGsiReady(true)}
      />
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        strategy="afterInteractive"
        onLoad={() => setAppleReady(true)}
      />

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy !== null}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-brand-100 bg-white text-sm font-bold text-ink transition hover:bg-brand-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 lg:h-14 lg:text-base"
        >
          <GoogleIcon /> {busy === "google" ? "…" : "Google"}
        </button>
        <button
          type="button"
          onClick={handleApple}
          disabled={busy !== null}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-brand-100 bg-white text-sm font-bold text-ink transition hover:bg-brand-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 lg:h-14 lg:text-base"
        >
          <AppleIcon /> {busy === "apple" ? "…" : "Apple"}
        </button>
      </div>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="fill-current">
      <path d="M16.36 12.78c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.85 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.66zM14.13 6.04c.64-.78 1.07-1.85.95-2.93-.92.04-2.04.61-2.7 1.38-.59.69-1.11 1.79-.97 2.85 1.03.08 2.08-.52 2.72-1.3z" />
    </svg>
  );
}
