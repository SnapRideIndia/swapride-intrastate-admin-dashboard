import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", passengers: 240, revenue: 24000 },
  { name: "Tue", passengers: 300, revenue: 30000 },
  { name: "Wed", passengers: 280, revenue: 28000 },
  { name: "Thu", passengers: 320, revenue: 32000 },
  { name: "Fri", passengers: 380, revenue: 38000 },
  { name: "Sat", passengers: 150, revenue: 15000 },
  { name: "Sun", passengers: 120, revenue: 12000 },
];

export function RevenueChart() {
  return (
    <div className="dashboard-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Weekly Revenue</h3>
          <p className="text-xs text-muted-foreground">Revenue trend for this week</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-foreground">₹1,79,000</p>
          <p className="text-xs text-success">+12.5% from last week</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(218, 79%, 42%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(218, 79%, 42%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
              axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
              axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
              tickLine={false}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(220, 13%, 91%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(218, 79%, 42%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
