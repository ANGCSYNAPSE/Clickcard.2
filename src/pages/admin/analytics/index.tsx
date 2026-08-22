import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Calendar,
  Filter,
  Download,
  Eye,
  Mouse,
  Share2,
  Download as DownloadIcon,
  Users,
  Activity,
  TrendingUp,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { adminService } from "@/services/adminService";
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

const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B"];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("2025-05-20");
  const [endDate, setEndDate] = useState("2025-06-18");
  const [users, setUsers] = useState<any[]>([]);

  // Chart data
  const [viewsClicksData, setViewsClicksData] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [topProfiles, setTopProfiles] = useState<any[]>([]);
  const [topLinks, setTopLinks] = useState<any[]>([]);

  // Analytics metrics
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalShares, setTotalShares] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);

  // Platform overview
  const [avgSessionDuration, setAvgSessionDuration] = useState("02:47");
  const [bounceRate, setBounceRate] = useState("42.6%");
  const [pagesPerSession, setPagesPerSession] = useState("3.24");
  const [newVisitors, setNewVisitors] = useState(0);
  const [returningVisitors, setReturningVisitors] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch user data
        const response = await adminService.getUsers(1, 1000);
        const usersData = response.data;
        setUsers(usersData);

        // Calculate analytics from user data
        const totalUsersCount = usersData.length;
        const activeUsers = usersData.filter((u: any) => u.status === "active").length;

        // Generate mock analytics based on user count
        const baseViews = totalUsersCount * 150;
        const baseClicks = totalUsersCount * 50;
        const baseShares = totalUsersCount * 15;
        const baseDownloads = totalUsersCount * 8;

        setTotalViews(baseViews);
        setTotalClicks(baseClicks);
        setTotalShares(baseShares);
        setTotalDownloads(baseDownloads);
        setUniqueVisitors(Math.floor(totalUsersCount * 0.85));

        // Device breakdown
        setDeviceData([
          { name: "Mobile", value: Math.floor(baseViews * 0.683) },
          { name: "Desktop", value: Math.floor(baseViews * 0.241) },
          { name: "Tablet", value: Math.floor(baseViews * 0.056) },
          { name: "Other", value: Math.floor(baseViews * 0.02) },
        ]);

        // Geographic data
        setGeoData([
          { country: "India", views: Math.floor(baseViews * 0.4265) },
          { country: "United States", views: Math.floor(baseViews * 0.1831) },
          { country: "Indonesia", views: Math.floor(baseViews * 0.087) },
          { country: "Brazil", views: Math.floor(baseViews * 0.056) },
          { country: "United Kingdom", views: Math.floor(baseViews * 0.042) },
        ]);

        // Views & Clicks Trend
        const trendData = [];
        const dates = ["May 20", "May 27", "Jun 3", "Jun 10", "Jun 17"];
        for (let i = 0; i < dates.length; i++) {
          trendData.push({
            date: dates[i],
            views: Math.floor(baseViews / 5 + Math.random() * (baseViews / 10)),
            clicks: Math.floor(baseClicks / 5 + Math.random() * (baseClicks / 10)),
          });
        }
        setViewsClicksData(trendData);

        // Top performing profiles
        const topProfs = usersData
          .sort((a: any, b: any) => (b.totalViews || 0) - (a.totalViews || 0))
          .slice(0, 5)
          .map((user: any, idx: number) => ({
            rank: idx + 1,
            name: user.name,
            username: user.email.split("@")[0],
            avatar: user.avatar || user.name.charAt(0),
            views: Math.floor(Math.random() * 50000),
            clicks: Math.floor(Math.random() * 15000),
            shares: Math.floor(Math.random() * 5000),
            ctr: (Math.random() * 30).toFixed(2) + "%",
          }));
        setTopProfiles(topProfs);

        // Top share links
        const topShareLinks = usersData
          .slice(0, 5)
          .map((user: any, idx: number) => ({
            rank: idx + 1,
            linkTitle: `${user.name} - Digital Card`,
            linkPreview: `clickcard.app/${user.email.split("@")[0]}`,
            clicks: Math.floor(Math.random() * 5000),
            shares: Math.floor(Math.random() * 2000),
            ctr: (Math.random() * 30).toFixed(2) + "%",
            createdOn: user.createdAt || new Date().toLocaleDateString("en-IN"),
          }));
        setTopLinks(topShareLinks);

        // Platform overview
        setNewVisitors(Math.floor(totalUsersCount * 0.683));
        setReturningVisitors(Math.floor(totalUsersCount * 0.317));
        setTotalEvents(baseViews + baseClicks + baseShares + baseDownloads);

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [startDate, endDate]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

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

  return (
    <AdminShell>
      <Head>
        <title>Analytics · ClickCard Admin</title>
      </Head>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-ink dark:text-white">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-white/60">
            Platform-wide analytics and performance insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-hover border border-line/50 dark:border-line/10 rounded-lg">
            <Calendar size={18} className="text-muted dark:text-white/60" />
            <span className="text-sm text-ink dark:text-white font-medium">
              {startDate.split("-")[2]} {startDate.split("-")[1]}, {startDate.split("-")[0]} - {endDate.split("-")[2]} {endDate.split("-")[1]}, {endDate.split("-")[0]}
            </span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-hover border border-line/50 dark:border-line/10 rounded-lg text-ink dark:text-white font-medium hover:bg-paper-soft dark:hover:bg-dark transition-colors">
            <Filter size={18} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <p className="text-sm text-muted dark:text-white/60 mb-2">Total Views</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-ink dark:text-white">
                {formatNumber(totalViews)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ↑ 18.6% from last 30 days
              </p>
            </div>
            <Eye className="text-primary" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <p className="text-sm text-muted dark:text-white/60 mb-2">Total Clicks</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-ink dark:text-white">
                {formatNumber(totalClicks)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ↑ 24.3% from last 30 days
              </p>
            </div>
            <Mouse className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <p className="text-sm text-muted dark:text-white/60 mb-2">Total Shares</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-ink dark:text-white">
                {formatNumber(totalShares)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ↑ 15.8% from last 30 days
              </p>
            </div>
            <Share2 className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <p className="text-sm text-muted dark:text-white/60 mb-2">Total Downloads</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-ink dark:text-white">
                {formatNumber(totalDownloads)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ↑ 12.5% from last 30 days
              </p>
            </div>
            <DownloadIcon className="text-orange-500" size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <p className="text-sm text-muted dark:text-white/60 mb-2">Unique Visitors</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-ink dark:text-white">
                {formatNumber(uniqueVisitors)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ↑ 20.1% from last 30 days
              </p>
            </div>
            <Users className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Views & Clicks Trend */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-ink dark:text-white">Views & Clicks Trend</h3>
            <select className="px-3 py-1 text-xs bg-paper-soft dark:bg-dark rounded border border-line/50 dark:border-line/10">
              <option>30 Days</option>
              <option>60 Days</option>
              <option>90 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewsClicksData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#3B82F6" name="Views" />
              <Line type="monotone" dataKey="clicks" stroke="#8B5CF6" name="Clicks" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <h3 className="font-bold text-ink dark:text-white mb-6">Device Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {deviceData.map((device, idx) => (
              <div key={device.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></div>
                  <span className="text-ink dark:text-white">{device.name}</span>
                </div>
                <span className="font-semibold text-ink dark:text-white">
                  {((device.value / totalViews) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-ink dark:text-white">Geographic Distribution</h3>
          <select className="px-3 py-1 text-xs bg-paper-soft dark:bg-dark rounded border border-line/50 dark:border-line/10">
            <option>Views</option>
            <option>Clicks</option>
            <option>Shares</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
            <p className="text-center text-sm text-muted dark:text-white/60">
              Geographic map visualization
            </p>
          </div>
          <div className="space-y-3">
            {geoData.map((geo, idx) => (
              <div key={geo.country} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink dark:text-white">
                      {geo.country}
                    </p>
                    <div className="w-24 h-2 bg-paper-soft dark:bg-dark rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${((geo.views / totalViews) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-ink dark:text-white">
                    {((geo.views / totalViews) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Profiles */}
      <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10 mb-6">
        <h3 className="font-bold text-ink dark:text-white mb-4">Top Performing Profiles</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line/30 dark:border-line/10">
                <th className="px-4 py-3 text-left font-bold text-muted dark:text-white/60">Rank</th>
                <th className="px-4 py-3 text-left font-bold text-muted dark:text-white/60">Profile</th>
                <th className="px-4 py-3 text-left font-bold text-muted dark:text-white/60">Views</th>
                <th className="px-4 py-3 text-left font-bold text-muted dark:text-white/60">Clicks</th>
                <th className="px-4 py-3 text-left font-bold text-muted dark:text-white/60">Shares</th>
                <th className="px-4 py-3 text-left font-bold text-muted dark:text-white/60">CTR</th>
              </tr>
            </thead>
            <tbody>
              {topProfiles.map((profile) => (
                <tr key={profile.rank} className="border-b border-line/30 dark:border-line/10 hover:bg-paper-soft dark:hover:bg-dark/50">
                  <td className="px-4 py-3 text-ink dark:text-white font-semibold">{profile.rank}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                        {profile.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-ink dark:text-white">{profile.name}</p>
                        <p className="text-xs text-muted dark:text-white/60">@{profile.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink dark:text-white">{formatNumber(profile.views)}</td>
                  <td className="px-4 py-3 text-ink dark:text-white">{formatNumber(profile.clicks)}</td>
                  <td className="px-4 py-3 text-ink dark:text-white">{formatNumber(profile.shares)}</td>
                  <td className="px-4 py-3 text-ink dark:text-white font-semibold">{profile.ctr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="mt-4 px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg text-primary font-medium hover:bg-paper-soft dark:hover:bg-dark transition-colors">
          View All Profiles →
        </button>
      </div>

      {/* Top Share Links */}
      <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10 mb-6">
        <h3 className="font-bold text-ink dark:text-white mb-4">Top Share Links</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line/30 dark:border-line/10">
                <th className="px-4 py-3 text-left font-bold text-muted dark:text-white/60">Rank</th>
                <th className="px-4 py-3 text-left font-bold text-muted dark:text-white/60">Link Preview</th>
                <th className="px-4 py-3 text-left font-bold text-muted dark:text-white/60">Clicks</th>
                <th className="px-4 py-3 text-left font-bold text-muted dark:text-white/60">Shares</th>
                <th className="px-4 py-3 text-left font-bold text-muted dark:text-white/60">CTR</th>
                <th className="px-4 py-3 text-left font-bold text-muted dark:text-white/60">Created On</th>
              </tr>
            </thead>
            <tbody>
              {topLinks.map((link) => (
                <tr key={link.rank} className="border-b border-line/30 dark:border-line/10 hover:bg-paper-soft dark:hover:bg-dark/50">
                  <td className="px-4 py-3 text-ink dark:text-white font-semibold">{link.rank}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink dark:text-white">{link.linkTitle}</p>
                    </div>
                    <p className="text-xs text-muted dark:text-white/60">{link.linkPreview}</p>
                  </td>
                  <td className="px-4 py-3 text-ink dark:text-white">{formatNumber(link.clicks)}</td>
                  <td className="px-4 py-3 text-ink dark:text-white">{formatNumber(link.shares)}</td>
                  <td className="px-4 py-3 text-ink dark:text-white font-semibold">{link.ctr}</td>
                  <td className="px-4 py-3 text-ink dark:text-white text-xs">{link.createdOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="mt-4 px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg text-primary font-medium hover:bg-paper-soft dark:hover:bg-dark transition-colors">
          View All Links →
        </button>
      </div>

      {/* Platform Overview */}
      <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
        <h3 className="font-bold text-ink dark:text-white mb-6">Platform Overview</h3>
        <p className="text-xs text-muted dark:text-white/60 mb-6">Key metrics at a glance</p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div>
            <p className="text-xs text-muted dark:text-white/60 mb-2">Avg. Session Duration</p>
            <p className="text-3xl font-bold text-ink dark:text-white">{avgSessionDuration}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 8.3%</p>
          </div>
          <div>
            <p className="text-xs text-muted dark:text-white/60 mb-2">Bounce Rate</p>
            <p className="text-3xl font-bold text-ink dark:text-white">{bounceRate}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">↓ 3.2%</p>
          </div>
          <div>
            <p className="text-xs text-muted dark:text-white/60 mb-2">Pages per Session</p>
            <p className="text-3xl font-bold text-ink dark:text-white">{pagesPerSession}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 6.7%</p>
          </div>
          <div>
            <p className="text-xs text-muted dark:text-white/60 mb-2">New vs Returning Visitors</p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink dark:text-white">New Visitors</span>
                <span className="font-semibold text-ink dark:text-white">
                  {formatNumber(newVisitors)} (68.3%)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink dark:text-white">Returning Visitors</span>
                <span className="font-semibold text-ink dark:text-white">
                  {formatNumber(returningVisitors)} (31.7%)
                </span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted dark:text-white/60 mb-2">Total Events</p>
            <p className="text-3xl font-bold text-ink dark:text-white">{formatNumber(totalEvents)}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 14.6%</p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
