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

const revenueData = [
  { date: "Jan 15", revenue: 24500, passengers: 420, bookings: 380 },
  { date: "Jan 16", revenue: 26800, passengers: 460, bookings: 420 },
  { date: "Jan 17", revenue: 31200, passengers: 510, bookings: 470 },
  { date: "Jan 18", revenue: 29800, passengers: 480, bookings: 440 },
  { date: "Jan 19", revenue: 34500, passengers: 560, bookings: 520 },
  { date: "Jan 20", revenue: 38900, passengers: 620, bookings: 580 },
  { date: "Jan 21", revenue: 35600, passengers: 580, bookings: 540 },
];

const hourlyBookings = [
  { hour: "6AM", bookings: 45 },
  { hour: "7AM", bookings: 78 },
  { hour: "8AM", bookings: 120 },
  { hour: "9AM", bookings: 85 },
  { hour: "10AM", bookings: 52 },
  { hour: "11AM", bookings: 38 },
  { hour: "12PM", bookings: 42 },
  { hour: "1PM", bookings: 35 },
  { hour: "2PM", bookings: 28 },
  { hour: "3PM", bookings: 45 },
  { hour: "4PM", bookings: 68 },
  { hour: "5PM", bookings: 95 },
  { hour: "6PM", bookings: 110 },
  { hour: "7PM", bookings: 85 },
  { hour: "8PM", bookings: 55 },
];

const routePerformance = [
  { route: "MHB→HYD Morning", passengers: 1250, revenue: 187500, utilization: 92 },
  { route: "HYD→MHB Evening", passengers: 1180, revenue: 177000, utilization: 89 },
  { route: "MHB→HYD Evening", passengers: 980, revenue: 147000, utilization: 78 },
  { route: "HYD→MHB Morning", passengers: 920, revenue: 138000, utilization: 75 },
  { route: "Suburban Express", passengers: 650, revenue: 65000, utilization: 82 },
];

const tripStatus = [
  { name: "On Time", value: 78, color: "hsl(142, 71%, 45%)" },
  { name: "Delayed (<10 min)", value: 15, color: "hsl(38, 92%, 50%)" },
  { name: "Delayed (>10 min)", value: 7, color: "hsl(0, 84%, 60%)" },
];

const paymentStatus = [
  { name: "Collected", value: 85, color: "hsl(142, 71%, 45%)" },
  { name: "Pending", value: 10, color: "hsl(38, 92%, 50%)" },
  { name: "Failed", value: 5, color: "hsl(0, 84%, 60%)" },
];

const busUtilization = [
  { bus: "TS07-1234", trips: 28, passengers: 1456, utilization: 94, revenue: 218400 },
  { bus: "TS07-5678", trips: 26, passengers: 1352, utilization: 91, revenue: 202800 },
  { bus: "TS07-3456", trips: 24, passengers: 1080, utilization: 85, revenue: 162000 },
  { bus: "TS07-7890", trips: 22, passengers: 990, utilization: 82, revenue: 148500 },
  { bus: "TS07-9012", trips: 18, passengers: 720, utilization: 75, revenue: 108000 },
];

const driverPerformance = [
  { name: "Ramesh Kumar", trips: 45, onTimeRate: 96, passengers: 2340, rating: 4.8 },
  { name: "Suresh Reddy", trips: 42, onTimeRate: 94, passengers: 2184, rating: 4.7 },
  { name: "Venkat Rao", trips: 38, onTimeRate: 91, passengers: 1976, rating: 4.6 },
  { name: "Krishna Murthy", trips: 35, onTimeRate: 88, passengers: 1820, rating: 4.5 },
];

const Analytics = () => {
  const [dateRange, setDateRange] = useState("last7days");
  const [routeFilter, setRouteFilter] = useState("all");
  const [busFilter, setBusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("revenue");

  const { data: routes = [], isLoading: isRoutesLoading } = useRoutes();
  const { data: buses = [], isLoading: isBusesLoading } = useBuses();

  const resetFilters = () => {
    setDateRange("last7days");
    setRouteFilter("all");
    setBusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const isLoading = isRoutesLoading || isBusesLoading;

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
            <p className="text-3xl font-bold text-blue-950">₹4,28,500</p>
            <div className="mt-2 flex items-center text-xs text-blue-600 font-medium">
              <TrendingUp className="h-3 w-3 mr-1 text-success" />
              <span className="text-success font-bold">+12.5%</span>
              <span className="ml-1 opacity-70">vs last period</span>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card border-none bg-gradient-to-br from-green-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-900">Total Passengers</p>
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-950">6,892</p>
            <div className="mt-2 flex items-center text-xs text-green-600 font-medium">
              <TrendingUp className="h-3 w-3 mr-1 text-success" />
              <span className="text-success font-bold">+8.2%</span>
              <span className="ml-1 opacity-70">vs last period</span>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card border-none bg-gradient-to-br from-purple-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-900">Avg. Utilization</p>
              <Bus className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-950">86.4%</p>
            <div className="mt-2 flex items-center text-xs text-purple-600 font-medium">
              <TrendingUp className="h-3 w-3 mr-1 text-success" />
              <span className="text-success font-bold">+3.1%</span>
              <span className="ml-1 opacity-70">vs last period</span>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card border-none bg-gradient-to-br from-yellow-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-yellow-900">On-Time Rate</p>
              <Route className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-950">78%</p>
            <div className="mt-2 flex items-center text-xs text-yellow-600 font-medium">
              <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
              <span className="text-destructive font-bold">-2.5%</span>
              <span className="ml-1 opacity-70">vs last period</span>
            </div>
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
                  <p className="text-xs text-muted-foreground">Daily revenue and passenger count</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
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
                      data={paymentStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {paymentStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, "Share"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {paymentStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{item.value}%</span>
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
                <h3 className="text-sm font-semibold text-foreground">Hourly Booking Pattern</h3>
                <p className="text-xs text-muted-foreground">Peak booking hours analysis</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyBookings}>
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
                <p className="text-xs text-muted-foreground">Daily bookings over time</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
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
                {busUtilization.map((bus) => (
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
                {driverPerformance.map((driver, index) => (
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
                    <div className="text-right">
                      <p className="text-sm font-medium">⭐ {driver.rating}</p>
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
                  <BarChart data={routePerformance} layout="vertical">
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
                {routePerformance.map((route) => (
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
                      data={tripStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {tripStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, "Share"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {tripStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{item.value}%</span>
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
                    <span className="text-sm font-medium">Trips Completed Today</span>
                    <span className="text-2xl font-bold text-success">24</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg. Delay Duration</span>
                    <span className="text-2xl font-bold text-warning">8 min</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Drivers</span>
                    <span className="text-2xl font-bold text-primary">12</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Buses in Service</span>
                    <span className="text-2xl font-bold text-info">15</span>
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
