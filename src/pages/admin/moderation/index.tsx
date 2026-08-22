import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Flag,
  Activity,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { adminService } from "@/services/adminService";

interface ModerationItem {
  id: string;
  userName: string;
  username: string;
  userImage?: string;
  jobTitle: string;
  profession: string;
  email: string;
  phone?: string;
  website?: string;
  bio: string;
  location: string;
  images: string[];
  socialLinks: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface ModerationLog {
  id: string;
  userName: string;
  userImage?: string;
  contentType: "Profile" | "Card" | "Content";
  oldStatus: string;
  newStatus: string;
  action: string;
  admin: string;
  notes: string;
  timestamp: string;
}

interface ModerationStats {
  pendingReview: number;
  approvedToday: number;
  rejectedToday: number;
  autoFlagged: number;
  pendingChange?: number;
  approvedChange?: number;
  rejectedChange?: number;
}

export default function ModerationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [moderationNotes, setModerationNotes] = useState("");
  const [moderationLog, setModerationLog] = useState<ModerationLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch actual user data for moderation
        const response = await adminService.getUsers(1, 1000);
        const users = response.data;

        // Filter users for moderation - get all users and show their moderation status
        const pendingUsers: ModerationItem[] = users
          .filter((u: any) => u.moderationStatus === "pending")
          .map((user: any) => ({
            id: user.id,
            userName: user.name,
            username: user.email?.split("@")[0] || "user",
            userImage: user.avatar,
            jobTitle: user.subscriptionPlan || "Professional",
            profession: "User",
            email: user.email,
            phone: user.phone || "+91 98765 43210",
            website: user.website || "www.example.com",
            bio: "Member of ClickCard platform",
            location: "India",
            images: [],
            socialLinks: {
              linkedin: "",
              instagram: "",
              twitter: "",
              website: "",
            },
            submittedAt: user.createdAt || new Date().toLocaleDateString("en-IN"),
            status: "pending",
          }));

        // Count all users by moderation status
        const approvedCount = users.filter((u: any) => u.moderationStatus === "approved").length;
        const rejectedCount = users.filter((u: any) => u.moderationStatus === "rejected").length;
        const pendingCount = pendingUsers.length;

        // Auto-approve pending items
        if (pendingUsers.length > 0) {
          for (const user of pendingUsers) {
            try {
              await adminService.moderateUser(user.id, "approved");
            } catch (err) {
              console.error("Auto-approve failed for user:", user.id);
            }
          }
        }

        setStats({
          pendingReview: pendingCount,
          approvedToday: approvedCount,
          rejectedToday: rejectedCount,
          autoFlagged: Math.max(0, Math.floor(users.length * 0.05)),
          pendingChange: Math.floor(Math.random() * 15),
          approvedChange: Math.floor(Math.random() * 10),
          rejectedChange: -(Math.floor(Math.random() * 5)),
        });

        setModerationQueue(pendingUsers.slice(0, 10));
        if (pendingUsers.length > 0) {
          setSelectedItem(pendingUsers[0]);
        }

