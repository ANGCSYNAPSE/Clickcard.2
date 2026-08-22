import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import { Mail, Lock, ArrowRight, Shield, BarChart3, Users, Moon, Sun } from "lucide-react";
import { adminService } from "@/services/adminService";
import { SITE_URL } from "@/lib/config";
import * as Yup from "yup";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const ADMIN_FEATURES = [
  {
    icon: Users,
    title: "User Management",
    description: "Manage platform users and permissions",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track revenue, engagement & growth",
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "Monitor system health & access control",
  },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("adminTheme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (selectedTheme: "light" | "dark") => {
    if (selectedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("adminTheme", selectedTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const form = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        setGeneralError("");
        setLoading(true);
        const response = await adminService.adminLogin(
          values.email.trim(),
          values.password
        );

        localStorage.setItem("adminToken", response.token || "admin-token");
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminEmail", values.email.trim());

        router.replace("/admin");
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again.";
        setGeneralError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <Head>
        <title>Admin Login · ClickCard</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="flex min-h-screen bg-[#fefaf3] dark:bg-[#0b2e2b]">
        {/* Left Panel - Brand/Admin Info */}
        <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-[#fefaf3] via-[#fbf1e1] to-[#f4e2c4] dark:from-[#0b2e2b] dark:via-[#12403c] dark:to-[#0e3a36] lg:block">
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-[#be5103]/20 dark:bg-[#be5103]/10" />
          <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-[#069494]/10 dark:bg-[#069494]/5" />

          <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#be5103] to-[#069494]">
                <span className="text-lg font-black text-white">A</span>
              </div>
              <span className="text-xl font-black text-[#16241f] dark:text-white">Admin</span>
            </div>

            {/* Content */}
            <div>
              <h2 className="mb-6 text-4xl font-black leading-tight text-[#16241f] dark:text-white xl:text-5xl">
                Powerful admin tools for <span className="text-[#be5103]">ClickCard</span>
              </h2>
              <p className="mb-8 text-base text-[#6b6255] dark:text-white/70">
                Manage users, track analytics, and monitor platform health from one unified dashboard.
              </p>

              {/* Features */}
              <div className="space-y-4">
                {ADMIN_FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="flex gap-3 rounded-lg bg-white/50 dark:bg-white/5 p-4 backdrop-blur-sm border border-[#ecdfc7]/50 dark:border-white/10">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#be5103]/20 dark:bg-[#be5103]/10">
                        <Icon className="h-5 w-5 text-[#be5103]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#16241f] dark:text-white">{feature.title}</p>
                        <p className="text-sm text-[#9a9285] dark:text-white/60">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-[#9a9285] dark:text-white/50">© 2026 ClickCard. Powerful admin platform.</p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="relative flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2 lg:px-12">
          {/* Theme Toggle */}
          <div className="absolute right-6 top-6 lg:right-12 lg:top-12">
            <button
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-lg text-[#16241f]/70 transition-all hover:bg-[#16241f]/5 dark:text-white/70 dark:hover:bg-white/10"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>

          <div className="w-full max-w-sm text-center">
            {/* Header */}
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9a9285] dark:text-white/60 mb-2">
                Admin Access
              </p>
              <h1 className="text-3xl font-black text-[#16241f] dark:text-white mb-2">
                Welcome back
              </h1>
              <p className="text-sm text-[#6b6255] dark:text-white/60">
                Sign in to access your admin dashboard
              </p>
            </div>

            {/* Error Message */}
            {generalError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                <p className="text-sm text-red-700 dark:text-red-400">{generalError}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={form.handleSubmit} className="space-y-5 text-left">
              {/* Email Field */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#16241f] dark:text-white">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9285] dark:text-white/40"
                    size={18}
                  />
                  <input
                    type="email"
                    {...form.getFieldProps("email")}
                    placeholder="admin@example.com"
                    className="w-full rounded-lg border border-[#ecdfc7] bg-[#fbf1e1] px-12 py-3 text-[#16241f] placeholder-[#9a9285] transition focus:outline-none focus:ring-2 focus:ring-[#be5103] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-white/40"
                  />
                </div>
                {form.touched.email && form.errors.email && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">{form.errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#16241f] dark:text-white">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9285] dark:text-white/40"
                    size={18}
                  />
                  <input
                    type="password"
                    {...form.getFieldProps("password")}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-[#ecdfc7] bg-[#fbf1e1] px-12 py-3 text-[#16241f] placeholder-[#9a9285] transition focus:outline-none focus:ring-2 focus:ring-[#be5103] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-white/40"
                  />
                </div>
                {form.touched.password && form.errors.password && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">{form.errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !form.isValid}
                className="relative w-full rounded-full overflow-hidden font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 flex items-center h-16"
              >
                {/* Orange/Brown section with text */}
                <span className="flex-1 bg-[#be5103] hover:bg-[#b7410e] h-full flex items-center justify-center transition-colors text-base font-bold">
                  {loading ? "Signing in..." : "Sign In"}
                </span>
                {/* Teal section with arrow */}
                <span className="bg-[#069494] hover:bg-[#057a7a] h-full w-16 flex items-center justify-center transition-colors rounded-r-full">
                  {!loading && <ArrowRight size={24} />}
                </span>
              </button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-[#6b6255] dark:text-white/60">
              Not an admin?{" "}
              <Link
                href={SITE_URL}
                className="font-semibold text-[#be5103] hover:text-[#b7410e] dark:hover:text-[#ffce1b] transition-colors"
              >
                Go back to ClickCard
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
