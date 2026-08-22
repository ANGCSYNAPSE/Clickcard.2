import { useEffect, useState } from "react";
import Head from "next/head";
import AdminShell from "@/components/admin/AdminShell";
import { useRequireAdminAuth } from "@/lib/authGuards";
import {
  Save,
  RotateCcw,
  AlertTriangle,
  Copy,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";

export default function SettingsPage() {
  useRequireAdminAuth();

  const [activeTab, setActiveTab] = useState("features");
  const [settings, setSettings] = useState({
    userRegistrations: true,
    maintenanceMode: false,
    digitalCards: true,
    premiumSubscriptions: true,
    analyticsTracking: true,
    liveSupport: false,
    maxFileSize: 10,
    emailNotifications: true,
    smsNotifications: true,
    marketingEmails: false,
    dataAnalytics: true,
    defaultUserPlan: "Free Plan",
    allowedFileTypes: ["image/jpeg", "image/png", "application/pdf", "video/mp4"],
  });

  const [rateLimit, setRateLimit] = useState({
    defaultLimit: 100,
    defaultWindow: 15,
    authentication: 10,
    authWindow: 15,
    general: 100,
    generalWindow: 15,
    fileUpload: 20,
    fileUploadWindow: 15,
    analytics: 60,
    analyticsWindow: 15,
  });

  const [enableRateLimiting, setEnableRateLimiting] = useState(true);

  const [apiKeys, setApiKeys] = useState([
    {
      id: "1",
      name: "Mobile App",
      preview: "ck_live__atodc3d",
      permissions: "Read / Write",
      status: "Active",
      created: "May 20, 2025",
    },
    {
      id: "2",
      name: "Analytics Service",
      preview: "ck_live__e85g9d8",
      permissions: "Read Only",
      status: "Active",
      created: "May 18, 2025",
    },
    {
      id: "3",
      name: "Zapier Integration",
      preview: "ck_live__jb00jd12",
      permissions: "Read / Write",
      status: "Inactive",
      created: "May 15, 2025",
    },
    {
      id: "4",
      name: "Webhook Service",
      preview: "ck_live__m3e5qf88",
      permissions: "Read / Write",
      status: "Active",
      created: "May 10, 2025",
    },
  ]);

  const handleSaveSettings = () => {
    console.log("Saving settings...", settings);
    // API call would go here
  };

  const handleResetSettings = () => {
    console.log("Resetting to default settings");
    // Reset logic
  };

  const handleClearCache = () => {
    console.log("Clearing cache");
  };

  const handleResetAll = () => {
    console.log("Resetting all settings");
  };

  const toggleFeature = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <AdminShell>
      <Head>
        <title>System Settings · ClickCard Admin</title>
      </Head>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink dark:text-white mb-2">
          System Settings
        </h1>
        <p className="text-sm text-muted dark:text-white/60">
          Manage platform configuration, features and system preferences.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleResetSettings}
          className="px-6 py-2 border border-line/50 dark:border-line/10 rounded-lg text-ink dark:text-white font-medium hover:bg-paper-soft dark:hover:bg-dark transition-colors flex items-center gap-2"
        >
          <RotateCcw size={18} />
          Reset to Default
        </button>
        <button
          onClick={handleSaveSettings}
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center gap-2 ml-auto"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-line/30 dark:border-line/10 mb-6 bg-white dark:bg-dark-hover rounded-t-xl">
        {[
          { id: "features", label: "Feature Flags", icon: "🚩" },
          { id: "platform", label: "Platform Settings", icon: "⚙️" },
          { id: "api", label: "API Settings", icon: "🔌" },
          { id: "email", label: "Email Templates", icon: "📧" },
          { id: "sms", label: "SMS Templates", icon: "💬" },
          { id: "security", label: "Security", icon: "🔒" },
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

      {/* Feature Flags Tab */}
      {activeTab === "features" && (
        <div className="bg-white dark:bg-dark-hover rounded-xl p-8 border border-line/50 dark:border-line/10">
          <h2 className="text-lg font-bold text-ink dark:text-white mb-2">
            Feature Flags
          </h2>
          <p className="text-sm text-muted dark:text-white/60 mb-6">
            Enable or disable platform features and functionality.
          </p>

          <div className="space-y-4">
            {[
              {
                key: "userRegistrations",
                label: "User Registrations",
                description: "Allow new users to register on the platform",
                icon: "👤",
              },
              {
                key: "maintenanceMode",
                label: "Maintenance Mode",
                description: "Put the platform in maintenance mode",
                icon: "🔧",
              },
              {
                key: "digitalCards",
                label: "Digital Cards",
                description: "Enable creation and sharing of digital cards",
                icon: "📇",
              },
              {
                key: "premiumSubscriptions",
                label: "Premium Subscriptions",
                description: "Allow users to purchase premium plans",
                icon: "🛒",
              },
              {
                key: "analyticsTracking",
                label: "Analytics Tracking",
                description: "Collect and display analytics data",
                icon: "📊",
              },
              {
                key: "liveSupport",
                label: "Live Support",
                description: "Enable live chat support for users",
                icon: "💬",
              },
            ].map((feature) => (
              <div
                key={feature.key}
                className="flex items-center justify-between p-4 bg-paper-soft dark:bg-dark rounded-lg border border-line/20 dark:border-line/10"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <p className="font-semibold text-ink dark:text-white">
                      {feature.label}
                    </p>
                    <p className="text-xs text-muted dark:text-white/60 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFeature(feature.key)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings[feature.key as keyof typeof settings]
                      ? "bg-primary"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings[feature.key as keyof typeof settings]
                        ? "right-1"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Settings Tab */}
      {activeTab === "platform" && (
        <div className="space-y-6">
          {/* Left Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Max File Upload Size */}
            <div className="bg-white dark:bg-dark-hover rounded-xl p-8 border border-line/50 dark:border-line/10">
              <h2 className="text-lg font-bold text-ink dark:text-white mb-2">
                Max File Upload Size
              </h2>
              <p className="text-xs text-muted dark:text-white/60 mb-4">
                Maximum file size for uploads (1MB - 500MB)
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maxFileSize: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white"
                />
                <span className="text-sm font-semibold text-ink dark:text-white whitespace-nowrap">
                  MB
                </span>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="bg-white dark:bg-dark-hover rounded-xl p-8 border border-line/50 dark:border-line/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink dark:text-white mb-1">
                    Email Notifications
                  </h2>
                  <p className="text-xs text-muted dark:text-white/60">
                    Send email notifications to users
                  </p>
                </div>
                <button
                  onClick={() => toggleFeature("emailNotifications")}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.emailNotifications ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.emailNotifications ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Allowed File Types */}
            <div className="bg-white dark:bg-dark-hover rounded-xl p-8 border border-line/50 dark:border-line/10">
              <h2 className="text-lg font-bold text-ink dark:text-white mb-2">
                Allowed File Types
              </h2>
              <p className="text-xs text-muted dark:text-white/60 mb-4">
                Allowed file types for uploads
              </p>
              <div className="flex flex-wrap gap-2">
                {settings.allowedFileTypes.map((type) => (
                  <div
                    key={type}
                    className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs font-medium flex items-center gap-2"
                  >
                    {type}
                    <button className="hover:text-primary-hover">×</button>
                  </div>
                ))}
                <button className="px-3 py-1 border border-dashed border-primary/50 text-primary rounded-full text-xs font-medium hover:bg-primary/5 transition-colors flex items-center gap-1">
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="bg-white dark:bg-dark-hover rounded-xl p-8 border border-line/50 dark:border-line/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink dark:text-white mb-1">
                    SMS Notifications
                  </h2>
                  <p className="text-xs text-muted dark:text-white/60">
                    Send SMS notifications to users
                  </p>
                </div>
                <button
                  onClick={() => toggleFeature("smsNotifications")}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.smsNotifications ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.smsNotifications ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Marketing Emails */}
            <div className="bg-white dark:bg-dark-hover rounded-xl p-8 border border-line/50 dark:border-line/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink dark:text-white mb-1">
                    Marketing Emails
                  </h2>
                  <p className="text-xs text-muted dark:text-white/60">
                    Send marketing emails to users
                  </p>
                </div>
                <button
                  onClick={() => toggleFeature("marketingEmails")}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.marketingEmails ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.marketingEmails ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Data Analytics */}
            <div className="bg-white dark:bg-dark-hover rounded-xl p-8 border border-line/50 dark:border-line/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink dark:text-white mb-1">
                    Data Analytics
                  </h2>
                  <p className="text-xs text-muted dark:text-white/60">
                    Collect anonymous usage data
                  </p>
                </div>
                <button
                  onClick={() => toggleFeature("dataAnalytics")}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.dataAnalytics ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.dataAnalytics ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Default User Plan */}
          <div className="bg-white dark:bg-dark-hover rounded-xl p-8 border border-line/50 dark:border-line/10">
            <h2 className="text-lg font-bold text-ink dark:text-white mb-2">
              Default User Plan
            </h2>
            <p className="text-xs text-muted dark:text-white/60 mb-4">
              Default plan assigned to new users
            </p>
            <select className="w-full px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white">
              <option>Free Plan</option>
              <option>Basic Plan</option>
              <option>Pro Plan</option>
              <option>Enterprise Plan</option>
            </select>
          </div>
        </div>
      )}

      {/* API Settings Tab */}
      {activeTab === "api" && (
        <div className="space-y-6">
          {/* Rate Limiting Section */}
          <div className="bg-white dark:bg-dark-hover rounded-xl p-8 border border-line/50 dark:border-line/10">
            <h2 className="text-lg font-bold text-ink dark:text-white mb-2">
              Rate Limiting
            </h2>
            <p className="text-sm text-muted dark:text-white/60 mb-6">
              Configure API rate limits and access control.
            </p>

            <div className="mb-8 flex items-center gap-4">
              <div>
                <label className="text-sm font-semibold text-ink dark:text-white">
                  Default Rate Limit
                </label>
                <p className="text-xs text-muted dark:text-white/60 mt-1">
                  Requests allowed per window
                </p>
              </div>
              <input
                type="number"
                value={rateLimit.defaultLimit}
                onChange={(e) =>
                  setRateLimit((prev) => ({
                    ...prev,
                    defaultLimit: parseInt(e.target.value),
                  }))
                }
                className="w-32 px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white"
              />
            </div>

            <div className="mb-8 flex items-center gap-4">
              <div>
                <label className="text-sm font-semibold text-ink dark:text-white">
                  Rate Limit Window
                </label>
                <p className="text-xs text-muted dark:text-white/60 mt-1">
                  Time window for rate limit
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={rateLimit.defaultWindow}
                  onChange={(e) =>
                    setRateLimit((prev) => ({
                      ...prev,
                      defaultWindow: parseInt(e.target.value),
                    }))
                  }
                  className="w-32 px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white"
                />
                <span className="text-sm text-muted dark:text-white/60">minutes</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={enableRateLimiting}
                  onChange={(e) => setEnableRateLimiting(e.target.checked)}
                  className="w-4 h-4 rounded border-line/50 dark:border-line/10"
                />
                <span className="text-sm font-medium text-ink dark:text-white">
                  Enable Rate Limiting
                </span>
              </label>
              <p className="text-xs text-muted dark:text-white/60 mt-2 ml-7">
                Apply rate limiting to all API endpoints
              </p>
            </div>

            {/* Rate Limit by Endpoint Type */}
            <div className="mt-8 pt-8 border-t border-line/30 dark:border-line/10">
              <h3 className="text-sm font-bold text-ink dark:text-white mb-4">
                Rate Limit by Endpoint Type
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line/30 dark:border-line/10">
                      <th className="text-left py-3 px-4 font-semibold text-ink dark:text-white">
                        Endpoint Type
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-ink dark:text-white">
                        Limit
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-ink dark:text-white">
                        Window
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-line/20 dark:border-line/10">
                      <td className="py-3 px-4 text-ink dark:text-white">Authentication</td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={rateLimit.authentication}
                          className="w-20 px-2 py-1 text-sm border border-line/50 dark:border-line/10 rounded bg-paper-soft dark:bg-dark text-ink dark:text-white"
                        />
                        {" requests"}
                      </td>
                      <td className="py-3 px-4">15 minutes</td>
                    </tr>
                    <tr className="border-b border-line/20 dark:border-line/10">
                      <td className="py-3 px-4 text-ink dark:text-white">General API</td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={rateLimit.general}
                          className="w-20 px-2 py-1 text-sm border border-line/50 dark:border-line/10 rounded bg-paper-soft dark:bg-dark text-ink dark:text-white"
                        />
                        {" requests"}
                      </td>
                      <td className="py-3 px-4">15 minutes</td>
                    </tr>
                    <tr className="border-b border-line/20 dark:border-line/10">
                      <td className="py-3 px-4 text-ink dark:text-white">File Upload</td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={rateLimit.fileUpload}
                          className="w-20 px-2 py-1 text-sm border border-line/50 dark:border-line/10 rounded bg-paper-soft dark:bg-dark text-ink dark:text-white"
                        />
                        {" requests"}
                      </td>
                      <td className="py-3 px-4">15 minutes</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-ink dark:text-white">Analytics</td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={rateLimit.analytics}
                          className="w-20 px-2 py-1 text-sm border border-line/50 dark:border-line/10 rounded bg-paper-soft dark:bg-dark text-ink dark:text-white"
                        />
                        {" requests"}
                      </td>
                      <td className="py-3 px-4">15 minutes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* API Key Management */}
          <div className="bg-white dark:bg-dark-hover rounded-xl p-8 border border-line/50 dark:border-line/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-ink dark:text-white">
                  API Key Management
                </h2>
                <p className="text-sm text-muted dark:text-white/60 mt-1">
                  Manage API keys for third-party integrations.
                </p>
              </div>
              <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center gap-2">
                <Plus size={18} />
                Generate New Key
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line/30 dark:border-line/10">
                    <th className="text-left py-3 px-4 font-semibold text-ink dark:text-white">
                      Key Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-ink dark:text-white">
                      Key Preview
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-ink dark:text-white">
                      Permissions
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-ink dark:text-white">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-ink dark:text-white">
                      Created
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-ink dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr
                      key={key.id}
                      className="border-b border-line/20 dark:border-line/10 hover:bg-paper-soft dark:hover:bg-dark"
                    >
                      <td className="py-4 px-4 text-ink dark:text-white font-medium">
                        {key.name}
                      </td>
                      <td className="py-4 px-4 text-ink dark:text-white font-mono text-xs">
                        {key.preview}
                      </td>
                      <td className="py-4 px-4 text-ink dark:text-white">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            key.permissions === "Read Only"
                              ? "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                              : "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                          }`}
                        >
                          {key.permissions}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            key.status === "Active"
                              ? "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                              : "bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {key.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-muted dark:text-white/60">
                        {key.created}
                      </td>
                      <td className="py-4 px-4 text-right flex justify-end gap-2">
                        <button className="p-1 hover:bg-paper-soft dark:hover:bg-dark rounded text-muted dark:text-white/60">
                          <Eye size={16} />
                        </button>
                        <button className="p-1 hover:bg-paper-soft dark:hover:bg-dark rounded text-muted dark:text-white/60">
                          <Copy size={16} />
                        </button>
                        <button className="p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-600 dark:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted dark:text-white/60 mt-4">
              Showing 1 to 4 of 4 API keys
            </p>
          </div>
        </div>
      )}

      {/* Other tabs placeholder */}
      {["email", "sms", "security"].includes(activeTab) && (
        <div className="bg-white dark:bg-dark-hover rounded-xl p-12 border border-line/50 dark:border-line/10 text-center">
          <p className="text-muted dark:text-white/60">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} configuration coming soon...
          </p>
        </div>
      )}

      {/* Danger Zone */}
      <div className="mt-12 bg-red-50 dark:bg-red-500/10 rounded-xl p-8 border border-red-200 dark:border-red-500/20">
        <div className="flex items-start gap-4 mb-6">
          <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-lg font-bold text-red-900 dark:text-red-400 mb-1">
              Danger Zone
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400/80">
              Irreversible and destructive actions for your platform.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClearCache}
            className="px-4 py-2 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
          >
            Clear Cache
          </button>
          <button
            onClick={handleResetAll}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Reset All Settings
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
