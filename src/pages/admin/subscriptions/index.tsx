import { useEffect, useState } from "react";
import Head from "next/head";
import AdminShell from "@/components/admin/AdminShell";
import { useRequireAdminAuth } from "@/lib/authGuards";
import { adminService } from "@/services/adminService";
import {
  Edit2,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  CreditCard,
  DollarSign,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  priceNote: string;
  blurb: string;
  features: number;
  activeUsers: number;
  monthlyRevenue: number;
  status: "active" | "inactive";
}

interface Subscription {
  id: string;
  userName: string;
  email: string;
  plan: string;
  status: "active" | "cancelled" | "expired";
  startDate: string;
  endDate: string;
  amount: number;
}

export default function SubscriptionsPage() {
  useRequireAdminAuth();

  const [activeTab, setActiveTab] = useState<"plans" | "users" | "analytics">(
    "plans"
  );
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch subscription plans
        const plansData = await adminService.getSubscriptionPlans();
        if (Array.isArray(plansData)) {
          const formattedPlans = plansData.map((plan: any) => ({
            id: plan.id || plan._id,
            name: plan.name || "—",
            price: plan.price || 0,
            priceNote: plan.priceNote || `₹${plan.price || 0}/month`,
            blurb: plan.description || plan.blurb || "—",
            features: plan.features || 0,
            activeUsers: plan.activeUsers || 0,
            monthlyRevenue: plan.monthlyRevenue || 0,
            status: plan.status || "active",
          }));
          setPlans(formattedPlans);
        }

        // Fetch user subscriptions
        const subscriptionsData = await adminService.getUserSubscriptions(1, 100);
        if (subscriptionsData && subscriptionsData.data) {
          const formattedSubs = subscriptionsData.data.map((sub: any) => ({
            id: sub.id || sub._id,
            userName: sub.userName || sub.user?.name || "—",
            email: sub.email || sub.user?.email || "—",
            plan: sub.plan || sub.planName || "—",
            status: sub.status || "active",
            startDate: sub.startDate
              ? new Date(sub.startDate).toLocaleDateString()
              : "—",
            endDate: sub.endDate
              ? new Date(sub.endDate).toLocaleDateString()
              : "—",
            amount: sub.amount || 0,
          }));
          setSubscriptions(formattedSubs);
        }
      } catch (err: any) {
        console.error("Failed to fetch subscription data:", err);
        setError("Failed to load subscription data");
        // Continue with empty state
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  const totalRevenue = plans.reduce((sum, plan) => sum + plan.monthlyRevenue, 0);
  const totalSubscribers = plans.reduce(
    (sum, plan) => sum + plan.activeUsers,
    0
  );
  const activePlans = plans.filter((p) => p.status === "active").length;

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    setPlans(plans.filter((p) => p.id !== planId));
  };

  const handleTogglePlan = (planId: string) => {
    setPlans(
      plans.map((p) =>
        p.id === planId
          ? {
              ...p,
              status: p.status === "active" ? "inactive" : "active",
            }
          : p
      )
    );
  };

  return (
    <AdminShell>
      <Head>
        <title>Subscriptions · ClickCard Admin</title>
      </Head>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink dark:text-white mb-2">
          Subscriptions Management
        </h1>
        <p className="text-sm text-muted dark:text-white/60">
          Manage subscription plans, user subscriptions, and revenue tracking.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10 animate-pulse"
              >
                <div className="h-4 bg-paper-soft dark:bg-dark rounded w-24 mb-3"></div>
                <div className="h-8 bg-paper-soft dark:bg-dark rounded w-32 mb-3"></div>
                <div className="h-3 bg-paper-soft dark:bg-dark rounded w-40"></div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted dark:text-white/60 mb-1">
                    Monthly Revenue
                  </p>
                  <p className="text-2xl font-bold text-ink dark:text-white">
                    ₹{totalRevenue.toLocaleString()}
                  </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                ↑ 12.5% from last month
              </p>
            </div>
            <DollarSign className="text-primary" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted dark:text-white/60 mb-1">
                Active Subscribers
              </p>
              <p className="text-2xl font-bold text-ink dark:text-white">
                {totalSubscribers.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                ↑ 8.3% this week
              </p>
            </div>
            <Users className="text-primary" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted dark:text-white/60 mb-1">
                Active Plans
              </p>
              <p className="text-2xl font-bold text-ink dark:text-white">
                {activePlans}
              </p>
              <p className="text-xs text-muted dark:text-white/60 mt-2">
                of {plans.length} total
              </p>
            </div>
            <TrendingUp className="text-primary" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted dark:text-white/60 mb-1">
                Avg Revenue/Plan
              </p>
              <p className="text-2xl font-bold text-ink dark:text-white">
                ₹{Math.round(totalRevenue / activePlans).toLocaleString()}
              </p>
              <p className="text-xs text-muted dark:text-white/60 mt-2">
                Excluding Free
              </p>
            </div>
            <CreditCard className="text-primary" size={32} />
          </div>
        </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-line/30 dark:border-line/10 mb-6 bg-white dark:bg-dark-hover rounded-t-xl">
        {[
          { id: "plans" as const, label: "Subscription Plans", icon: "📦" },
          { id: "users" as const, label: "User Subscriptions", icon: "👥" },
          { id: "analytics" as const, label: "Analytics", icon: "📊" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "text-primary border-primary"
                : "text-muted dark:text-white/60 border-transparent hover:text-ink dark:hover:text-white"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          {/* Create Plan Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreatePlan(!showCreatePlan)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Create New Plan
            </button>
          </div>

          {/* Create Plan Form */}
          {showCreatePlan && (
            <div className="bg-white dark:bg-dark-hover rounded-xl p-8 border border-line/50 dark:border-line/10">
              <h3 className="text-lg font-bold text-ink dark:text-white mb-6">
                Create New Subscription Plan
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Plan name"
                  className="px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  className="px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white"
                />
                <textarea
                  placeholder="Plan description"
                  className="lg:col-span-2 px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white"
                />
                <button className="lg:col-span-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors">
                  Create Plan
                </button>
              </div>
            </div>
          )}

          {/* Plans Grid */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10 animate-pulse"
                >
                  <div className="h-6 bg-paper-soft dark:bg-dark rounded w-24 mb-4"></div>
                  <div className="h-4 bg-paper-soft dark:bg-dark rounded w-40 mb-4"></div>
                  <div className="h-8 bg-paper-soft dark:bg-dark rounded w-20 mb-6"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="h-4 bg-paper-soft dark:bg-dark rounded"
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted dark:text-white/60">No subscription plans available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-ink dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted dark:text-white/60 mt-1">
                      {plan.blurb}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      plan.status === "active"
                        ? "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {plan.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mb-6 py-4 border-t border-b border-line/30 dark:border-line/10">
                  <div className="text-3xl font-bold text-ink dark:text-white">
                    {plan.price === 0 ? "Free" : `₹${plan.price}`}
                  </div>
                  <p className="text-sm text-muted dark:text-white/60 mt-1">
                    {plan.priceNote}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted dark:text-white/60">
                      Active Users
                    </span>
                    <span className="font-bold text-ink dark:text-white">
                      {plan.activeUsers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted dark:text-white/60">
                      Monthly Revenue
                    </span>
                    <span className="font-bold text-ink dark:text-white">
                      ₹{plan.monthlyRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted dark:text-white/60">
                      Features
                    </span>
                    <span className="font-bold text-ink dark:text-white">
                      {plan.features}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 border border-line/50 dark:border-line/10 text-ink dark:text-white rounded-lg hover:bg-paper-soft dark:hover:bg-dark transition-colors flex items-center justify-center gap-2">
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleTogglePlan(plan.id)}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                      plan.status === "active"
                        ? "bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100"
                        : "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-100"
                    }`}
                  >
                    {plan.status === "active" ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="px-3 py-2 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* User Subscriptions Tab */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-dark-hover rounded-xl border border-line/50 dark:border-line/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line/30 dark:border-line/10 bg-paper-soft dark:bg-dark">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                    User Name
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                    Email
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                    Plan
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                    Start Date
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                    End Date
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-6 text-center">
                      <p className="text-muted dark:text-white/60">Loading subscriptions...</p>
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 px-6 text-center">
                      <p className="text-muted dark:text-white/60">No subscriptions found</p>
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-line/20 dark:border-line/10 hover:bg-paper-soft dark:hover:bg-dark transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-ink dark:text-white">
                      {sub.userName}
                    </td>
                    <td className="py-4 px-6 text-ink dark:text-white">
                      {sub.email}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                        {sub.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {sub.status === "active" ? (
                          <>
                            <CheckCircle
                              className="text-green-600 dark:text-green-400"
                              size={16}
                            />
                            <span className="text-green-700 dark:text-green-400 font-medium">
                              Active
                            </span>
                          </>
                        ) : sub.status === "expired" ? (
                          <>
                            <XCircle
                              className="text-red-600 dark:text-red-400"
                              size={16}
                            />
                            <span className="text-red-700 dark:text-red-400 font-medium">
                              Expired
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle
                              className="text-red-600 dark:text-red-400"
                              size={16}
                            />
                            <span className="text-red-700 dark:text-red-400 font-medium">
                              Cancelled
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted dark:text-white/60">
                      {sub.startDate}
                    </td>
                    <td className="py-4 px-6 text-muted dark:text-white/60">
                      {sub.endDate}
                    </td>
                    <td className="py-4 px-6 font-semibold text-ink dark:text-white">
                      ₹{sub.amount}
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-dark-hover rounded-xl p-8 border border-line/50 dark:border-line/10">
            <h3 className="text-lg font-bold text-ink dark:text-white mb-6">
              Revenue Trend
            </h3>
            <div className="h-48 bg-paper-soft dark:bg-dark rounded-lg flex items-center justify-center">
              <p className="text-muted dark:text-white/60">
                Chart visualization here
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-hover rounded-xl p-8 border border-line/50 dark:border-line/10">
            <h3 className="text-lg font-bold text-ink dark:text-white mb-6">
              Subscription Distribution
            </h3>
            <div className="h-48 bg-paper-soft dark:bg-dark rounded-lg flex items-center justify-center">
              <p className="text-muted dark:text-white/60">
                Chart visualization here
              </p>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
