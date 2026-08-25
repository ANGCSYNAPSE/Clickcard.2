import { useEffect, useState } from "react";
import Head from "next/head";
import AdminShell from "@/components/admin/AdminShell";
import { useRequireAdminAuth } from "@/lib/authGuards";
import { apiClient } from "@/lib/axiosClient";
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Mail,
  Lock,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";

const createAdminSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  name: Yup.string().required("Name is required"),
});

export default function TeamPage() {
  useRequireAdminAuth();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [admins, setAdmins] = useState([
    {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: "Super Admin",
      status: "active",
      created: "Aug 10, 2026",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const form = useFormik({
    initialValues: { name: "", email: "", password: "" },
    validationSchema: createAdminSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setMessage(null);

        // Call backend API to create admin
        const { data } = await apiClient.post("/api/users/admin/create", values);

        // Add new admin to list
        setAdmins([
          ...admins,
          {
            id: data.data.id,
            name: values.name,
            email: values.email,
            role: "Admin",
            status: "active",
            created: new Date().toLocaleDateString(),
          },
        ]);

        setMessage({ type: "success", text: "Admin created successfully!" });
        form.resetForm();
        setShowCreateForm(false);
      } catch (err: any) {
        setMessage({ type: "error", text: err.response?.data?.message || err.message || "Failed to create admin" });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    try {
      setMessage(null);
      await apiClient.delete(`/api/users/admin/${adminId}`);

      setAdmins(admins.filter((a) => a.id !== adminId));
      setMessage({ type: "success", text: "Admin deleted successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || err.message || "Failed to delete admin" });
    }
  };

  return (
    <AdminShell>
      <Head>
        <title>Team Management · ClickCard Admin</title>
      </Head>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-black text-ink dark:text-white">
            Team Management
          </h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add New Admin
          </button>
        </div>
        <p className="text-sm text-muted dark:text-white/60">
          Manage admin users and their permissions.
        </p>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20"
              : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
          }`}
        >
          <p
            className={`text-sm ${
              message.type === "success"
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Create Admin Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-dark-hover rounded-xl border border-line/50 dark:border-line/10 p-8 mb-8">
          <h2 className="text-lg font-bold text-ink dark:text-white mb-6">
            Create New Admin
          </h2>

          <form onSubmit={form.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-ink dark:text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  {...form.getFieldProps("name")}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white placeholder-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {form.touched.name && form.errors.name && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {form.errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-ink dark:text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted dark:text-white/40"
                    size={18}
                  />
                  <input
                    type="email"
                    {...form.getFieldProps("email")}
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white placeholder-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {form.touched.email && form.errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {form.errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-ink dark:text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted dark:text-white/40"
                    size={18}
                  />
                  <input
                    type="password"
                    {...form.getFieldProps("password")}
                    placeholder="At least 8 characters"
                    className="w-full pl-10 pr-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white placeholder-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {form.touched.password && form.errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {form.errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !form.isValid}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Admin"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-line/50 dark:border-line/10 text-ink dark:text-white rounded-lg font-medium hover:bg-paper-soft dark:hover:bg-dark transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-white dark:bg-dark-hover rounded-xl border border-line/50 dark:border-line/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line/30 dark:border-line/10 bg-paper-soft dark:bg-dark">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  Name
                </th>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  Email
                </th>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  Role
                </th>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  Status
                </th>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  Created
                </th>
                <th className="text-right py-4 px-6 font-semibold text-ink dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="border-b border-line/20 dark:border-line/10 hover:bg-paper-soft dark:hover:bg-dark transition-colors"
                >
                  <td className="py-4 px-6 font-medium text-ink dark:text-white">
                    {admin.name}
                  </td>
                  <td className="py-4 px-6 text-ink dark:text-white">
                    {admin.email}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                      {admin.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {admin.status === "active" ? (
                        <>
                          <CheckCircle
                            className="text-green-600 dark:text-green-400"
                            size={16}
                          />
                          <span className="text-green-700 dark:text-green-400 font-medium">
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle
                            className="text-red-600 dark:text-red-400"
                            size={16}
                          />
                          <span className="text-red-700 dark:text-red-400 font-medium">
                            Inactive
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-muted dark:text-white/60">
                    {admin.created}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-paper-soft dark:hover:bg-dark rounded text-muted dark:text-white/60">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {admins.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted dark:text-white/60">No admins yet. Create one to get started.</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
