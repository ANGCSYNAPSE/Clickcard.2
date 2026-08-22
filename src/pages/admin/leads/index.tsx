import { useEffect, useState } from "react";
import Head from "next/head";
import AdminShell from "@/components/admin/AdminShell";
import { useRequireAdminAuth } from "@/lib/authGuards";
import { adminService } from "@/services/adminService";
import {
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Edit2,
  RotateCcw,
  MessageSquare,
  Calendar,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  userId: string | null;
  submittedOn: string;
  status: "new" | "contacted" | "resolved";
  readStatus: "read" | "unread";
  avatar: string;
}

export default function LeadsPage() {
  useRequireAdminAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [readStatusFilter, setReadStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: "May 20, 2025",
    end: "Jun 18, 2025",
  });
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminService.getLeads(currentPage, 100);
        if (response && response.data && Array.isArray(response.data)) {
          const formattedLeads: Lead[] = response.data.map((lead: any) => ({
            id: lead.id || lead._id,
            name: lead.name || "—",
            email: lead.email || "—",
            phone: lead.phone || "—",
            message: lead.message || "—",
            userId: lead.userId || null,
            submittedOn: lead.createdAt
              ? new Date(lead.createdAt).toLocaleString()
              : "—",
            status: lead.status || "new",
            readStatus: lead.readStatus || "unread",
            avatar: (lead.name || "U").substring(0, 2).toUpperCase(),
          }));
          setLeads(formattedLeads);
        }
      } catch (err: any) {
        console.error("Failed to fetch leads:", err);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [currentPage]);

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const contactedLeads = leads.filter((l) => l.status === "contacted").length;
  const resolvedLeads = leads.filter((l) => l.status === "resolved").length;
  const resolutionRate = Math.round((resolvedLeads / totalLeads) * 100);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    const matchesReadStatus =
      readStatusFilter === "all" || lead.readStatus === readStatusFilter;

    return matchesSearch && matchesStatus && matchesReadStatus;
  });

  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedLeads.size === paginatedLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(paginatedLeads.map((l) => l.id)));
    }
  };

  const toggleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  const handleMarkAsRead = () => {
    setLeads(
      leads.map((lead) =>
        selectedLeads.has(lead.id) ? { ...lead, readStatus: "read" } : lead
      )
    );
    setSelectedLeads(new Set());
  };

  const handleMarkAsUnread = () => {
    setLeads(
      leads.map((lead) =>
        selectedLeads.has(lead.id) ? { ...lead, readStatus: "unread" } : lead
      )
    );
    setSelectedLeads(new Set());
  };

  const handleDeleteLead = (id: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      setLeads(leads.filter((l) => l.id !== id));
    }
  };

  const handleExportLeads = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Message", "User ID", "Status", "Read Status"],
      ...filteredLeads.map((l) => [
        l.name,
        l.email,
        l.phone,
        l.message,
        l.userId || "-",
        l.status,
        l.readStatus,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
    );
    element.setAttribute("download", "leads.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDeleteOldLeads = () => {
    if (confirm("Are you sure you want to delete all old leads (30+ days)?")) {
      setLeads(leads.slice(0, 2)); // Keep only recent leads for demo
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setReadStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <AdminShell>
      <Head>
        <title>Leads Management · ClickCard Admin</title>
      </Head>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-black text-ink dark:text-white">
            Leads Management
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleExportLeads}
              className="px-4 py-2 bg-white dark:bg-dark-hover border border-line dark:border-line/20 text-ink dark:text-white rounded-lg font-medium hover:bg-paper-soft dark:hover:bg-dark transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Export Leads
            </button>
            <button
              onClick={handleDeleteOldLeads}
              className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete Old Leads
            </button>
          </div>
        </div>
        <p className="text-sm text-muted dark:text-white/60">
          View, manage and respond to leads from the platform.
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-dark-hover rounded-xl border border-line/50 dark:border-line/10 p-6 animate-pulse"
            >
              <div className="h-4 bg-paper-soft dark:bg-dark rounded w-24 mb-3"></div>
              <div className="h-8 bg-paper-soft dark:bg-dark rounded w-16 mb-3"></div>
              <div className="h-3 bg-paper-soft dark:bg-dark rounded w-32"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-hover rounded-xl border border-line/50 dark:border-line/10 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted dark:text-white/60 mb-2">
                  Total Leads
                </p>
                <p className="text-3xl font-bold text-ink dark:text-white">
                  {totalLeads}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                <MessageSquare size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-hover rounded-xl border border-line/50 dark:border-line/10 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted dark:text-white/60 mb-2">
                  New Leads
                </p>
                <p className="text-3xl font-bold text-ink dark:text-white">
                  {newLeads}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                <MessageSquare size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-hover rounded-xl border border-line/50 dark:border-line/10 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted dark:text-white/60 mb-2">
                  Contacted
                </p>
                <p className="text-3xl font-bold text-ink dark:text-white">
                  {contactedLeads}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
                <MessageSquare size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-hover rounded-xl border border-line/50 dark:border-line/10 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted dark:text-white/60 mb-2">
                  Resolved
                </p>
                <p className="text-3xl font-bold text-ink dark:text-white">
                  {resolvedLeads}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-lg">
                <MessageSquare size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white dark:bg-dark-hover rounded-xl border border-line/50 dark:border-line/10 p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-ink dark:text-white mb-2">
              Search
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted dark:text-white/40"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, email or phone..."
                className="w-full pl-10 pr-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white placeholder-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-ink dark:text-white mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-ink dark:text-white mb-2">
              Date Range
            </label>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-muted dark:text-white/40" />
              <input
                type="text"
                value={`${dateRange.start} - ${dateRange.end}`}
                readOnly
                className="w-full px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Read Status Filter */}
          <div>
            <label className="block text-sm font-medium text-ink dark:text-white mb-2">
              Read Status
            </label>
            <select
              value={readStatusFilter}
              onChange={(e) => {
                setReadStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 border border-line/50 dark:border-line/10 text-ink dark:text-white rounded-lg font-medium hover:bg-paper-soft dark:hover:bg-dark transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Reset
            </button>
            <button className="flex-1 px-4 py-2 border border-line/50 dark:border-line/10 text-ink dark:text-white rounded-lg font-medium hover:bg-paper-soft dark:hover:bg-dark transition-colors flex items-center justify-center gap-2">
              <Filter size={18} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Selected Leads Actions */}
      {selectedLeads.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4 mb-6 flex items-center justify-between">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
            {selectedLeads.size} lead{selectedLeads.size !== 1 ? "s" : ""} selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleMarkAsRead}
              className="px-4 py-2 bg-white dark:bg-dark-hover text-ink dark:text-white border border-blue-200 dark:border-blue-500/20 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-colors"
            >
              Mark as Read
            </button>
            <button
              onClick={handleMarkAsUnread}
              className="px-4 py-2 bg-white dark:bg-dark-hover text-ink dark:text-white border border-blue-200 dark:border-blue-500/20 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-colors"
            >
              Mark as Unread
            </button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white dark:bg-dark-hover rounded-xl border border-line/50 dark:border-line/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line/30 dark:border-line/10 bg-paper-soft dark:bg-dark">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  <input
                    type="checkbox"
                    checked={
                      paginatedLeads.length > 0 &&
                      selectedLeads.size === paginatedLeads.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-line/50 dark:border-line/10 cursor-pointer"
                    disabled={loading}
                  />
                </th>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  Name
                </th>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  Email
                </th>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  Phone
                </th>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  Message
                </th>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  User ID
                </th>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  Submitted On
                </th>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  Status
                </th>
                <th className="text-left py-4 px-6 font-semibold text-ink dark:text-white">
                  Read Status
                </th>
                <th className="text-right py-4 px-6 font-semibold text-ink dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 px-6 text-center">
                    <p className="text-muted dark:text-white/60">Loading leads...</p>
                  </td>
                </tr>
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 px-6 text-center">
                    <p className="text-muted dark:text-white/60">No leads found.</p>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-line/20 dark:border-line/10 hover:bg-paper-soft dark:hover:bg-dark transition-colors"
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => toggleSelectLead(lead.id)}
                        className="rounded border-line/50 dark:border-line/10 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                          {lead.avatar}
                        </div>
                        <span className="font-medium text-ink dark:text-white">
                          {lead.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-ink dark:text-white">
                      {lead.email}
                    </td>
                    <td className="py-4 px-6 text-ink dark:text-white">
                      {lead.phone}
                    </td>
                    <td className="py-4 px-6 text-muted dark:text-white/60 max-w-xs truncate">
                      {lead.message}
                    </td>
                    <td className="py-4 px-6 text-ink dark:text-white">
                      {lead.userId || "—"}
                    </td>
                    <td className="py-4 px-6 text-muted dark:text-white/60">
                      {lead.submittedOn}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          lead.status === "new"
                            ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                            : lead.status === "contacted"
                            ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
                            : "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                        }`}
                      >
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          lead.readStatus === "read"
                            ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {lead.readStatus.charAt(0).toUpperCase() + lead.readStatus.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-paper-soft dark:hover:bg-dark rounded text-muted dark:text-white/60 hover:text-ink dark:hover:text-white transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 hover:bg-paper-soft dark:hover:bg-dark rounded text-muted dark:text-white/60 hover:text-ink dark:hover:text-white transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-600 dark:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted dark:text-white/60">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredLeads.length)} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredLeads.length)} of{" "}
          {filteredLeads.length} leads
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 border border-line/50 dark:border-line/10 rounded text-ink dark:text-white hover:bg-paper-soft dark:hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ←
          </button>
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                currentPage === i + 1
                  ? "bg-primary text-white"
                  : "border border-line/50 dark:border-line/10 text-ink dark:text-white hover:bg-paper-soft dark:hover:bg-dark"
              }`}
            >
              {i + 1}
            </button>
          ))}
          {totalPages > 5 && (
            <>
              <span className="text-ink dark:text-white">...</span>
              <button className="px-3 py-1 border border-line/50 dark:border-line/10 rounded text-ink dark:text-white hover:bg-paper-soft dark:hover:bg-dark">
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border border-line/50 dark:border-line/10 rounded text-ink dark:text-white hover:bg-paper-soft dark:hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
