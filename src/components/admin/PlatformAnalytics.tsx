import {
  Share2,
  Mouse,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const analytics = [
  {
    label: "Shares",
    value: "12,458",
    icon: Share2,
    change: 14.2,
    trend: "up",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Clicks",
    value: "45,231",
    icon: Mouse,
    change: 11.8,
    trend: "up",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    label: "Downloads",
    value: "8,932",
    icon: Download,
    change: 17.6,
    trend: "up",
    color: "text-yellow-600",
    bgColor: "bg-yellow/20",
  },
  {
    label: "Views",
    value: "78,541",
    icon: Eye,
    change: 9.3,
    trend: "up",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export default function PlatformAnalytics() {
  return (
    <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 border border-line/50 dark:border-line/10">
      <h3 className="text-lg font-bold text-ink dark:text-white mb-6">
        Platform Analytics
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {analytics.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === "up";

          return (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-paper-soft dark:bg-dark/50 border border-line/30 dark:border-line/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`${stat.color} w-5 h-5`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                  isPositive
                    ? "bg-green-50 dark:bg-green-500/20"
                    : "bg-red-50 dark:bg-red-500/20"
                }`}>
                  {isPositive ? (
                    <ArrowUpRight size={14} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight size={14} className="text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-xs font-semibold ${
                    isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {Math.abs(stat.change)}%
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted dark:text-white/60 mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-ink dark:text-white">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
