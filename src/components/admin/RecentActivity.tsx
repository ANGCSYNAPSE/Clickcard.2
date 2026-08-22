import { UserPlus, Lock, CheckCircle, AlertCircle } from "lucide-react";

interface Activity {
  id: string;
  type: "signup" | "block" | "approve" | "alert";
  user: string;
  action: string;
  timestamp: string;
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "signup",
    user: "john.doe@email.com",
    action: "Joined as Premium user",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    type: "approve",
    user: "sarah.wilson@email.com",
    action: "Account approved",
    timestamp: "15 minutes ago",
  },
  {
    id: "3",
    type: "block",
    user: "michael.brown@email.com",
    action: "Account blocked",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    type: "signup",
    user: "emily.davis@email.com",
    action: "Joined as Basic user",
    timestamp: "3 hours ago",
  },
  {
    id: "5",
    type: "alert",
    user: "system",
    action: "Unusual activity detected",
    timestamp: "5 hours ago",
  },
];

export default function RecentActivity() {
  const getIcon = (type: string) => {
    switch (type) {
      case "signup":
        return UserPlus;
      case "block":
        return Lock;
      case "approve":
        return CheckCircle;
      case "alert":
        return AlertCircle;
      default:
        return UserPlus;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "signup":
        return "text-primary bg-primary/10";
      case "block":
        return "text-red-600 bg-red-50";
      case "approve":
        return "text-green-600 bg-green-50";
      case "alert":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-primary bg-primary/10";
    }
  };

  return (
    <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 border border-line/50 dark:border-line/10">
      <h3 className="text-lg font-bold text-ink dark:text-white mb-6">
        Recent Activity
      </h3>

      <div className="space-y-4">
        {mockActivities.map((activity) => {
          const Icon = getIcon(activity.type);
          const colorClass = getColor(activity.type);

          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-paper-soft dark:bg-dark/50 border border-line/30 dark:border-line/10 hover:border-line/50 dark:hover:border-line/20 transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-ink dark:text-white truncate">
                    {activity.user}
                  </p>
                  <span className="text-xs text-muted dark:text-white/60 whitespace-nowrap ml-2">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted dark:text-white/60">
                  {activity.action}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-6 px-4 py-2.5 text-primary font-medium hover:bg-paper-soft dark:hover:bg-dark rounded-lg transition-colors text-sm">
        View All Activity
      </button>
    </div>
  );
}
