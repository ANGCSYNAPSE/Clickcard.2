import { useEffect, useState } from "react";
import Head from "next/head";
import {
  TrendingUp,
  AlertCircle,
  Download,
  Eye,
  Activity,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { adminService } from "@/services/adminService";
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface KPIData {
  totalMRR: number;
  activeSubscriptions: number;
  churnRate: number;
  ltv: number;
  mrrChange: number;
  subscriptionsChange: number;
  churnChange: number;
  ltvChange: number;
}

interface Subscription {
  id: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  planName: string;
  amount: number;
  status: "active" | "cancelled" | "paused";
  billingCycle: "monthly" | "yearly";
  currentPeriodEnd: string;
  paymentMethod: string;
  lastFourDigits: string;
}

const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpi, setKpi] = useState<KPIData | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Revenue chart data
  const [revenueChartData] = useState([
    { date: "May 20", revenue: 15000 },
    { date: "May 25", revenue: 18000 },
    { date: "May 30", revenue: 17500 },
    { date: "Jun 3", revenue: 19500 },
    { date: "Jun 8", revenue: 21000 },
    { date: "Jun 13", revenue: 20500 },
    { date: "Jun 17", revenue: 23100 },
  ]);

  // Filters
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch actual user data from the database
        const response = await adminService.getUsers(1, 1000);
        const users = response.data;

        // Calculate revenue metrics from actual users
        const activeUsers = users.filter((u: any) => u.status === "active" && u.subscriptionPlan);
        const totalMRR = activeUsers.reduce((sum: number, u: any) => {
          const planPrices: { [key: string]: number } = {
            "Basic": 499,
            "Premium": 999,
            "Business": 2499,
          };
          return sum + (planPrices[u.subscriptionPlan] || 0);
        }, 0);

        const activeSubscriptions = activeUsers.length;
        const churnRate = ((users.length - activeSubscriptions) / users.length) * 100;
        const ltv = activeSubscriptions > 0 ? totalMRR / activeSubscriptions : 0;

        setKpi({
          totalMRR,
          activeSubscriptions,
          churnRate: parseFloat(churnRate.toFixed(2)),
          ltv: parseFloat(ltv.toFixed(2)),
          mrrChange: 13.5,
          subscriptionsChange: 9.3,
          churnChange: -0.6,
          ltvChange: 14.7,
        });

        // Convert users to subscription format
        const subs: Subscription[] = users
          .filter((u: any) => u.subscriptionPlan)
          .map((user: any) => ({
            id: user.id,
            userName: user.name,
            userEmail: user.email,
            userImage: user.avatar,
            planName: user.subscriptionPlan || "Free",
            amount: {
              "Basic": 499,
              "Premium": 999,
              "Business": 2499,
              "Free": 0,
            }[user.subscriptionPlan] || 0,
            status: user.status === "active" ? "active" : "cancelled",
            billingCycle: "monthly" as const,
            currentPeriodEnd: user.subscriptionEndDate || new Date().toLocaleDateString("en-IN"),
            paymentMethod: "Card",
            lastFourDigits: "****",
          }));

        setSubscriptions(subs);
        setFilteredSubscriptions(subs);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch revenue data:", err);
        setError("No subscription data available. Backend API is not ready yet.");
        setSubscriptions([]);
        setFilteredSubscriptions([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...subscriptions];

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (planFilter !== "all") {
      filtered = filtered.filter((sub) => sub.planName === planFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    setFilteredSubscriptions(filtered);
    setCurrentPage(1);
  }, [searchTerm, planFilter, statusFilter, subscriptions]);

  const handleExportCSV = () => {
    const headers = [
      "User Name",
      "Email",
      "Plan",
      "Amount (₹)",
      "Status",
      "Billing Cycle",
      "Period End",
    ];
    const rows = filteredSubscriptions.map((sub) => [
      sub.userName,
      sub.userEmail,
      sub.planName,
      sub.amount.toString(),
      sub.status,
      sub.billingCycle,
      sub.currentPeriodEnd,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revenue.csv";
    a.click();
  };

  // Calculate plan distribution
  const planDistribution = subscriptions.reduce((acc: any, sub) => {
    const existing = acc.find((p: any) => p.name === sub.planName);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: sub.planName, value: 1 });
    }
    return acc;
  }, []);

  // Calculate revenue by plan
  const revenueByPlan = subscriptions.reduce((acc: any, sub) => {
    const existing = acc.find((p: any) => p.name === sub.planName);
    if (existing) {
      existing.revenue += sub.amount;
    } else {
      acc.push({ name: sub.planName, revenue: sub.amount });
    }
    return acc;
  }, []);

  const paginatedSubs = filteredSubscriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);

  if (loading) {
    return (
      <AdminShell>
        <div className="bg-white dark:bg-dark-hover rounded-2xl p-12 border border-line/50 dark:border-line/10 flex flex-col items-center justify-center min-h-screen">
          <Activity className="text-primary mb-4 animate-spin" size={32} />
          <p className="text-ink dark:text-white font-medium">
            Loading revenue data...
          </p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Head>
        <title>Revenue & Billing · ClickCard Admin</title>
      </Head>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink dark:text-white">
          Revenue & Billing
        </h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-white/60">
          Manage subscriptions and track revenue metrics
        </p>
      </div>

      {/* KPI Cards */}
      {kpi && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
            <p className="text-sm text-muted dark:text-white/60 mb-2">Total MRR</p>
            <p className="text-3xl font-bold text-ink dark:text-white mb-2">
              ₹{kpi.totalMRR.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {kpi.mrrChange > 0 ? "+" : ""}{kpi.mrrChange}% from last month
            </p>
          </div>

          <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
            <p className="text-sm text-muted dark:text-white/60 mb-2">Active Subscriptions</p>
            <p className="text-3xl font-bold text-ink dark:text-white mb-2">
              {kpi.activeSubscriptions.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {kpi.subscriptionsChange > 0 ? "+" : ""}{kpi.subscriptionsChange}% from last month
            </p>
          </div>

          <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
            <p className="text-sm text-muted dark:text-white/60 mb-2">Churn Rate</p>
            <p className="text-3xl font-bold text-ink dark:text-white mb-2">
              {kpi.churnRate.toFixed(2)}%
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {kpi.churnChange > 0 ? "+" : ""}{kpi.churnChange}% from last month
            </p>
          </div>

          <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
            <p className="text-sm text-muted dark:text-white/60 mb-2">LTV</p>
            <p className="text-3xl font-bold text-ink dark:text-white mb-2">
              ₹{kpi.ltv.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {kpi.ltvChange > 0 ? "+" : ""}{kpi.ltvChange}% from last month
            </p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink dark:text-white">Revenue Trend</h3>
            <select className="px-2 py-1 text-xs bg-paper-soft dark:bg-dark rounded border border-line/50 dark:border-line/10">
              <option>30 Days</option>
              <option>60 Days</option>
              <option>90 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="currentColor" style={{ fontSize: "12px" }} />
              <YAxis stroke="currentColor" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                labelStyle={{ color: "#F3F4F6" }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <h3 className="font-bold text-ink dark:text-white mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {planDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {planDistribution.map((plan: any, idx: number) => (
              <div key={plan.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-ink dark:text-white">{plan.name}</span>
                </div>
                <span className="font-semibold text-ink dark:text-white">{plan.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink dark:text-white">Revenue by Plan</h3>
            <select className="px-2 py-1 text-xs bg-paper-soft dark:bg-dark rounded border border-line/50 dark:border-line/10">
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByPlan}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="currentColor" style={{ fontSize: "12px" }} />
              <YAxis stroke="currentColor" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
                labelStyle={{ color: "#F3F4F6" }}
                formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
              />
              <Bar dataKey="revenue" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-dark-hover rounded-2xl border border-line/50 dark:border-line/10 overflow-hidden">
        <div className="p-6 border-b border-line/50 dark:border-line/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by user or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-paper-soft dark:bg-dark rounded-lg border border-line/50 dark:border-line/10 text-ink dark:text-white placeholder-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-4 py-2 bg-paper-soft dark:bg-dark rounded-lg border border-line/50 dark:border-line/10 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Plans</option>
              <option value="Free">Free</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Business">Business</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-paper-soft dark:bg-dark rounded-lg border border-line/50 dark:border-line/10 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="paused">Paused</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 bg-paper-soft dark:bg-dark rounded-lg border border-line/50 dark:border-line/10 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Start date"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 bg-paper-soft dark:bg-dark rounded-lg border border-line/50 dark:border-line/10 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="End date"
            />
          </div>
        </div>

        {paginatedSubs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line/50 dark:border-line/10 bg-paper-soft dark:bg-dark/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                    Billing Cycle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                    Period End
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubs.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-line/30 dark:border-line/10 hover:bg-paper-soft dark:hover:bg-dark/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                          {sub.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink dark:text-white">
                            {sub.userName}
                          </p>
                          <p className="text-xs text-muted dark:text-white/60">
                            {sub.userEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink dark:text-white">
                      {sub.planName}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-ink dark:text-white">
                      ₹{sub.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                          sub.status === "active"
                            ? "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink dark:text-white">
                      {sub.billingCycle}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink dark:text-white">
                      {sub.currentPeriodEnd}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Eye size={24} className="text-muted dark:text-white/60 mb-4" />
            <p className="text-ink dark:text-white font-medium">No subscriptions found</p>
            <p className="text-muted dark:text-white/60 text-sm mt-1">
              Try adjusting your filters
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-line/50 dark:border-line/10 flex items-center justify-between">
            <p className="text-sm text-muted dark:text-white/60">
              Showing {paginatedSubs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredSubscriptions.length)} of{" "}
              {filteredSubscriptions.length} subscriptions
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-line/50 dark:border-line/10 rounded-lg hover:bg-paper-soft dark:hover:bg-dark disabled:opacity-50 transition-colors"
              >
                {"<"}
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-lg font-medium transition-colors ${
                    currentPage === i + 1
                      ? "bg-primary text-white"
                      : "border border-line/50 dark:border-line/10 text-ink dark:text-white hover:bg-paper-soft dark:hover:bg-dark"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-line/50 dark:border-line/10 rounded-lg hover:bg-paper-soft dark:hover:bg-dark disabled:opacity-50 transition-colors"
              >
                {">"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
