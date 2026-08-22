import { useEffect, useState } from "react";
import Head from "next/head";
import AdminShell from "@/components/admin/AdminShell";
import { useRequireAdminAuth } from "@/lib/authGuards";
import {
  MessageCircle,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Star,
  Archive,
  Trash2,
  Reply,
} from "lucide-react";

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  replies: number;
}

export default function SupportPage() {
  useRequireAdminAuth();

  const [activeTab, setActiveTab] = useState<
    "all" | "new" | "in-progress" | "resolved"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [replyText, setReplyText] = useState("");

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "1",
      name: "Gitesh Kumar",
      email: "giteshkumar633@gmail.com",
      subject: "Unable to export PDF resume",
      message:
        "I'm trying to export my profile as a PDF resume but getting an error. Can you help?",
      status: "new",
      priority: "high",
      createdAt: "5 minutes ago",
      updatedAt: "5 minutes ago",
      replies: 0,
    },
    {
      id: "2",
      name: "Aarav Mehta",
      email: "aarav.mehta@example.com",
      subject: "Billing issue - duplicate charge",
      message:
        "I was charged twice for my Pro subscription this month. Please check my account.",
      status: "in-progress",
      priority: "high",
      createdAt: "2 hours ago",
      updatedAt: "1 hour ago",
      replies: 1,
    },
    {
      id: "3",
      name: "Priya Singh",
      email: "priya.singh@example.com",
      subject: "How to add multiple social links?",
      message:
        "I want to add more social media profiles to my card. How do I do this?",
      status: "in-progress",
      priority: "medium",
      createdAt: "3 hours ago",
      updatedAt: "2 hours ago",
      replies: 2,
    },
    {
      id: "4",
      name: "John Doe",
      email: "john.doe@example.com",
      subject: "Profile customization help",
      message:
        "Can I change the color scheme of my digital card? I don't see that option.",
      status: "resolved",
      priority: "low",
      createdAt: "1 day ago",
      updatedAt: "20 hours ago",
      replies: 3,
    },
    {
      id: "5",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      subject: "Feature request - QR code customization",
      message:
        "Would love to be able to customize the QR code colors. Any plans for this?",
      status: "resolved",
      priority: "low",
      createdAt: "2 days ago",
      updatedAt: "1 day ago",
      replies: 2,
    },
  ]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesTab =
      activeTab === "all" || ticket.status === activeTab;
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: tickets.length,
    new: tickets.filter((t) => t.status === "new").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  const handleStatusChange = (ticketId: string, newStatus: SupportTicket["status"]) => {
    setTickets(
      tickets.map((t) =>
        t.id === ticketId ? { ...t, status: newStatus, updatedAt: "now" } : t
      )
    );
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    setTickets(
      tickets.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, replies: t.replies + 1, updatedAt: "now" }
          : t
      )
    );
    setReplyText("");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20";
      case "medium":
        return "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20";
      default:
        return "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle size={16} className="text-red-600 dark:text-red-400" />;
      case "in-progress":
        return <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />;
      case "resolved":
        return <CheckCircle size={16} className="text-green-600 dark:text-green-400" />;
      default:
        return <Archive size={16} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <AdminShell>
      <Head>
        <title>Support · ClickCard Admin</title>
      </Head>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink dark:text-white">
          Support & Help
        </h1>
        <p className="text-sm text-muted dark:text-white/60 mt-1">
          Manage user support tickets and inquiries.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <p className="text-xs text-muted dark:text-white/60 mb-2">Total Tickets</p>
          <p className="text-3xl font-bold text-ink dark:text-white">
            {stats.total}
          </p>
          <p className="text-xs text-muted dark:text-white/60 mt-2">All time</p>
        </div>

        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <p className="text-xs text-muted dark:text-white/60 mb-2">New Tickets</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {stats.new}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">Needs attention</p>
        </div>

        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <p className="text-xs text-muted dark:text-white/60 mb-2">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.inProgress}
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            Being handled
          </p>
        </div>

        <div className="bg-white dark:bg-dark-hover rounded-xl p-6 border border-line/50 dark:border-line/10">
          <p className="text-xs text-muted dark:text-white/60 mb-2">Resolved</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.resolved}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            {Math.round((stats.resolved / stats.total) * 100)}% resolution rate
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-hover rounded-xl border border-line/50 dark:border-line/10 overflow-hidden">
            {/* Search & Filter */}
            <div className="p-4 border-b border-line/30 dark:border-line/10">
              <div className="relative mb-4">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted dark:text-white/40"
                />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white placeholder-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex gap-2 flex-wrap">
                {["all", "new", "in-progress", "resolved"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      setActiveTab(
                        tab as "all" | "new" | "in-progress" | "resolved"
                      )
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-primary text-white"
                        : "bg-paper-soft dark:bg-dark text-ink dark:text-white hover:bg-paper dark:hover:bg-dark-hover"
                    }`}
                  >
                    {tab === "all"
                      ? "All"
                      : tab === "new"
                      ? "New"
                      : tab === "in-progress"
                      ? "In Progress"
                      : "Resolved"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tickets */}
            <div className="divide-y divide-line/20 dark:divide-line/10 max-h-96 overflow-y-auto">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id
                      ? "bg-primary/10 dark:bg-primary/20"
                      : "hover:bg-paper-soft dark:hover:bg-dark"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        ticket.status === "new"
                          ? "bg-red-50 dark:bg-red-500/10"
                          : ticket.status === "in-progress"
                          ? "bg-yellow-50 dark:bg-yellow-500/10"
                          : "bg-green-50 dark:bg-green-500/10"
                      }`}
                    >
                      {getStatusIcon(ticket.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-ink dark:text-white truncate">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-muted dark:text-white/60 mt-1">
                        {ticket.name}
                      </p>
                      <p className="text-xs text-muted dark:text-white/60">
                        {ticket.createdAt}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white dark:bg-dark-hover rounded-xl border border-line/50 dark:border-line/10 overflow-hidden flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-line/30 dark:border-line/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-ink dark:text-white">
                      {selectedTicket.subject}
                    </h2>
                    <p className="text-sm text-muted dark:text-white/60 mt-2">
                      From: {selectedTicket.name} ({selectedTicket.email})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-paper-soft dark:hover:bg-dark rounded-lg text-muted dark:text-white/60">
                      <Star size={18} />
                    </button>
                    <button className="p-2 hover:bg-paper-soft dark:hover:bg-dark rounded-lg text-muted dark:text-white/60">
                      <Archive size={18} />
                    </button>
                    <button className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-600 dark:text-red-400">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Status & Priority */}
                <div className="flex gap-3 flex-wrap">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedTicket.id,
                        e.target.value as SupportTicket["status"]
                      )
                    }
                    className="px-3 py-1 rounded-lg text-xs font-medium border border-line/50 dark:border-line/10 bg-paper-soft dark:bg-dark text-ink dark:text-white"
                  >
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <div
                    className={`px-3 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(
                      selectedTicket.priority
                    )}`}
                  >
                    {selectedTicket.priority.charAt(0).toUpperCase() +
                      selectedTicket.priority.slice(1)}{" "}
                    Priority
                  </div>

                  <div className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                    {selectedTicket.replies} replies
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="p-6 border-b border-line/30 dark:border-line/10 flex-1 overflow-y-auto">
                <div className="bg-paper-soft dark:bg-dark rounded-lg p-4">
                  <p className="text-sm text-ink dark:text-white">
                    {selectedTicket.message}
                  </p>
                  <p className="text-xs text-muted dark:text-white/60 mt-4">
                    Created: {selectedTicket.createdAt} · Last updated:{" "}
                    {selectedTicket.updatedAt}
                  </p>
                </div>
              </div>

              {/* Reply Box */}
              <div className="p-6 border-t border-line/30 dark:border-line/10">
                <label className="block text-sm font-semibold text-ink dark:text-white mb-2">
                  Send Reply
                </label>
                <div className="flex gap-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response here..."
                    className="flex-1 px-4 py-2 border border-line/50 dark:border-line/10 rounded-lg bg-paper-soft dark:bg-dark text-ink dark:text-white placeholder-muted dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-hover rounded-xl border border-line/50 dark:border-line/10 h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle
                  size={48}
                  className="mx-auto mb-4 text-muted dark:text-white/40"
                />
                <p className="text-muted dark:text-white/60">
                  Select a ticket to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
