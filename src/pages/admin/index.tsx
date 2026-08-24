import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { adminService } from "@/services/adminService";
import { notificationService } from "@/services/notificationService";
import { useRequireAdminAuth } from "@/lib/authGuards";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ActivityItem {
  id: string;
  type: "user" | "subscription" | "payment";
  description: string;
  user: string;
  details: string;
  timestamp: string;
}

export default function AdminDashboard() {
  useRequireAdminAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    newSignups: 0,
  });

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState({
    shares: { value: 0, growth: 0 },
    clicks: { value: 0, growth: 0 },
    downloads: { value: 0, growth: 0 },
    views: { value: 0, growth: 0 },
  });

  const [quickActions, setQuickActions] = useState({
    pendingModeration: 0,
    blockedUsers: 0,
    supportLeads: 0,
    systemHealth: "Healthy",
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [topPlans, setTopPlans] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users data from backend with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          console.log("📍 Starting admin dashboard data fetch...");
          const [usersResponse, plansResponse, notificationsResponse] = await Promise.all([
            adminService.getUsers(1, 1000),
            adminService.getSubscriptionPlans(),
            notificationService.adminRegistrations()
              .catch((err) => {
                console.error("❌ Failed to fetch admin notifications:", err.message, err.response?.data);
                return { data: { items: [] } };
              })
          ]);
          clearTimeout(timeoutId);
          console.log("✅ Notification response:", notificationsResponse);

          const users = usersResponse.data || [];
          const plans = plansResponse || [];
          const notifs = notificationsResponse.data?.items || [];

          console.log("📊 Admin Dashboard Data Loaded:");
          console.log("  Users:", users.length);
          console.log("  Plans:", plans.length);
          console.log("  Notifications:", notifs.length, notifs);

          // Calculate stats from actual data
          const totalUsers = usersResponse.total || users.length;
          const activeSubscriptions = users.filter((u: any) => u.subscriptionPlan).length;

          setStats({
            totalUsers: totalUsers,
            totalRevenue: 0,
            activeSubscriptions: activeSubscriptions,
            newSignups: 0,
          });

          // If no backend data, show empty state
          if (users.length === 0) {
            setRevenueData([]);
            setUserGrowthData([]);
            setSubscriptionData([]);
            setRecentActivity([]);
            setTopPlans([]);
          } else {
            // Generate chart data from actual users
            const recentUsers = users.slice(0, 10);
            setRecentActivity(
              recentUsers.map((user: any, idx: number) => ({
                id: user.id,
                type: "user" as const,
                description: "New User Registered",
                user: user.email || "—",
                details: `Registered on ${new Date(user.signupDate).toLocaleDateString()}`,
                timestamp: "Recently",
              }))
            );

            // Set notifications - log to verify
            console.log("✅ Setting notifications:", notifs.length, "items");
            setNotifications(notifs.slice(0, 10));
          }

          // Process and display plans
          if (plans.length > 0) {
            const processedPlans = plans.map((plan: any) => ({
              name: plan.name || plan.id,
              revenue: plan.price || 0,
              percentage: Math.round((plan.price || 0) / (plans.reduce((sum: number, p: any) => sum + (p.price || 0), 0) || 1) * 100)
            }));
            setTopPlans(processedPlans);
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          console.error("Failed to fetch data:", fetchErr);
          // Show empty state on error
          setRevenueData([]);
          setUserGrowthData([]);
          setSubscriptionData([]);
          setRecentActivity([]);
          setTopPlans([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              .spinner {
                animation: spin 1s linear infinite;
              }
            `}</style>
            <div className="spinner mb-4 inline-block">
              <Activity className="text-primary" size={40} />
            </div>
            <p className="text-ink dark:text-white font-medium">
              Loading dashboard...
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Head>
        <title>Admin Dashboard · ClickCard</title>
      </Head>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-ink dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-ink/60 dark:text-white/60 mt-1">
            Welcome back, Admin! Here's what's happening on your platform.
          </p>
        </div>
        <div className="text-right">
          <button className="px-4 py-2 bg-paper-soft dark:bg-dark border border-line/50 dark:border-line/10 rounded-lg text-ink dark:text-white text-sm font-medium hover:bg-paper dark:hover:bg-dark-hover transition-colors">
            📅 May 20 - Jun 18, 2025
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted dark:text-white/60 mb-2">
                Total Users
              </p>
              <p className="text-3xl font-bold text-ink dark:text-white">
                {stats.totalUsers.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                ↑ 12.5% from last 30 days
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted dark:text-white/60 mb-2">
                Total Revenue (MRR)
              </p>
              <p className="text-3xl font-bold text-ink dark:text-white">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                ↑ 8.2% from last 30 days
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-lg">
              <CreditCard className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted dark:text-white/60 mb-2">
                Active Subscriptions
              </p>
              <p className="text-3xl font-bold text-ink dark:text-white">
                {stats.activeSubscriptions.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                ↑ 15.3% from last 30 days
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg">
              <TrendingUp className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
          </div>
        </div>

        {/* New Signups */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted dark:text-white/60 mb-2">
                New Signups (This Week)
              </p>
              <p className="text-3xl font-bold text-ink dark:text-white">
                {stats.newSignups.toLocaleString()}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                ↓ 18.7% from last week
              </p>
            </div>
            <div className="p-3 bg-pink-100 dark:bg-pink-500/20 rounded-lg">
              <Users className="text-pink-600 dark:text-pink-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink dark:text-white">
              Revenue Trend
            </h3>
            <span className="text-xs text-muted dark:text-white/60">Last 30 Days</span>
          </div>
          {revenueData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-center">
              <p className="text-muted dark:text-white/60">No revenue data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* User Growth */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink dark:text-white">
              User Growth
            </h3>
            <span className="text-xs text-muted dark:text-white/60">Last 30 Days</span>
          </div>
          {userGrowthData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-center">
              <p className="text-muted dark:text-white/60">No user growth data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Subscription & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Subscription Breakdown */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <h3 className="text-lg font-bold text-ink dark:text-white mb-4">
            Subscription Breakdown
          </h3>
          {subscriptionData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-center">
              <p className="text-muted dark:text-white/60">No subscription data available</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={false}
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {subscriptionData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span className="text-ink dark:text-white">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                    <span className="font-semibold text-ink dark:text-white">
                      {item.value.toLocaleString()} ({Math.round((item.value / 5647) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Platform Analytics */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10 lg:col-span-2">
          <h3 className="text-lg font-bold text-ink dark:text-white mb-4">
            Platform Analytics
          </h3>
          <p className="text-xs text-muted dark:text-white/60 mb-6">Last 30 Days</p>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(platformMetrics).map(([key, data]: [string, any]) => (
              <div
                key={key}
                className="p-4 bg-paper-soft dark:bg-dark rounded-lg border border-line/20 dark:border-line/10"
              >
                <p className="text-xs text-muted dark:text-white/60 mb-2 capitalize">
                  {key}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-ink dark:text-white">
                    {data.value.toLocaleString()}
                  </p>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                    ↑ {data.growth}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <h3 className="text-lg font-bold text-ink dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg border border-yellow-200 dark:border-yellow-500/20">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white">
                  Pending Moderation
                </p>
                <p className="text-xs text-muted dark:text-white/60 mt-1">
                  Cards & users waiting for review
                </p>
              </div>
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {quickActions.pendingModeration}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white">
                  Blocked Users
                </p>
                <p className="text-xs text-muted dark:text-white/60 mt-1">
                  Users blocked from platform
                </p>
              </div>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {quickActions.blockedUsers}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white">
                  Support Leads
                </p>
                <p className="text-xs text-muted dark:text-white/60 mt-1">
                  Unresolved support queries
                </p>
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {quickActions.supportLeads}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-200 dark:border-green-500/20">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white">
                  System Health
                </p>
                <p className="text-xs text-muted dark:text-white/60 mt-1">
                  All systems operational
                </p>
              </div>
              <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10 lg:col-span-2">
          <h3 className="text-lg font-bold text-ink dark:text-white mb-4">
            Recent Activity
          </h3>
          {recentActivity.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <p className="text-muted dark:text-white/60">No activity available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-4 pb-3 border-b border-line/20 dark:border-line/10 last:border-0 last:pb-0"
              >
                <div className="flex-shrink-0">
                  {activity.type === "user" && (
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                      <Users className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                  )}
                  {activity.type === "subscription" && (
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                      <CreditCard className="text-purple-600 dark:text-purple-400" size={20} />
                    </div>
                  )}
                  {activity.type === "payment" && (
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink dark:text-white">
                      {activity.description}
                    </p>
                    <span className="text-xs text-muted dark:text-white/60">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-muted dark:text-white/60 mt-1">
                    {activity.user}
                  </p>
                  <p className="text-xs text-ink dark:text-white mt-1">
                    {activity.details}
                  </p>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>

      {/* New User Registrations Notifications */}
      <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <MessageSquare className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink dark:text-white">
                New User Registrations
              </h3>
              <p className="text-xs text-muted dark:text-white/60 mt-0.5">
                Latest user signups from the platform
              </p>
            </div>
          </div>
          <a href="/admin/users" className="text-sm text-primary hover:underline">
            View All
          </a>
        </div>

        {notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <p className="text-muted dark:text-white/60">No new registrations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const data = notif.data || {};
              const timestamp = new Date(notif.created_at).toLocaleString();
              return (
                <div
                  key={notif.id}
                  className="flex gap-4 pb-3 border-b border-line/20 dark:border-line/10 last:border-0 last:pb-0 hover:bg-paper-soft dark:hover:bg-dark/50 p-2 rounded transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink dark:text-white">
                        {notif.title}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${notif.is_read ? 'bg-gray-100 dark:bg-dark text-gray-600 dark:text-gray-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold'}`}>
                        {notif.is_read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                    <p className="text-xs text-muted dark:text-white/60 mt-1">
                      {notif.message}
                    </p>
                    {data.email && (
                      <p className="text-xs text-ink dark:text-white mt-1">
                        Email: <span className="font-mono text-xs">{data.email}</span>
                      </p>
                    )}
                    <span className="text-xs text-muted dark:text-white/50 mt-2 block">
                      {timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Plans by Revenue */}
      <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-ink dark:text-white">
            Top Plans by Revenue
          </h3>
          <a href="/admin/subscriptions" className="text-sm text-primary hover:underline">
            View All
          </a>
        </div>
        {topPlans.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <p className="text-muted dark:text-white/60">No plan data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topPlans.map((plan, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-ink dark:text-white">
                    {index + 1}. {plan.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink dark:text-white">
                    ₹{plan.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted dark:text-white/60">
                    {plan.percentage}%
                  </p>
                </div>
              </div>
              <div className="w-full bg-paper-soft dark:bg-dark rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full"
                  style={{ width: `${plan.percentage}%` }}
                />
              </div>
            </div>
          ))}
            </div>
        )}
      </div>
    </AdminShell>
  );
}
