import { useState } from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Bus,
  IndianRupee,
  Route,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoutes } from "@/features/routes";
import { useBuses } from "@/features/buses";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { analyticsService } from "@/features/analytics/api/analytics.service";
import { AnalyticsFilters } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "hsl(142, 71%, 45%)",
  HELD: "hsl(38, 92%, 50%)",
  CANCELLED: "hsl(0, 0%, 60%)",
  EXPIRED: "hsl(0, 84%, 60%)",
  "On Time": "hsl(142, 71%, 45%)",
  Delayed: "hsl(0, 84%, 60%)",
  Scheduled: "hsl(221, 83%, 53%)",
  "In Progress": "hsl(199, 89%, 48%)",
  Completed: "hsl(142, 71%, 45%)",
};

const Analytics = () => {
  const [dateRange, setDateRange] = useState("last7days");
  const [routeFilter, setRouteFilter] = useState("all");
  const [busFilter, setBusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("revenue");

  const { data: routes = [], isLoading: isRoutesLoading } = useRoutes();
  const { data: buses = [], isLoading: isBusesLoading } = useBuses();

  const filters: AnalyticsFilters = {
    dateRange: dateRange as any,
    startDate: dateRange === "custom" ? startDate : undefined,
    endDate: dateRange === "custom" ? endDate : undefined,
    routeId: routeFilter === "all" ? undefined : routeFilter,
    busId: busFilter === "all" ? undefined : busFilter,
  };

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["analytics", "summary", filters],
    queryFn: () => analyticsService.getSummary(filters),
  });

  const { data: trends, isLoading: isTrendsLoading } = useQuery({
    queryKey: ["analytics", "trends", filters],
    queryFn: () => analyticsService.getTrends(filters),
  });

  const { data: routesPerf, isLoading: isRoutesPerfLoading } = useQuery({
    queryKey: ["analytics", "routes", filters],
    queryFn: () => analyticsService.getRoutePerformance(filters),
  });

  const { data: fleetPerf, isLoading: isFleetPerfLoading } = useQuery({
    queryKey: ["analytics", "fleet", filters],
    queryFn: () => analyticsService.getFleetPerformance(filters),
  });

  const { data: distribution, isLoading: isDistributionLoading } = useQuery({
    queryKey: ["analytics", "distribution", filters],
    queryFn: () => analyticsService.getDistribution(filters),
  });

  const resetFilters = () => {
    setDateRange("last7days");
    setRouteFilter("all");
    setBusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const isLoading =
    isRoutesLoading ||
    isBusesLoading ||
    isSummaryLoading ||
    isTrendsLoading ||
    isRoutesPerfLoading ||
    isFleetPerfLoading ||
    isDistributionLoading;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-IN").format(value);
  };

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Loading analytics..." />
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Comprehensive insights and performance metrics"
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        }
      />

      {/* Filters Section */}
      <div className="dashboard-card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {dateRange === "custom" && (
            <>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" />
            </>
          )}

          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger>
              <Route className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Routes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Routes</SelectItem>
              {routes.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.routeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={busFilter} onValueChange={setBusFilter}>
            <SelectTrigger>
              <Bus className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Buses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buses</SelectItem>
              {buses.map((bus) => (
                <SelectItem key={bus.id} value={bus.id}>
                  {bus.busNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={resetFilters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="dashboard-card border-none bg-gradient-to-br from-blue-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900">Total Revenue</p>
              <IndianRupee className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-950">
              {summary ? formatCurrency(summary.revenue.current) : "₹0"}
            </p>
            {summary && (
              <div className="mt-2 flex items-center text-xs text-blue-600 font-medium">
                {summary.revenue.growth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
                )}
                <span className={summary.revenue.growth >= 0 ? "text-success font-bold" : "text-destructive font-bold"}>
                  {summary.revenue.growth >= 0 ? "+" : ""}
                  {summary.revenue.growth}%
                </span>
                <span className="ml-1 opacity-70">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="dashboard-card border-none bg-gradient-to-br from-green-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-900">Total Passengers</p>
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-950">
              {summary ? formatNumber(summary.passengers.current) : "0"}
            </p>
            {summary && (
              <div className="mt-2 flex items-center text-xs text-green-600 font-medium">
                {summary.passengers.growth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
                )}
                <span
                  className={summary.passengers.growth >= 0 ? "text-success font-bold" : "text-destructive font-bold"}
                >
                  {summary.passengers.growth >= 0 ? "+" : ""}
                  {summary.passengers.growth}%
                </span>
                <span className="ml-1 opacity-70">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="dashboard-card border-none bg-gradient-to-br from-purple-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-900">Avg. Utilization</p>
              <Bus className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-950">{summary ? `${summary.utilization.current}%` : "0%"}</p>
            {summary && (
              <div className="mt-2 flex items-center text-xs text-purple-600 font-medium">
                {summary.utilization.growth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
                )}
                <span
                  className={summary.utilization.growth >= 0 ? "text-success font-bold" : "text-destructive font-bold"}
                >
                  {summary.utilization.growth >= 0 ? "+" : ""}
                  {summary.utilization.growth}%
                </span>
                <span className="ml-1 opacity-70">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="dashboard-card border-none bg-gradient-to-br from-yellow-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-yellow-900">On-Time Rate</p>
              <Route className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-950">{summary ? `${summary.onTimeRate.current}%` : "0%"}</p>
            {summary && (
              <div className="mt-2 flex items-center text-xs text-yellow-600 font-medium">
                {summary.onTimeRate.growth >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
                )}
                <span
                  className={summary.onTimeRate.growth >= 0 ? "text-success font-bold" : "text-destructive font-bold"}
                >
                  {summary.onTimeRate.growth >= 0 ? "+" : ""}
                  {summary.onTimeRate.growth}%
                </span>
                <span className="ml-1 opacity-70">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="buses">Bus Performance</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 dashboard-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Revenue Trend</h3>
                  <p className="text-xs text-muted-foreground">Periodic revenue and passenger count</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                      name="Revenue (₹)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="passengers"
                      stroke="hsl(142, 71%, 45%)"
                      strokeWidth={2}
                      dot={false}
                      name="Passengers"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="dashboard-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Payment Collection</h3>
                <p className="text-xs text-muted-foreground">Status distribution</p>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution?.paymentStatus || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {(distribution?.paymentStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "hsl(var(--muted))"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, "Bookings"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {(distribution?.paymentStatus || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[item.name] || "hsl(var(--muted))" }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Peak Daily Activity</h3>
                <p className="text-xs text-muted-foreground">Hourly booking pattern analysis</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution?.peakHours || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="dashboard-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Booking Trend</h3>
                <p className="text-xs text-muted-foreground">Periodic bookings over time</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Bookings"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Buses Tab */}
        <TabsContent value="buses">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Bus Utilization</h3>
                <p className="text-xs text-muted-foreground">Seat occupancy by bus</p>
              </div>
              <div className="space-y-4">
                {(fleetPerf?.buses || []).map((bus) => (
                  <div key={bus.bus}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{bus.bus}</span>
                      <span className="text-xs text-muted-foreground">
                        {bus.trips} trips · ₹{(bus.revenue / 1000).toFixed(1)}k
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${bus.utilization}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-10 text-right">{bus.utilization}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Driver Performance</h3>
                <p className="text-xs text-muted-foreground">Top performing drivers</p>
              </div>
              <div className="space-y-4">
                {(fleetPerf?.drivers || []).map((driver, index) => (
                  <div key={driver.name} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{driver.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {driver.trips} trips · {driver.passengers} passengers
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-success">{driver.onTimeRate}%</p>
                      <p className="text-xs text-muted-foreground">On-time</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Route Performance</h3>
                <p className="text-xs text-muted-foreground">Passengers by route</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routesPerf} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis type="category" dataKey="route" tick={{ fontSize: 10 }} tickLine={false} width={100} />
                    <Tooltip />
                    <Bar dataKey="passengers" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Passengers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="dashboard-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Route Revenue</h3>
                <p className="text-xs text-muted-foreground">Revenue by route</p>
              </div>
              <div className="space-y-4">
                {(routesPerf || []).map((route) => (
                  <div key={route.route} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{route.route}</p>
                      <p className="text-xs text-muted-foreground">{route.passengers} passengers</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₹{(route.revenue / 1000).toFixed(1)}k</p>
                      <p className="text-xs text-muted-foreground">{route.utilization}% utilized</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="dashboard-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Trip Status Distribution</h3>
                <p className="text-xs text-muted-foreground">On-time vs delayed trips</p>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution?.tripStatus || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {(distribution?.tripStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "hsl(var(--muted))"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, "Trips"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {(distribution?.tripStatus || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[item.name] || "hsl(var(--muted))" }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-card p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">Operational Metrics</h3>
                <p className="text-xs text-muted-foreground">Key operational KPIs</p>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Trips in Period</span>
                    <span className="text-2xl font-bold text-success">
                      {(distribution?.tripStatus || []).reduce((acc, curr) => acc + curr.value, 0)}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Drivers</span>
                    <span className="text-2xl font-bold text-primary">{(fleetPerf?.drivers || []).length}</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Buses in Service</span>
                    <span className="text-2xl font-bold text-info">{(fleetPerf?.buses || []).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Analytics;
