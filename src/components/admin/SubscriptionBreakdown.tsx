import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const data = [
  { name: "Premium", value: 2456, percentage: 43.5 },
  { name: "Business", value: 1789, percentage: 31.7 },
  { name: "Basic", value: 1102, percentage: 19.5 },
  { name: "Free", value: 300, percentage: 5.3 },
];

const COLORS = ["#BE5103", "#069494", "#FFCE1B", "#E6B800"];

export default function SubscriptionBreakdown() {
  return (
    <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 border border-line/50 dark:border-line/10">
      <h3 className="text-lg font-bold text-ink dark:text-white mb-6">
        Subscription Breakdown
      </h3>

      <div className="flex flex-col lg:flex-row items-center justify-between">
        <div className="w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FEFAF3",
                  border: "1px solid #ECDFC7",
                  borderRadius: "8px",
                }}
                formatter={(value) => `${value}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full lg:w-1/2 space-y-3">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-3 rounded-lg bg-paper-soft dark:bg-dark/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                ></div>
                <span className="font-medium text-ink dark:text-white">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <p className="font-bold text-ink dark:text-white">
                  {item.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted dark:text-white/60">
                  {item.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-line/30 dark:border-line/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted dark:text-white/60">Total</span>
          <span className="font-bold text-ink dark:text-white text-lg">
            5,647
          </span>
        </div>
      </div>
    </div>
  );
}
