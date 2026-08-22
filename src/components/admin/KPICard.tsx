import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  delta: number;
  icon: LucideIcon;
  trend: "up" | "down";
}

export default function KPICard({
  title,
  value,
  delta,
  icon: Icon,
  trend,
}: KPICardProps) {
  const isPositive = trend === "up";

  return (
    <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 border border-line/50 dark:border-line/10 hover:shadow-soft dark:hover:shadow-card transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted dark:text-white/60 mb-1">
            {title}
          </p>
          <p className="text-3xl font-black text-ink dark:text-white">
            {value}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
          <Icon size={24} className="text-primary" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            isPositive
              ? "bg-green-50 dark:bg-green-500/20"
              : "bg-red-50 dark:bg-red-500/20"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight
              size={16}
              className="text-green-600 dark:text-green-400"
            />
          ) : (
            <ArrowDownRight
              size={16}
              className="text-red-600 dark:text-red-400"
            />
          )}
          <span
            className={`text-sm font-semibold ${
              isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {Math.abs(delta)}%
          </span>
        </div>
        <span className="text-xs text-muted dark:text-white/50">
          from last 30 days
        </span>
      </div>
    </div>
  );
}
