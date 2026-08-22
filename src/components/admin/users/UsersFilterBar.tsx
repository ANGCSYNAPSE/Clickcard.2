import { Search, X } from "lucide-react";

interface UsersFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  moderationFilter: string;
  onModerationChange: (status: string) => void;
}

export default function UsersFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  moderationFilter,
  onModerationChange,
}: UsersFilterBarProps) {
  const handleReset = () => {
    onSearchChange("");
    onStatusChange("all");
    onModerationChange("all");
  };

  return (
    <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 border border-line/50 dark:border-line/10 mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-white/50"
          />
          <input
            type="text"
            placeholder="Search by email or username..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-paper-soft dark:bg-dark border border-line/50 dark:border-line/10 rounded-lg text-ink dark:text-white placeholder-muted dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-muted dark:text-white/60 mb-2 uppercase">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-paper-soft dark:bg-dark border border-line/50 dark:border-line/10 rounded-lg text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* Moderation Filter */}
        <div>
          <label className="block text-xs font-semibold text-muted dark:text-white/60 mb-2 uppercase">
            Moderation Status
          </label>
          <select
            value={moderationFilter}
            onChange={(e) => onModerationChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-paper-soft dark:bg-dark border border-line/50 dark:border-line/10 rounded-lg text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Moderation Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs font-semibold text-muted dark:text-white/60 mb-2 uppercase">
            Signup Date Range
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              className="flex-1 px-3 py-2.5 bg-paper-soft dark:bg-dark border border-line/50 dark:border-line/10 rounded-lg text-ink dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Start date"
            />
            <span className="text-muted dark:text-white/60">to</span>
            <input
              type="date"
              className="flex-1 px-3 py-2.5 bg-paper-soft dark:bg-dark border border-line/50 dark:border-line/10 rounded-lg text-ink dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="End date"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2.5 border border-line/50 dark:border-line/10 rounded-lg text-ink dark:text-white hover:bg-paper-soft dark:hover:bg-dark transition-colors font-medium text-sm">
            More Filters
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 px-3 py-2.5 border border-line/50 dark:border-line/10 rounded-lg text-ink dark:text-white hover:bg-paper-soft dark:hover:bg-dark transition-colors font-medium text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
