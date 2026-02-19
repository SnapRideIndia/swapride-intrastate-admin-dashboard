import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../api/analytics.service";
import { AnalyticsFilters } from "@/types";

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
  const [period, setPeriod] = useState("weekly");
  const navigate = useNavigate();

  const filters = useMemo((): AnalyticsFilters => {
    switch (period) {
      case "weekly":
        return { dateRange: "last7days" };
      case "monthly":
        return { dateRange: "last30days" };
      case "yearly":
        return { dateRange: "last30days" }; // Fallback to 30 days as we only have 30 days of seed data
      default:
        return { dateRange: "last7days" };
    }
  }, [period]);

  const { data: trends = [], isLoading } = useQuery({
    queryKey: ["analytics", "trends", filters],
    queryFn: () => analyticsService.getTrends(filters),
  });

  const totalRevenue = useMemo(() => {
    return trends.reduce((sum, item) => sum + item.revenue, 0);
  }, [trends]);

  return (
    <div className="dashboard-card p-5 flex flex-col h-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground capitalize">{period} Revenue trend</h3>
          <p className="text-xs text-muted-foreground">Detailed revenue overview</p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={period} onValueChange={setPeriod} className="w-auto">
            <TabsList className="h-8 bg-muted/30 border border-border/40">
              <TabsTrigger value="weekly" className="text-[10px] px-3 font-bold">
                WEEKLY
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-[10px] px-3 font-bold">
                MONTHLY
              </TabsTrigger>
              <TabsTrigger value="yearly" className="text-[10px] px-3 font-bold">
                YEARLY
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="text-right border-l pl-4 border-border/60">
            <p className="text-lg font-semibold text-foreground">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-success font-medium">+12.5%</p>
          </div>
        </div>
      </div>
      <div className="h-64 flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trends}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(218, 79%, 42%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(218, 79%, 42%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }}
              axisLine={{ stroke: "hsl(220, 13%, 91%)" }}
              tickLine={false}
              interval={period === "monthly" || period === "yearly" ? 4 : 0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(220, 9%, 46%)" }}
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
      <div className="mt-4 pt-4 border-t border-border/40 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-semibold text-primary hover:bg-primary/5 gap-2"
          onClick={() => navigate(ROUTES.ANALYTICS)}
        >
          View Detailed Analytics
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
