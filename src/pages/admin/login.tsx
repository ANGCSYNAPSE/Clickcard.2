import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import { Mail, Lock, ArrowRight } from "lucide-react";
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

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

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

        // Store admin token and isAdmin flag
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

      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:from-primary/10 dark:via-transparent dark:to-secondary/10" />

      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
              <Lock className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-black text-ink dark:text-white mb-2">
              Admin Panel
            </h1>
            <p className="text-sm text-muted dark:text-white/60">
              Sign in to manage your platform
            </p>
          </div>

          {/* Error Message */}
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-400">{generalError}</p>
            </div>
          )}

          {/* Login Card */}
          <div className="bg-white dark:bg-dark-hover rounded-2xl border border-line/50 dark:border-line/10 p-8 shadow-lg">
            <form onSubmit={form.handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-ink dark:text-white mb-3">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted dark:text-white/40"
                    size={20}
                  />
                  <input
                    type="email"
                    {...form.getFieldProps("email")}
                    placeholder="admin@example.com"
                    className="w-full pl-12 pr-4 py-3 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white placeholder-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
                {form.touched.email && form.errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    {form.errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-ink dark:text-white mb-3">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted dark:text-white/40"
                    size={20}
                  />
                  <input
                    type="password"
                    {...form.getFieldProps("password")}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-3 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white placeholder-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
                {form.touched.password && form.errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    {form.errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !form.isValid}
                className="w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted dark:text-white/60 mt-8">
            Not an admin?{" "}
            <Link href={SITE_URL} className="font-semibold text-primary hover:underline">
              Go back to ClickCard
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
