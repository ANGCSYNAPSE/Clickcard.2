import { Lock, Unlock, CheckCircle, XCircle } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onBlock: () => void;
  onUnblock: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onBlock,
  onUnblock,
  onApprove,
  onReject,
}: BulkActionsBarProps) {
  return (
    <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 border border-line/50 dark:border-line/10 mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink dark:text-white">
            {selectedCount} {selectedCount === 1 ? "user" : "users"} selected
          </p>
          <p className="text-xs text-muted dark:text-white/60 mt-1">
            Select all {selectedCount} users
          </p>
        </div>

        <div className="w-full lg:w-auto">
          <p className="text-xs font-semibold text-muted dark:text-white/60 mb-3 uppercase">
            Bulk Actions:
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onBlock}
              className="flex items-center gap-2 px-4 py-2 border-2 border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium text-sm"
            >
              <Lock size={16} />
              Block Users
            </button>

            <button
              onClick={onUnblock}
              className="flex items-center gap-2 px-4 py-2 border-2 border-green-500 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors font-medium text-sm"
            >
              <Unlock size={16} />
              Unblock Users
            </button>

            <button
              onClick={onApprove}
              className="flex items-center gap-2 px-4 py-2 border-2 border-green-500 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors font-medium text-sm"
            >
              <CheckCircle size={16} />
              Approve
            </button>

            <button
              onClick={onReject}
              className="flex items-center gap-2 px-4 py-2 border-2 border-orange-500 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors font-medium text-sm"
            >
              <XCircle size={16} />
              Reject
            </button>

            <button className="flex-1 lg:flex-none px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
