import { AlertCircle, Flag, MessageSquare, CheckCircle } from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  pendingModeration: number;
  blockedUsers: number;
  supportLeads: number;
  systemHealth: string;
}

export default function QuickActions({
  pendingModeration,
  blockedUsers,
  supportLeads,
  systemHealth,
}: QuickActionsProps) {
  const actions = [
    {
      label: "Pending Moderation",
      count: pendingModeration,
      icon: Flag,
      href: "/admin/moderation",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Blocked Users",
      count: blockedUsers,
      icon: AlertCircle,
      href: "/admin/users",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Support Leads",
      count: supportLeads,
      icon: MessageSquare,
      href: "/admin/support",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  return (
    <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 border border-line/50 dark:border-line/10">
      <h3 className="text-lg font-bold text-ink dark:text-white mb-6">
        Quick Actions
      </h3>

      <div className="space-y-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center justify-between p-4 rounded-xl bg-paper-soft dark:bg-dark/50 border border-line/30 dark:border-line/10 hover:bg-white dark:hover:bg-dark transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="font-medium text-ink dark:text-white">
                  {action.label}
                </span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {action.count}
              </span>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-line/30 dark:border-line/10">
          <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium text-green-700 dark:text-green-400">
                System Health
              </span>
            </div>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              {systemHealth}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
