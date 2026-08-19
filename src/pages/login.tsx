import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import { Mail, ArrowLeft, Home } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import SocialButtons from "@/components/auth/SocialButtons";
import SplitButton from "@/components/auth/SplitButton";
import { AUTH_FIELD_CLASS } from "@/components/auth/fieldClass";
import Input from "@/components/ui/Input";
import OtpInput from "@/components/ui/OtpInput";
import { credentialSchema } from "@/lib/validation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginInitiate, loginVerify, clearAuthError } from "@/store/slices/authSlice";
import { pushToast } from "@/store/slices/uiSlice";
import { useRequireGuest } from "@/lib/authGuards";
import { SITE_URL } from "@/lib/config";

export default function LoginPage() {
  useRequireGuest();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);

  const [stage, setStage] = useState<"credential" | "otp">("credential");
  const [credential, setCredential] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Start (or restart) a 1-minute cooldown every time the OTP stage becomes
  // active — a code was just sent, so resend has nothing new to offer yet.
  useEffect(() => {
    if (stage === "otp") setResendCooldown(60);
  }, [stage]);

  // Self-scheduling countdown — ticks once a second until it hits 0.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (router.query.session === "expired") {
      dispatch(pushToast("Your session expired. Please sign in again.", "info"));
    }
  }, [router.query.session, dispatch]);

  // Show error as top-right toast whenever auth error changes
  useEffect(() => {
    if (error) {
      dispatch(pushToast(error, "error"));
    }
  }, [error, dispatch]);

  const form = useFormik({
    initialValues: { credential: "" },
    validationSchema: credentialSchema,
    onSubmit: async (values) => {
      const res = await dispatch(loginInitiate(values.credential.trim()));
      if (loginInitiate.fulfilled.match(res)) {
        setCredential(values.credential.trim());
        setStage("otp");
        dispatch(pushToast("We sent a 6-digit code to your email.", "success"));
      }
    },
  });

  const resend = async () => {
    if (resendCooldown > 0) return;
    const res = await dispatch(loginInitiate(credential));
    if (loginInitiate.fulfilled.match(res)) {
      dispatch(pushToast("New code sent.", "info"));
      setResendCooldown(60);
    }
  };

  const verify = async () => {
    const res = await dispatch(loginVerify({ credential, otp }));
    if (loginVerify.fulfilled.match(res)) {
      dispatch(pushToast("Welcome back!", "success"));
      const redirect = (router.query.redirect as string) || "/dashboard";
      router.replace(redirect);
    }
  };

  return (
    <>
      <Head>
        <title>Log in · ClickCard</title>
        <meta name="robots" content="noindex" />
      </Head>
      {/* Back to home button */}
      <Link href={SITE_URL} className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink/60 transition hover:bg-ink/5 hover:text-ink dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white">
        <ArrowLeft size={16} />
        Back
      </Link>
      <AuthShell
        title={stage === "credential" ? "Welcome back" : "Enter your code"}
        subtitle={
          stage === "credential"
            ? "Sign in with a one-time code — no password needed."
            : `We sent a 6-digit code to ${credential}.`
        }
        pageLabel="Log In"
        navLink={{ label: "Sign up", href: "/signup" }}
        onBack={stage === "otp" ? () => { setStage("credential"); setOtp(""); dispatch(clearAuthError()); } : undefined}
      >
        {stage === "credential" ? (
          <>
            <form onSubmit={form.handleSubmit} className="space-y-4 lg:space-y-5">
              <Input
                name="credential"
                placeholder="you@example.com or username"
                className={AUTH_FIELD_CLASS}
                leftIcon={<Mail size={18} />}
                value={form.values.credential}
                onChange={(e) => {
                  form.handleChange(e);
                  if (error) dispatch(clearAuthError());
                }}
                onBlur={form.handleBlur}
                error={form.touched.credential && form.errors.credential}
                autoComplete="username"
                autoFocus
              />

              <SplitButton type="submit" loading={status === "loading"}>
                Send code
              </SplitButton>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase text-ink/30 dark:text-white/30 lg:my-7 lg:text-[13px]">
              <span className="h-px flex-1 bg-ink/10 dark:bg-white/10" />
              or
              <span className="h-px flex-1 bg-ink/10 dark:bg-white/10" />
            </div>
            <SocialButtons />

            <p className="mt-7 text-center text-sm text-ink/60 dark:text-white/60 lg:mt-8 lg:text-base">
              New to ClickCard?{" "}
              <Link
                href="/signup"
                className="font-bold text-brand-500 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </>
        ) : (
          <div className="space-y-5 lg:space-y-6">
            <OtpInput value={otp} onChange={setOtp} error={!!error} />

            <SplitButton
              loading={status === "loading"}
              disabled={otp.length !== 6}
              onClick={verify}
            >
              Verify & sign in
            </SplitButton>
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setStage("credential");
                  setOtp("");
                  dispatch(clearAuthError());
                }}
                className="flex items-center gap-1.5 text-sm font-semibold text-ink/60 transition hover:text-brand-600 dark:text-white/60 lg:text-base"
              >
                <ArrowLeft size={15} /> Use a different account
              </button>
              <button
                onClick={resend}
                disabled={resendCooldown > 0}
                className={`text-sm font-bold lg:text-base ${
                  resendCooldown > 0
                    ? "cursor-not-allowed text-ink/35 dark:text-white/35"
                    : "text-brand-500 hover:underline"
                }`}
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
              </button>
            </div>
          </div>
        )}
      </AuthShell>
    </>
  );
}
