import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Globe, Lock, LogOut, Mail, AtSign, ShieldCheck } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { fetchProfile, setVisibility } from "@/store/slices/profileSlice";
import { pushToast } from "@/store/slices/uiSlice";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const { isPublic } = useAppSelector((s) => s.profile);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const toggleVisibility = async () => {
    const res = await dispatch(setVisibility(!isPublic));
    if (setVisibility.fulfilled.match(res)) {
      dispatch(
        pushToast(
          res.payload ? "Profile is now public" : "Profile is now private",
          "success",
        ),
      );
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace("/login");
  };

  return (
    <AppShell>
      <Head>
        <title>Settings · ClickCard</title>
      </Head>

      <h1 className="font-display text-2xl font-black text-ink dark:text-white">
        Settings
      </h1>
      <p className="text-sm text-ink/55 dark:text-white/55">
        Manage your account, privacy and session.
      </p>

      {/* account */}
      <section className="mt-6 rounded-3xl border border-ink/5 bg-white p-6 dark:border-white/5 dark:bg-[#12403c]">
        <h2 className="font-display text-lg font-bold text-ink dark:text-white">
          Account
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field icon={<AtSign size={16} />} label="Username" value={user?.username || "—"} />
          <Field icon={<Mail size={16} />} label="Email" value={user?.email || "—"} />
        </div>
      </section>

      {/* privacy */}
      <section className="mt-5 rounded-3xl border border-ink/5 bg-white p-6 dark:border-white/5 dark:bg-[#12403c]">
        <h2 className="font-display text-lg font-bold text-ink dark:text-white">
          Profile visibility
        </h2>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`grid h-11 w-11 place-items-center rounded-2xl text-white ${
                isPublic ? "bg-candy-pink" : "bg-ink/40"
              }`}
            >
              {isPublic ? <Globe size={20} /> : <Lock size={20} />}
            </span>
            <div>
              <p className="font-bold text-ink dark:text-white">
                {isPublic ? "Public" : "Private"}
              </p>
              <p className="text-sm text-ink/55 dark:text-white/55">
                {isPublic
                  ? "Anyone with your link can view your profile."
                  : "Your profile is hidden from visitors."}
              </p>
            </div>
          </div>
          <button
            onClick={toggleVisibility}
            role="switch"
            aria-checked={isPublic}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
              isPublic ? "bg-candy-pink" : "bg-ink/20 dark:bg-white/20"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                isPublic ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </section>

      {/* security note */}
      <section className="mt-5 flex items-start gap-3 rounded-3xl border border-ink/5 bg-white p-6 dark:border-white/5 dark:bg-[#12403c]">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-white/5">
          <ShieldCheck size={20} />
        </span>
        <div>
          <p className="font-bold text-ink dark:text-white">Passwordless & secure</p>
          <p className="text-sm text-ink/55 dark:text-white/55">
            Your account uses one-time email codes. Tokens are stored securely and
            refreshed automatically — no password to leak.
          </p>
        </div>
      </section>

      {/* danger */}
      <section className="mt-5 rounded-3xl border border-rose-200 bg-rose-50/50 p-6 dark:border-rose-500/20 dark:bg-rose-500/5">
        <h2 className="font-display text-lg font-bold text-rose-600">Session</h2>
        <p className="mt-1 text-sm text-ink/60 dark:text-white/60">
          Sign out of ClickCard on this device.
        </p>
        <Button variant="danger" className="mt-4" onClick={handleLogout}>
          <LogOut size={18} /> Log out
        </Button>
      </section>
    </AppShell>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-brand-50/60 px-4 py-3 dark:bg-white/5">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink/45 dark:text-white/45">
        {icon} {label}
      </p>
      <p className="mt-1 font-bold text-ink dark:text-white">{value}</p>
    </div>
  );
}