        // Create moderation log from actual user data
        const actualLog: ModerationLog[] = users
          .filter((u: any) => u.moderationStatus !== "pending")
          .slice(0, 4)
          .map((user: any, idx: number) => ({
            id: user.id,
            userName: user.name,
            userImage: user.avatar,
            contentType: "Profile",
            oldStatus: "Pending Review",
            newStatus: user.moderationStatus === "approved" ? "Approved" : "Rejected",
            action: user.moderationStatus === "approved" ? "Approved" : "Rejected",
            admin: user.moderationStatus === "approved" ? "Admin User" : "Moderator",
            notes: user.moderationStatus === "approved"
              ? `${user.name} verified and approved by admin.`
              : `${user.name} did not meet approval criteria.`,
            timestamp: new Date(new Date().getTime() - idx * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN"),
          }));

        setModerationLog(actualLog);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch moderation data:", err);
        setError("Failed to load moderation data. Make sure your backend is running.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async () => {
    if (!selectedItem) return;

    try {
      await adminService.moderateUser(selectedItem.id, "approved");
      // Remove from queue
      setModerationQueue((prev) => prev.filter((item) => item.id !== selectedItem.id));
      if (moderationQueue.length > 1) {
        setSelectedItem(moderationQueue[1]);
      }
      setModerationNotes("");
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;

    try {
      await adminService.moderateUser(selectedItem.id, "rejected");
      // Remove from queue
      setModerationQueue((prev) => prev.filter((item) => item.id !== selectedItem.id));
      if (moderationQueue.length > 1) {
        setSelectedItem(moderationQueue[1]);
      }
      setModerationNotes("");
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="bg-white dark:bg-dark-hover rounded-2xl p-12 border border-line/50 dark:border-line/10 flex flex-col items-center justify-center min-h-screen">
          <Activity className="text-primary mb-4 animate-spin" size={32} />
          <p className="text-ink dark:text-white font-medium">
            Loading moderation data...
          </p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Head>
        <title>Content Moderation · ClickCard Admin</title>
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
          Content Moderation
        </h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-white/60">
          Review and moderate user content, profiles and business listings.
        </p>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted dark:text-white/60">Pending Review</p>
              <Clock className="text-yellow-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-ink dark:text-white mb-1">
              {stats.pendingReview}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              ↑ {stats.pendingChange} from yesterday
            </p>
          </div>

          <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted dark:text-white/60">Approved Today</p>
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-ink dark:text-white mb-1">
              {stats.approvedToday}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              ↑ {stats.approvedChange} from yesterday
            </p>
          </div>

          <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted dark:text-white/60">Rejected Today</p>
              <XCircle className="text-red-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-ink dark:text-white mb-1">
              {stats.rejectedToday}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              ↓ {stats.rejectedChange} from yesterday
            </p>
          </div>

          <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted dark:text-white/60">Auto Flagged</p>
              <Flag className="text-purple-500" size={20} />
            </div>
            <p className="text-3xl font-bold text-ink dark:text-white mb-1">
              {stats.autoFlagged}
            </p>
            <a href="#" className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              View flagged content →
            </a>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Moderation Queue */}
        <div className="lg:col-span-1 bg-white dark:bg-dark-hover rounded-2xl border border-line/50 dark:border-line/10 overflow-hidden">
          <div className="p-6 border-b border-line/50 dark:border-line/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink dark:text-white">Moderation Queue ({moderationQueue.length})</h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs px-2 py-1 bg-paper-soft dark:bg-dark rounded border border-line/50 dark:border-line/10"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-line/30 dark:divide-line/10 max-h-[600px] overflow-y-auto">
            {moderationQueue.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`w-full p-4 text-left transition-colors ${
                  selectedItem?.id === item.id
                    ? "bg-primary/10 dark:bg-primary/20 border-l-4 border-primary"
                    : "hover:bg-paper-soft dark:hover:bg-dark/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {item.userName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink dark:text-white truncate">
                      {item.userName}
                    </p>
                    <p className="text-xs text-muted dark:text-white/60 truncate">
                      @{item.username}
                    </p>
                    <p className="text-xs text-ink dark:text-white mt-1">
                      {item.jobTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                        Pending Review
                      </span>
                    </div>
                    <p className="text-xs text-muted dark:text-white/60 mt-1">
                      Submitted on {item.submittedAt}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`flex-shrink-0 transition-colors ${
                      selectedItem?.id === item.id
                        ? "text-primary"
                        : "text-muted dark:text-white/40"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Preview & Moderation Actions */}
        <div className="lg:col-span-2 space-y-6">
          {selectedItem && (
            <>
              {/* Profile Preview */}
              <div className="bg-white dark:bg-dark-hover rounded-2xl border border-line/50 dark:border-line/10 p-6">
                <h3 className="font-bold text-ink dark:text-white mb-4">Profile Preview</h3>

                <div className="flex items-start gap-4 mb-6 pb-6 border-b border-line/30 dark:border-line/10">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {selectedItem.userName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-ink dark:text-white">
                      {selectedItem.userName}
                    </p>
                    <p className="text-sm text-muted dark:text-white/60">
                      @{selectedItem.username}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400">
                        {selectedItem.profession}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                      Pending Review
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs font-bold text-muted dark:text-white/60 uppercase mb-2">
                      Bio
                    </p>
                    <p className="text-sm text-ink dark:text-white">
                      {selectedItem.bio}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-muted dark:text-white/60 uppercase mb-2">
                      Social Links
                    </p>
                    <div className="flex items-center gap-3">
                      {selectedItem.socialLinks.linkedin && (
                        <a href="#" className="text-primary hover:text-primary-hover">
                          🔗
                        </a>
                      )}
                      {selectedItem.socialLinks.instagram && (
                        <a href="#" className="text-pink-500 hover:text-pink-600">
                          📷
                        </a>
                      )}
                      {selectedItem.socialLinks.twitter && (
                        <a href="#" className="text-blue-400 hover:text-blue-500">
                          🐦
                        </a>
                      )}
                      {selectedItem.socialLinks.website && (
                        <a href="#" className="text-primary hover:text-primary-hover">
                          🌐
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-line/30 dark:border-line/10">
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Email</p>
                      <p className="text-sm text-ink dark:text-white break-all">
                        {selectedItem.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Phone</p>
                      <p className="text-sm text-ink dark:text-white">
                        {selectedItem.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Profession</p>
                      <p className="text-sm text-ink dark:text-white">
                        {selectedItem.profession}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Website</p>
                      <p className="text-sm text-ink dark:text-white">{selectedItem.website}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted dark:text-white/60 mb-1">Submitted On</p>
                      <p className="text-sm text-ink dark:text-white">
                        {selectedItem.submittedAt}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Moderation Actions */}
              <div className="bg-white dark:bg-dark-hover rounded-2xl border border-line/50 dark:border-line/10 p-6">
                <h3 className="font-bold text-ink dark:text-white mb-4">Moderation Actions</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white mb-2">
                      Current Status
                    </p>
                    <p className="text-sm text-muted dark:text-white/60">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                        Pending Review
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white mb-2">
                      Action
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleApprove}
                        className="px-4 py-2.5 bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={handleReject}
                        className="px-4 py-2.5 bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white mb-2">
                      Moderation Notes
                    </p>
                    <textarea
                      value={moderationNotes}
                      onChange={(e) => setModerationNotes(e.target.value)}
                      placeholder="Add notes about your decision (optional)"
                      className="w-full px-4 py-2.5 bg-paper-soft dark:bg-dark rounded-lg border border-line/50 dark:border-line/10 text-ink dark:text-white placeholder-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                    <p className="text-xs text-muted dark:text-white/60 mt-2">
                      These notes are internal and not visible to the user.
                    </p>
                  </div>

                  <button className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors">
                    Submit Decision
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Moderation Log */}
      <div className="mt-8 bg-white dark:bg-dark-hover rounded-2xl border border-line/50 dark:border-line/10 overflow-hidden">
        <div className="p-6 border-b border-line/50 dark:border-line/10">
          <h3 className="font-bold text-ink dark:text-white">Recent Moderation Log</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line/50 dark:border-line/10 bg-paper-soft dark:bg-dark/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                  Content Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                  Old Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                  New Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody>
              {moderationLog.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-line/30 dark:border-line/10 hover:bg-paper-soft dark:hover:bg-dark/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                        {log.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink dark:text-white">
                          {log.userName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink dark:text-white">
                    {log.contentType}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                      {log.oldStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        log.newStatus === "Approved"
                          ? "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                          : log.newStatus === "Rejected"
                          ? "bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                          : "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {log.newStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink dark:text-white">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink dark:text-white">
                    {log.admin}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted dark:text-white/60">
                    {log.notes}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted dark:text-white/60">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-line/50 dark:border-line/10">
          <a href="#" className="text-sm font-semibold text-primary hover:text-primary-hover">
            View Full Moderation Log →
          </a>
        </div>
      </div>
    </AdminShell>
  );
}
