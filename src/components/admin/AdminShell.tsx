import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Flag,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useRouter } from "next/router";

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminEmail, setAdminEmail] = useState("Admin User");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "user",
      title: "New User Registered",
      message: "Gitesh Kumar just signed up",
      timestamp: "2 minutes ago",
      read: false,
      icon: "👤",
    },
    {
      id: "2",
      type: "subscription",
      title: "New Subscription",
      message: "Aarav Mehta upgraded to Pro plan",
      timestamp: "15 minutes ago",
      read: false,
      icon: "💰",
    },
    {
      id: "3",
      type: "payment",
      title: "Payment Received",
      message: "₹499 payment received from Jane Smith",
      timestamp: "32 minutes ago",
      read: true,
      icon: "✅",
    },
    {
      id: "4",
      type: "user",
      title: "New User Registered",
      message: "Priya Singh just signed up",
      timestamp: "1 hour ago",
      read: true,
      icon: "👤",
    },
  ]);
  const router = useRouter();

  useEffect(() => {
    // Get admin email from localStorage
    const email = localStorage.getItem("adminEmail");
    if (email) {
      setAdminEmail(email);
    }
  }, []);

  const isActive = (path: string) => router.pathname === path;

  const handleLogout = async () => {
    // Confirm logout
    if (!confirm("Are you sure you want to logout?")) return;

    try {
      // Clear localStorage
      localStorage.removeItem("adminToken");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminEmail");

      // Redirect to login
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setNotificationOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "Revenue", icon: CreditCard, href: "/admin/revenue" },
    { name: "Subscriptions", icon: CreditCard, href: "/admin/subscriptions" },
    { name: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { name: "Leads", icon: MessageSquare, href: "/admin/leads" },
    { name: "Moderation", icon: Flag, href: "/admin/moderation" },
    { name: "Support", icon: MessageSquare, href: "/admin/support" },
    { name: "Team", icon: Shield, href: "/admin/team" },
    { name: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-paper dark:bg-dark">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white dark:bg-dark-hover border-r border-line dark:border-line/20 transition-all duration-300 fixed h-screen`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            {sidebarOpen && (
              <span className="text-xl font-black text-primary">CC</span>
            )}
            {sidebarOpen && (
              <span className="font-bold text-ink dark:text-white">Admin</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-paper-soft dark:hover:bg-dark transition-colors"
          >
            {sidebarOpen ? (
              <X size={20} className="text-ink dark:text-white" />
            ) : (
              <Menu size={20} className="text-ink dark:text-white" />
            )}
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-ink dark:text-white/70 hover:bg-paper-soft dark:hover:bg-dark"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-0 right-0 px-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-ink dark:text-white hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Top Bar */}
        <div className="bg-white dark:bg-dark-hover border-b border-line dark:border-line/20 sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users, cards, transactions..."
                className="w-full max-w-md px-4 py-2 bg-paper-soft dark:bg-dark border border-line dark:border-line/20 rounded-lg text-ink dark:text-white placeholder-muted dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2 hover:bg-paper-soft dark:hover:bg-dark rounded-lg transition-colors relative"
                >
                  <Bell size={20} className="text-ink dark:text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-hover rounded-xl shadow-lg border border-line/50 dark:border-line/10 z-50">
                    {/* Header */}
                    <div className="p-4 border-b border-line/30 dark:border-line/10">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-ink dark:text-white">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-sm text-muted dark:text-white/60">
                            No notifications yet
                          </p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => markNotificationAsRead(notif.id)}
                            className={`p-4 border-b border-line/20 dark:border-line/10 cursor-pointer transition-colors ${
                              notif.read
                                ? "bg-white dark:bg-dark-hover hover:bg-paper-soft dark:hover:bg-dark"
                                : "bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                            }`}
                          >
                            <div className="flex gap-3">
                              <span className="text-2xl flex-shrink-0">
                                {notif.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-semibold text-sm text-ink dark:text-white">
                                    {notif.title}
                                  </p>
                                  {!notif.read && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                                  )}
                                </div>
                                <p className="text-xs text-muted dark:text-white/60 mt-1">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-muted dark:text-white/50 mt-2">
                                  {notif.timestamp}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="p-4 border-t border-line/30 dark:border-line/10">
                        <button
                          onClick={clearAllNotifications}
                          className="w-full px-4 py-2 text-sm text-primary font-medium hover:bg-paper-soft dark:hover:bg-dark rounded-lg transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pl-4 border-l border-line dark:border-line/20">
                <div className="text-right">
                  <p className="text-sm font-medium text-ink dark:text-white">{adminEmail}</p>
                  <p className="text-xs text-muted dark:text-white/50">Super Admin</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                  {adminEmail.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
