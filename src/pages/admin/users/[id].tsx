import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import AdminShell from "@/components/admin/AdminShell";
import { adminService } from "@/services/adminService";
import {
  Activity,
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle,
  Edit2,
  Copy,
} from "lucide-react";
import Link from "next/link";

export default function UserDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [accountStatus, setAccountStatus] = useState(true);
  const [moderationNotes, setModerationNotes] = useState("");

  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching user details for ID:", id);
        const userData = await adminService.getUserDetails(id as string);
        console.log("User data received:", userData);
        setUser(userData);
        setAccountStatus(userData.status === "active");

        try {
          const analyticsData = await adminService.getUserAnalytics(id as string);
          console.log("Analytics data received:", analyticsData);
          setAnalytics(analyticsData);
        } catch (err) {
          console.log("Analytics unavailable:", err);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user details. Make sure your backend is running.");
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, id]);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin">
            <Activity className="text-primary" size={32} />
          </div>
        </div>
      </AdminShell>
    );
  }

  const profile = user?.profile || {};
  const personalIdentity = profile.personal_identity || {};
  const contactInfo = profile.contact_information || {};

  return (
    <AdminShell>
      <Head>
        <title>User Details · ClickCard Admin</title>
      </Head>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/users"
          className="p-2 hover:bg-paper-soft dark:hover:bg-dark rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-ink dark:text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-ink dark:text-white">
            User Details
          </h1>
          <p className="text-xs text-ink/60 dark:text-white/60">
            Users <span className="text-primary">›</span> User Details
          </p>
        </div>
      </div>

      {user && (
        <>
          {/* User Card */}
          <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-4xl">
                  {personalIdentity.profilePicture || user.profile_picture ? (
                    <img
                      src={personalIdentity.profilePicture || user.profile_picture}
                      alt={personalIdentity.fullName || user.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    personalIdentity.fullName?.charAt(0) || user.username?.charAt(0) || "U"
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-ink dark:text-white">
                      {personalIdentity.fullName || user.username}
                    </h2>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
                      !user.is_blocked
                        ? "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                    }`}>
                      <CheckCircle size={16} /> {user.is_blocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                  <p className="text-sm text-muted dark:text-white/60 mb-2 flex items-center gap-2">
                    <Mail size={16} /> {user.email}
                  </p>
                  {contactInfo.phone && (
                    <p className="text-sm text-muted dark:text-white/60 mb-3 flex items-center gap-2">
                      <Phone size={16} /> {contactInfo.phone}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                      <CheckCircle size={12} /> Email Verified
                    </span>
                    {contactInfo.phone && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                        <CheckCircle size={12} /> Phone Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-white dark:bg-dark border border-line/50 dark:border-line/10 rounded-lg text-ink dark:text-white font-medium hover:bg-paper-soft dark:hover:bg-dark/50 transition-colors">
                Actions
              </button>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-4 gap-6 mt-6 pt-6 border-t border-line/30 dark:border-line/10">
              <div>
                <p className="text-xs text-muted dark:text-white/60 mb-1">User ID</p>
                <p className="text-sm font-semibold text-ink dark:text-white">{user.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted dark:text-white/60 mb-1">Auth Provider</p>
                <p className="text-sm font-semibold text-ink dark:text-white">Email</p>
              </div>
              <div>
                <p className="text-xs text-muted dark:text-white/60 mb-1">Account Created</p>
                <p className="text-sm font-semibold text-ink dark:text-white">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted dark:text-white/60 mb-1">Last Login</p>
                <p className="text-sm font-semibold text-ink dark:text-white">{user.last_login ? new Date(user.last_login).toLocaleString() : "Never"}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-line/30 dark:border-line/10 mb-6 bg-white dark:bg-dark-hover rounded-t-xl">
            {[
              { id: "overview", label: "Overview", icon: "👁️" },
              { id: "profile", label: "Profile Data", icon: "👤" },
              { id: "activity", label: "Activity & Analytics", icon: "📊" },
              { id: "moderation", label: "Moderation", icon: "🛡️" },
              { id: "subscription", label: "Subscription", icon: "💳" },
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

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-ink dark:text-white">Basic Information</h3>
                    <button className="p-1 hover:bg-paper-soft dark:hover:bg-dark rounded">
                      <Edit2 size={16} className="text-muted dark:text-white/60" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Full Name</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{personalIdentity.fullName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Username</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{user.username || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Email</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-ink dark:text-white">{user.email}</p>
                        <span className="text-xs text-green-600 dark:text-green-400">(Verified)</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Phone</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{contactInfo.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Country</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{contactInfo.country || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Language</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{user.language || "English"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Time Zone</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{contactInfo.timezone || "(GMT-05:00) Eastern Time"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Referral Code</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-semibold text-ink dark:text-white">{user.referral_code || "N/A"}</p>
                        {user.referral_code && (
                          <button className="p-1 hover:bg-paper-soft dark:hover:bg-dark rounded">
                            <Copy size={14} className="text-muted dark:text-white/60" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Summary */}
                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Profile Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted dark:text-white/60">Business / Company</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{profile.business_details?.name || "N/A"}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted dark:text-white/60">Products / Services</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{profile.products_services?.length || 0}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted dark:text-white/60">Social Links</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{profile.social_links?.length || 0}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted dark:text-white/60">Education</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{profile.education?.length || 0}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted dark:text-white/60">Work Experience</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{profile.work_experience?.length || 0}</p>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg text-primary font-medium hover:bg-paper-soft dark:hover:bg-dark transition-colors">
                    View Full Profile
                  </button>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-6">
                {/* Activity Overview */}
                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Activity Overview (Last 7 Days)</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {analytics ? (
                      <>
                        <div className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                          <p className="text-xs text-muted dark:text-white/60 mb-1">Views</p>
                          <p className="text-2xl font-bold text-ink dark:text-white">{analytics.views || 0}</p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 18.6%</p>
                        </div>
                        <div className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                          <p className="text-xs text-muted dark:text-white/60 mb-1">Clicks</p>
                          <p className="text-2xl font-bold text-ink dark:text-white">{analytics.clicks || 0}</p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 12.4%</p>
                        </div>
                        <div className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                          <p className="text-xs text-muted dark:text-white/60 mb-1">Downloads</p>
                          <p className="text-2xl font-bold text-ink dark:text-white">{analytics.downloads || 0}</p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 15.3%</p>
                        </div>
                        <div className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                          <p className="text-xs text-muted dark:text-white/60 mb-1">Shares</p>
                          <p className="text-2xl font-bold text-ink dark:text-white">{analytics.shares || 0}</p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 9.8%</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted dark:text-white/60 col-span-2">No analytics data available</p>
                    )}
                  </div>
                  <div className="h-48 bg-paper-soft dark:bg-dark rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted dark:text-white/60">Chart visualization</p>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg text-primary font-medium hover:bg-paper-soft dark:hover:bg-dark transition-colors">
                    View All Activity →
                  </button>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 pb-3 border-b border-line/30 dark:border-line/10">
                      <span className="text-lg">📝</span>
                      <div className="flex-1">
                        <p className="text-sm text-ink dark:text-white">User account updated</p>
                        <p className="text-xs text-muted dark:text-white/60 mt-1">{user.last_login ? new Date(user.last_login).toLocaleString() : "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">✅</span>
                      <div className="flex-1">
                        <p className="text-sm text-ink dark:text-white">Account created</p>
                        <p className="text-xs text-muted dark:text-white/60 mt-1">{user.created_at ? new Date(user.created_at).toLocaleString() : "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg text-primary font-medium hover:bg-paper-soft dark:hover:bg-dark transition-colors">
                    View All Activity →
                  </button>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Subscription Information */}
                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Subscription Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted dark:text-white/60 mb-1">Current Plan</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400">
                          {user.subscriptionPlan || "Free"}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted dark:text-white/60 mb-1">Billing Cycle</p>
                        <p className="text-sm font-semibold text-ink dark:text-white">Monthly</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted dark:text-white/60 mb-1">Status</p>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                          <CheckCircle size={12} /> {!user.is_blocked ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted dark:text-white/60 mb-1">Next Billing Date</p>
                        <p className="text-sm font-semibold text-ink dark:text-white">N/A</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-line/30 dark:border-line/10">
                      <p className="text-xs text-muted dark:text-white/60 mb-2">Amount</p>
                      <p className="text-2xl font-bold text-ink dark:text-white mb-4">₹0/month</p>
                      <p className="text-xs text-muted dark:text-white/60 mb-2">Payment Method</p>
                      <div className="flex items-center gap-2">
                        <span>💳</span>
                        <p className="text-sm text-ink dark:text-white">N/A</p>
                      </div>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg text-primary font-medium hover:bg-paper-soft dark:hover:bg-dark transition-colors">
                      View Subscription
                    </button>
                  </div>
                </div>

                {/* Moderation Panel */}
                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Moderation Panel</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-2">Moderation Status</p>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
                          user.moderation_status === "approved"
                            ? "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                            : user.moderation_status === "pending"
                            ? "bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                            : "bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                        }`}>
                          <CheckCircle size={14} /> {user.moderation_status?.toUpperCase() || "N/A"}
                        </span>
                        <select className="px-2 py-1 text-xs bg-paper-soft dark:bg-dark rounded border border-line/50 dark:border-line/10">
                          <option>Approved</option>
                          <option>Pending</option>
                          <option>Rejected</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-2">Account Status</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-ink dark:text-white">Active</p>
                        <button
                          onClick={() => setAccountStatus(!accountStatus)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            accountStatus ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              accountStatus ? "right-1" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-2">Moderator Notes</p>
                      <textarea
                        value={moderationNotes}
                        onChange={(e) => setModerationNotes(e.target.value)}
                        placeholder="Add notes about your decision"
                        className="w-full px-3 py-2 text-sm bg-paper-soft dark:bg-dark border border-line/50 dark:border-line/10 rounded text-ink dark:text-white placeholder-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={2}
                      />
                    </div>
                    <button className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors">
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Data Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Personal Identity</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Full Name</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{personalIdentity.fullName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Tagline</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{personalIdentity.tagline || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Bio</p>
                      <p className="text-sm text-ink dark:text-white">{personalIdentity.bio || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Account Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Email</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Username</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{user.username || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Referral Code</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{user.referral_code || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                <h3 className="font-bold text-ink dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                    <p className="text-xs text-muted dark:text-white/60 mb-2">Email</p>
                    <p className="text-sm font-semibold text-ink dark:text-white break-all">{contactInfo.email || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                    <p className="text-xs text-muted dark:text-white/60 mb-2">Phone</p>
                    <p className="text-sm font-semibold text-ink dark:text-white">{contactInfo.phone || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                    <p className="text-xs text-muted dark:text-white/60 mb-2">WhatsApp</p>
                    <p className="text-sm font-semibold text-ink dark:text-white">{contactInfo.whatsapp || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                    <p className="text-xs text-muted dark:text-white/60 mb-2">City</p>
                    <p className="text-sm font-semibold text-ink dark:text-white">{contactInfo.city || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                    <p className="text-xs text-muted dark:text-white/60 mb-2">Country</p>
                    <p className="text-sm font-semibold text-ink dark:text-white">{contactInfo.country || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                    <p className="text-xs text-muted dark:text-white/60 mb-2">Address</p>
                    <p className="text-sm font-semibold text-ink dark:text-white">{contactInfo.address || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                    <p className="text-xs text-muted dark:text-white/60 mb-2">Website</p>
                    <p className="text-sm font-semibold text-ink dark:text-white break-all">{contactInfo.website || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                    <p className="text-xs text-muted dark:text-white/60 mb-2">Timezone</p>
                    <p className="text-sm font-semibold text-ink dark:text-white">{contactInfo.timezone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              {profile.business_details && (
                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Business Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Business Name</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{profile.business_details.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Category</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{profile.business_details.category || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Description</p>
                      <p className="text-sm font-semibold text-ink dark:text-white">{profile.business_details.description || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Map URL</p>
                      <p className="text-sm font-semibold text-ink dark:text-white break-all">{profile.business_details.mapUrl || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Education */}
              {profile.education && profile.education.length > 0 && (
                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Education</h3>
                  <div className="space-y-4">
                    {profile.education.map((edu: any, idx: number) => (
                      <div key={idx} className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-ink dark:text-white">{edu.degree}</p>
                            <p className="text-sm text-muted dark:text-white/60">{edu.institution}</p>
                          </div>
                          <span className="text-xs text-muted dark:text-white/60">{edu.startYear} - {edu.endYear}</span>
                        </div>
                        <p className="text-xs text-muted dark:text-white/60 mb-1">Field: {edu.field}</p>
                        {edu.description && <p className="text-sm text-ink dark:text-white">{edu.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {profile.work_experience && profile.work_experience.length > 0 && (
                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Work Experience</h3>
                  <div className="space-y-4">
                    {profile.work_experience.map((exp: any, idx: number) => (
                      <div key={idx} className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-ink dark:text-white">{exp.role}</p>
                            <p className="text-sm text-muted dark:text-white/60">{exp.company}</p>
                          </div>
                          <span className="text-xs text-muted dark:text-white/60">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <p className="text-xs text-muted dark:text-white/60 mb-1">Location: {exp.location || "N/A"}</p>
                        {exp.description && <p className="text-sm text-ink dark:text-white">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {profile.social_links && profile.social_links.length > 0 && (
                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.social_links.map((social: any, idx: number) => (
                      <div key={idx} className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-ink dark:text-white">{social.platform}</p>
                          {social.visible && <span className="text-xs bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">Visible</span>}
                        </div>
                        <p className="text-xs text-muted dark:text-white/60 mb-2">@{social.username}</p>
                        {social.url && (
                          <a href={social.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline break-all">
                            {social.url}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {profile.digital_card?.skills && profile.digital_card.skills.length > 0 && (
                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.digital_card.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile.digital_card?.languages && profile.digital_card.languages.length > 0 && (
                <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
                  <h3 className="font-bold text-ink dark:text-white mb-4">Languages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.digital_card.languages.map((lang: any, idx: number) => (
                      <div key={idx} className="p-4 bg-paper-soft dark:bg-dark rounded-lg">
                        <p className="font-semibold text-ink dark:text-white">{lang.name}</p>
                        <p className="text-sm text-muted dark:text-white/60">Proficiency: {lang.level}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Other tabs placeholder */}
          {activeTab !== "overview" && activeTab !== "profile" && (
            <div className="bg-white dark:bg-dark-hover rounded-xl p-12 border border-line/50 dark:border-line/10 text-center">
              <p className="text-muted dark:text-white/60">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} content coming soon...
              </p>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
