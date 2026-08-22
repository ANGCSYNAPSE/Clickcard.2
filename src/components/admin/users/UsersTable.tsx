import {
  Eye,
  MoreVertical,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminUser } from "@/services/adminService";

interface UsersTableProps {
  users: AdminUser[];
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  onUserUpdate: (userId: string, updates: Partial<AdminUser>) => void;
}

export default function UsersTable({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  allSelected,
  onUserUpdate,
}: UsersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getStatusBadge = (status: "active" | "blocked") => {
    if (status === "active") {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            Active
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium text-red-700 dark:text-red-400">
            Blocked
          </span>
        </div>
      );
    }
  };

  const getModerationBadge = (
    status: "approved" | "pending" | "rejected"
  ) => {
    const config = {
      approved: {
        bg: "bg-green-50 dark:bg-green-500/20",
        text: "text-green-700 dark:text-green-400",
        icon: CheckCircle,
      },
      pending: {
        bg: "bg-yellow-50 dark:bg-yellow-500/20",
        text: "text-yellow-700 dark:text-yellow-600",
        icon: null,
      },
      rejected: {
        bg: "bg-red-50 dark:bg-red-500/20",
        text: "text-red-700 dark:text-red-400",
        icon: XCircle,
      },
    };

    const { bg, text } = config[status];

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${bg}`}>
        <span
          className={`text-sm font-medium capitalize ${text}`}
        >
          {status}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-dark-hover rounded-2xl border border-line/50 dark:border-line/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line/50 dark:border-line/10 bg-paper-soft dark:bg-dark/50">
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="w-5 h-5 rounded-md border-2 border-line dark:border-line/20 cursor-pointer accent-primary"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                User / Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                Signup Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                Moderation Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                Cards
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted dark:text-white/60 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-line/30 dark:border-line/10 hover:bg-paper-soft dark:hover:bg-dark/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => onSelectUser(user.id)}
                    className="w-5 h-5 rounded-md border-2 border-line dark:border-line/20 cursor-pointer accent-primary"
                  />
                </td>

                <td className="px-6 py-4 text-sm font-medium text-ink dark:text-white">
                  {user.id}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted dark:text-white/60">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm text-ink dark:text-white">
                    {user.signupDate || "N/A"}
                  </p>
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm text-ink dark:text-white">
                    {user.lastLogin || "N/A"}
                  </p>
                </td>

                <td className="px-6 py-4">{getStatusBadge(user.status)}</td>

                <td className="px-6 py-4">{getModerationBadge(user.moderationStatus)}</td>

                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-ink dark:text-white">
                    {(user as any).cardCount || "0"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="p-1.5 hover:bg-paper-soft dark:hover:bg-dark rounded-lg transition-colors text-muted dark:text-white/60 hover:text-ink dark:hover:text-white"
                      title="View details"
                    >
                      <Eye size={18} />
                    </Link>

                    {/* Block/Unblock Button */}
                    <button
                      onClick={() => {
                        onUserUpdate(user.id, {
                          status:
                            user.status === "active" ? "blocked" : "active",
                        });
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        user.status === "active"
                          ? "hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 dark:text-red-400"
                          : "hover:bg-green-50 dark:hover:bg-green-500/10 text-green-500 dark:text-green-400"
                      }`}
                      title={user.status === "active" ? "Block user" : "Unblock user"}
                    >
                      {user.status === "active" ? (
                        <Lock size={18} />
                      ) : (
                        <Unlock size={18} />
                      )}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === user.id ? null : user.id
                          )
                        }
                        className="p-1.5 hover:bg-paper-soft dark:hover:bg-dark rounded-lg transition-colors text-muted dark:text-white/60 hover:text-ink dark:hover:text-white"
                        title="More actions"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-hover rounded-lg shadow-lg border border-line/50 dark:border-line/10 z-10 overflow-hidden">
                          <button
                            onClick={() => {
                              onUserUpdate(user.id, {
                                moderationStatus: "approved",
                              });
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-paper-soft dark:hover:bg-dark/50 transition-colors flex items-center gap-2 text-ink dark:text-white"
                          >
                            <CheckCircle size={16} className="text-green-500" />
                            Approve
                          </button>

                          <button
                            onClick={() => {
                              onUserUpdate(user.id, {
                                moderationStatus: "rejected",
                              });
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-paper-soft dark:hover:bg-dark/50 transition-colors flex items-center gap-2 text-ink dark:text-white border-t border-line/30 dark:border-line/10"
                          >
                            <XCircle size={16} className="text-red-500" />
                            Reject
                          </button>

                          <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-paper-soft dark:hover:bg-dark/50 transition-colors text-ink dark:text-white border-t border-line/30 dark:border-line/10">
                            View Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-paper-soft dark:bg-dark/50 flex items-center justify-center mb-4">
            <Eye size={24} className="text-muted dark:text-white/60" />
          </div>
          <p className="text-ink dark:text-white font-medium">No users found</p>
          <p className="text-muted dark:text-white/60 text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
