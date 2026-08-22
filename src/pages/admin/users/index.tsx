import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Search,
  Download,
  UserPlus,
  AlertCircle,
  Activity,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import UsersTable from "@/components/admin/users/UsersTable";
import UsersFilterBar from "@/components/admin/users/UsersFilterBar";
import BulkActionsBar from "@/components/admin/users/BulkActionsBar";
import {
  adminService,
  AdminUser,
  AdminUsersResponse,
} from "@/services/adminService";
import { useRequireAdminAuth } from "@/lib/authGuards";

export default function UsersPage() {
  useRequireAdminAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [moderationFilter, setModerationFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  // Fetch users from database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from database through adminService
        const filters: any = {};
        if (statusFilter !== "all") filters.status = statusFilter;
        if (moderationFilter !== "all") filters.moderationStatus = moderationFilter;
        if (searchQuery) filters.search = searchQuery;

        const response: AdminUsersResponse = await adminService.getUsers(
          currentPage,
          itemsPerPage,
          filters
        );

        setAllUsers(response.data);
        setUsers(response.data);
        setTotalUsers(response.total);
      } catch (err) {
        console.error("Failed to fetch users from database:", err);
        setError("Failed to load users from database. Make sure your backend is running.");
        // Fallback to empty list
        setUsers([]);
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, statusFilter, moderationFilter, searchQuery]);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      setLoading(true);
      if (action === "block") {
        await adminService.bulkBlockUsers(selectedUsers, true);
      } else if (action === "unblock") {
        await adminService.bulkBlockUsers(selectedUsers, false);
      } else if (action === "approve") {
        await adminService.bulkModerateUsers(selectedUsers, "approved");
      } else if (action === "reject") {
        await adminService.bulkModerateUsers(selectedUsers, "rejected");
      }

      // Refresh users
      const filters: any = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (moderationFilter !== "all")
        filters.moderationStatus = moderationFilter;
      if (searchQuery) filters.search = searchQuery;

      const response: AdminUsersResponse = await adminService.getUsers(
        currentPage,
        itemsPerPage,
        filters
      );
      setUsers(response.data);
      setAllUsers(response.data);
      setSelectedUsers([]);
    } catch (err) {
      console.error("Bulk action failed:", err);
      setError("Failed to complete bulk action");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "User ID",
      "Name",
      "Email",
      "Signup Date",
      "Last Login",
      "Status",
      "Moderation Status",
      "Cards",
    ];
    const rows = allUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.signupDate || "N/A",
      user.lastLogin || "N/A",
      user.status,
      user.moderationStatus,
      (user as any).cardCount || "0",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
  };

  return (
    <AdminShell>
      <Head>
        <title>Users Management · ClickCard Admin</title>
      </Head>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-ink dark:text-white">
            Users Management
          </h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-white/60">
            Manage platform users, view details, and control access.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-hover border border-line/50 dark:border-line/10 rounded-lg text-ink dark:text-white font-medium hover:bg-paper-soft dark:hover:bg-dark transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors">
            <UserPlus size={18} />
            Add New User
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <UsersFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        moderationFilter={moderationFilter}
        onModerationChange={setModerationFilter}
      />

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedUsers.length}
          onBlock={() => handleBulkAction("block")}
          onUnblock={() => handleBulkAction("unblock")}
          onApprove={() => handleBulkAction("approve")}
          onReject={() => handleBulkAction("reject")}
        />
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white dark:bg-dark-hover rounded-2xl p-12 border border-line/50 dark:border-line/10 flex flex-col items-center justify-center">
          <Activity className="text-primary mb-4 animate-spin" size={32} />
          <p className="text-ink dark:text-white font-medium">
            Loading users...
          </p>
        </div>
      ) : (
        <>
          {/* Users Table */}
          <UsersTable
            users={users}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            allSelected={
              selectedUsers.length === users.length && users.length > 0
            }
            onUserUpdate={(id, updates) => {
              setUsers((prev) =>
                prev.map((user) =>
                  user.id === id ? { ...user, ...updates } : user
                )
              );
            }}
          />

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted dark:text-white/60">
              Showing{" "}
              {users.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}{" "}
              to {Math.min(currentPage * itemsPerPage, totalUsers)} of{" "}
              {totalUsers} users
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
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-line/50 dark:border-line/10 rounded-lg hover:bg-paper-soft dark:hover:bg-dark disabled:opacity-50 transition-colors"
              >
                {">"}
              </button>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
