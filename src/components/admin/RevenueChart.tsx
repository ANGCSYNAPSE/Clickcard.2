import { useState } from "react";

export default function RevenueChart() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 border border-line/50 dark:border-line/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">Revenue Trend</h3>
          <p className="text-sm text-muted dark:text-white/60 mt-1">Last 30 Days</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTimeRange("7d")} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${timeRange === "7d" ? "bg-primary text-white" : "bg-paper-soft dark:bg-dark text-muted dark:text-white/60"}`}>7D</button>
          <button onClick={() => setTimeRange("30d")} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${timeRange === "30d" ? "bg-primary text-white" : "bg-paper-soft dark:bg-dark text-muted dark:text-white/60"}`}>30D</button>
          <button onClick={() => setTimeRange("90d")} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${timeRange === "90d" ? "bg-primary text-white" : "bg-paper-soft dark:bg-dark text-muted dark:text-white/60"}`}>90D</button>
        </div>
      </div>
      <div className="h-64 bg-gradient-to-b from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
        <p className="text-muted dark:text-white/60">Revenue chart data</p>
      </div>
    </div>
  );
}
