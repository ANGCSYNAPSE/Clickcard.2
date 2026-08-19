import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import {
  Mail,
  ArrowLeft,
  AtSign,
  Gift,
  Check,
  Loader2,
  PartyPopper,
} from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import SocialButtons from "@/components/auth/SocialButtons";
import SplitButton from "@/components/auth/SplitButton";
import Input from "@/components/ui/Input";
import { AUTH_FIELD_CLASS } from "@/components/auth/fieldClass";
import OtpInput from "@/components/ui/OtpInput";
import { emailSchema, usernameSchema, USERNAME_REGEX } from "@/lib/validation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { pushToast } from "@/store/slices/uiSlice";
import {
  initiateRegistration,
  verifyRegistrationOtp,
  checkUsername,
  completeRegistration,
  resendRegistrationOtp,
  setUsernameDraft,
  goToStep,
  clearRegistrationError,
} from "@/store/slices/registrationSlice";
import { useRequireGuest } from "@/lib/authGuards";
import { SITE_URL } from "@/lib/config";

const STEPS = ["email", "otp", "username"] as const;

export default function SignupPage() {
  useRequireGuest();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reg = useAppSelector((s) => s.registration);
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Start (or restart) a 1-minute cooldown every time the OTP step becomes
  // active — a code was just sent, so resend has nothing new to offer yet.
  useEffect(() => {
    if (reg.step === "otp") setResendCooldown(60);
  }, [reg.step]);

  // Self-scheduling countdown — ticks once a second until it hits 0.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const stepIndex = Math.min(STEPS.indexOf(reg.step as never), 2);

  // Show registration errors as top-right toast
  useEffect(() => {
    if (reg.error) {
      dispatch(pushToast(reg.error, "error"));
    }
  }, [reg.error, dispatch]);

  /* ---- step 1: email ---- */
  const emailForm = useFormik({
    initialValues: { email: "" },
    validationSchema: emailSchema,
    onSubmit: async (v) => {
      const res = await dispatch(initiateRegistration(v.email.trim()));
      if (initiateRegistration.fulfilled.match(res)) {
        dispatch(pushToast("Verification code sent to your email.", "success"));
      }
    },
  });

  /* ---- step 3: username ---- */
  const userForm = useFormik({
    initialValues: { username: "", referralCode: "" },
    validationSchema: usernameSchema,
    onSubmit: async (v) => {
      const res = await dispatch(
        completeRegistration({
          email: reg.email,
          username: v.username.trim(),
          referralCode: v.referralCode.trim() || undefined,
        }),
      );
      if (completeRegistration.fulfilled.match(res)) {
        dispatch(pushToast("🎉 Your ClickCard is live!", "success"));
      }
    },
  });

  /* debounced username availability check */
  useEffect(() => {
    const u = userForm.values.username.trim();
    if (!USERNAME_REGEX.test(u)) return;
    dispatch(setUsernameDraft(u));
    const t = setTimeout(() => dispatch(checkUsername(u)), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userForm.values.username]);

  /* prefill referral from ?ref= */
  useEffect(() => {
    const ref = router.query.ref as string;
    if (ref) userForm.setFieldValue("referralCode", ref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.ref]);

  /* redirect after success */
  useEffect(() => {
    if (reg.step === "done") {
      const t = setTimeout(() => router.replace("/dashboard"), 1400);
      return () => clearTimeout(t);
    }
  }, [reg.step, router]);

  const verifyOtp = async () => {
    const res = await dispatch(
      verifyRegistrationOtp({ email: reg.email, otp }),
    );
    if (verifyRegistrationOtp.fulfilled.match(res)) {
      dispatch(pushToast("Email verified! Pick your handle.", "success"));
    }
  };

  if (reg.step === "done") {
    return (
      <AuthShell title="You're all set!" subtitle="Taking you to your dashboard…">
        <div className="flex flex-col items-center gap-4 py-6 text-center lg:gap-5 lg:py-8">
          <span className="grid h-20 w-20 place-items-center rounded-3xl bg-brand-500 text-white shadow-soft animate-float lg:h-24 lg:w-24">
            <PartyPopper size={36} />
          </span>
          <p className="font-display text-xl font-bold text-ink dark:text-white lg:text-2xl">
            clickcard.app/{reg.username}
          </p>
          <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
        </div>
      </AuthShell>
    );
  }

  return (
    <>
      <Head>
        <title>Create your ClickCard</title>
        <meta name="robots" content="noindex" />
      </Head>
      {/* Back to home button */}
      <Link href={SITE_URL} className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink/60 transition hover:bg-ink/5 hover:text-ink dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white">
        <ArrowLeft size={16} />
        Back
      </Link>
      <AuthShell
        title="Create your ClickCard"
        subtitle="Claim your link in under a minute."
        pageLabel="Sign Up"
        navLink={{ label: "Log in", href: "/login" }}
        onBack={
          reg.step === "otp"
            ? () => { dispatch(goToStep("email")); setOtp(""); dispatch(clearRegistrationError()); }
            : reg.step === "username"
            ? () => { dispatch(goToStep("otp")); dispatch(clearRegistrationError()); }
            : undefined
        }
      >
        {/* progress */}
        <div className="mb-7 flex items-center gap-2 lg:mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all lg:h-2 ${
                i <= stepIndex
                  ? "bg-brand-500"
                  : "bg-ink/10 dark:bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* STEP 1 — EMAIL */}
        {reg.step === "email" && (
          <>
            <form onSubmit={emailForm.handleSubmit} className="space-y-4 lg:space-y-5">
              <Input
                name="email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                className={AUTH_FIELD_CLASS}
                leftIcon={<Mail size={18} />}
                value={emailForm.values.email}
                onChange={(e) => {
                  emailForm.handleChange(e);
                  if (reg.error) dispatch(clearRegistrationError());
                }}
                onBlur={emailForm.handleBlur}
                error={emailForm.touched.email && emailForm.errors.email}
                autoFocus
              />

              <SplitButton type="submit" loading={reg.status === "loading"}>
                Continue
              </SplitButton>
            </form>
            <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase text-ink/30 dark:text-white/30 lg:my-7 lg:text-[13px]">
              <span className="h-px flex-1 bg-ink/10 dark:bg-white/10" />
              or
              <span className="h-px flex-1 bg-ink/10 dark:bg-white/10" />
            </div>
            <SocialButtons />
            <p className="mt-7 text-center text-sm text-ink/60 dark:text-white/60 lg:mt-8 lg:text-base">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-brand-500 hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}

        {/* STEP 2 — OTP */}
        {reg.step === "otp" && (
          <div className="space-y-5 lg:space-y-6">
            <p className="text-sm text-ink/60 dark:text-white/60 lg:text-base">
              Enter the 6-digit code sent to{" "}
              <span className="font-bold text-ink dark:text-white">
                {reg.email}
              </span>
              .
            </p>
            <OtpInput value={otp} onChange={setOtp} error={!!reg.error} />

            <SplitButton
              loading={reg.status === "loading"}
              disabled={otp.length !== 6}
              onClick={verifyOtp}
            >
              Verify email
            </SplitButton>
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  dispatch(goToStep("email"));
                  setOtp("");
                  dispatch(clearRegistrationError());
                }}
                className="flex items-center gap-1.5 text-sm font-semibold text-ink/60 transition hover:text-brand-600 dark:text-white/60 lg:text-base"
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                onClick={() => {
                  if (resendCooldown > 0) return;
                  dispatch(resendRegistrationOtp(reg.email));
                  dispatch(pushToast("New code sent.", "info"));
                  setResendCooldown(60);
                }}
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

        {/* STEP 3 — USERNAME */}
        {reg.step === "username" && (
          <form onSubmit={userForm.handleSubmit} className="space-y-4 lg:space-y-5">
            <Input
              name="username"
              label="Claim your link"
              placeholder="yourname"
              className={AUTH_FIELD_CLASS}
              leftIcon={<AtSign size={18} />}
              value={userForm.values.username}
              onChange={userForm.handleChange}
              onBlur={userForm.handleBlur}
              error={userForm.touched.username && userForm.errors.username}
              hint="clickcard.app/yourname"
              rightSlot={<UsernameStatus />}
              autoFocus
            />
            <Input
              name="referralCode"
              label="Referral code (optional)"
              placeholder="CC-ABC123"
              className={AUTH_FIELD_CLASS}
              leftIcon={<Gift size={18} />}
              value={userForm.values.referralCode}
              onChange={userForm.handleChange}
            />


            <SplitButton
              type="submit"
              loading={reg.status === "loading"}
              disabled={reg.usernameAvailable === false}
            >
              Create my ClickCard
            </SplitButton>
          </form>
        )}
      </AuthShell>
    </>
  );
}

function UsernameStatus() {
  const { checkingUsername, usernameAvailable } = useAppSelector(
    (s) => s.registration,
  );
  if (checkingUsername)
    return <Loader2 className="h-4 w-4 animate-spin text-ink/40" />;
  if (usernameAvailable === true)
    return <Check className="h-5 w-5 text-candy-pink" />;
  if (usernameAvailable === false)
    return <span className="text-xs font-bold text-rose-500">taken</span>;
  return null;
}
