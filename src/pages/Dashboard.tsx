import { useState, useEffect } from "react";
import { Bus, Users, Route, IndianRupee, UserCog, CalendarCheck, Plus, MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/features/analytics";
import { RevenueChart } from "@/features/analytics";
import { LiveBusTracker } from "@/features/analytics";
import { RecentTickets } from "@/features/analytics";
import { RouteDistribution } from "@/features/analytics";
import { Button } from "@/components/ui/button";
import { analyticsService } from "@/features/analytics";
import { bookingService } from "@/features/bookings";
import { notificationService } from "@/features/notifications";
import { AddBusDialog } from "@/features/buses";
import { AddRouteDialog } from "@/features/routes";
import { AssignTripDialog } from "@/features/trips/components/AssignTripDialog";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { DashboardStats } from "@/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalBuses: 0,
    activeBuses: 0,
    totalDrivers: 0,
    availableDrivers: 0,
    totalUsers: 0,
    activeTripsToday: 0,
    todayRevenue: 0,
    todayBookings: 0,
    busesOnTime: 0,
    busesDelayed: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [busUtilization, setBusUtilization] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [dashboardStats, utilization, bookings, notifications] = await Promise.all([
          analyticsService.getDashboardStats(),
          analyticsService.getBusUtilization(),
          Promise.resolve(bookingService.getRecentBookings(5)), // Keep as is if sync, wrap if async
          notificationService.getRecent(5),
        ]);
        setStats(dashboardStats);
        setBusUtilization(utilization);
        setRecentBookings(bookings);
        setRecentNotifications(notifications);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <FullPageLoader show={loading} label="Synchronizing dashboard data..." />

      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.ANALYTICS)}>
            View Analytics
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        }
      />

      {!loading && (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <StatCard
              title="Total Buses"
              value={stats.totalBuses}
              change={`${stats.activeBuses} active`}
              changeType="positive"
              icon={Bus}
              iconBgColor="bg-primary/10"
              iconColor="text-primary"
              href={ROUTES.BUSES}
              vibrant={true}
            />
            <StatCard
              title="Active Trips"
              value={stats.activeTripsToday}
              change="In progress now"
              changeType="neutral"
              icon={Route}
              iconBgColor="bg-info/10"
              iconColor="text-info"
              href={ROUTES.LIVE_TRACKING}
              vibrant={true}
            />
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              change="Registered users"
              changeType="neutral"
              icon={Users}
              iconBgColor="bg-success/10"
              iconColor="text-success"
              href={ROUTES.USERS}
              vibrant={true}
            />
            <StatCard
              title="Total Drivers"
              value={stats.totalDrivers}
              change={`${stats.availableDrivers} available`}
              changeType="positive"
              icon={UserCog}
              iconBgColor="bg-warning/10"
              iconColor="text-warning"
              href={ROUTES.DRIVERS}
              vibrant={true}
            />
            <StatCard
              title="Today's Revenue"
              value={`₹${stats.todayRevenue.toLocaleString()}`}
              change="+8.2% from yesterday"
              changeType="positive"
              icon={IndianRupee}
              iconBgColor="bg-success/10"
              iconColor="text-success"
              href={ROUTES.ANALYTICS}
              vibrant={true}
            />
            <StatCard
              title="Today's Bookings"
              value={stats.todayBookings}
              change="Total bookings"
              changeType="neutral"
              icon={CalendarCheck}
              iconBgColor="bg-primary/10"
              iconColor="text-primary"
              href={ROUTES.TRIPS}
              vibrant={true}
            />
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card p-4 mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <AddBusDialog onBusAdded={() => navigate(ROUTES.BUSES)} />
              <AddRouteDialog />
              <AssignTripDialog />
              <Button variant="outline" onClick={() => navigate(ROUTES.DRIVERS)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Driver
              </Button>
              <Button variant="outline" onClick={() => navigate(ROUTES.LIVE_TRACKING)}>
                <MapPin className="h-4 w-4 mr-2" />
                View Live Tracking
              </Button>
            </div>
          </div>

          {/* Charts and Tracking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div
              className="cursor-pointer transition-transform hover:scale-[1.005]"
              onClick={() => navigate(ROUTES.ANALYTICS)}
            >
              <RevenueChart />
            </div>
            <LiveBusTracker />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Bookings */}
            <div className="lg:col-span-2">
              <div className="dashboard-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Recent Bookings</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.TRIPS)}>
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{booking.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.routeName} • Seat {booking.seatNumber}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{booking.amount}</p>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded",
                              booking.paymentStatus === "Paid" ? "badge-success" : "badge-warning",
                            )}
                          >
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent bookings</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="dashboard-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Activities</h3>
              </div>
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 rounded-lg border-l-2 bg-muted/20",
                      notification.type === "booking" && "border-l-primary",
                      notification.type === "delay" && "border-l-destructive",
                      notification.type === "payment" && "border-l-success",
                      notification.type === "trip" && "border-l-info",
                      notification.type === "maintenance" && "border-l-warning",
                    )}
                  >
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div
              className="cursor-pointer transition-transform hover:scale-[1.005]"
              onClick={() => navigate(ROUTES.SUPPORT)}
            >
              <RecentTickets />
            </div>
            <div
              className="cursor-pointer transition-transform hover:scale-[1.005]"
              onClick={() => navigate(ROUTES.ROUTES)}
            >
              <RouteDistribution />
            </div>
            <div className="dashboard-card p-5">
              <h3 className="font-semibold mb-4">Bus Utilization</h3>
              <div className="space-y-3">
                {busUtilization.length > 0 ? (
                  busUtilization.map((bus) => (
                    <div key={bus.busNumber} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{bus.busNumber}</span>
                        <span className="font-medium">{bus.utilization}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            bus.utilization >= 80
                              ? "bg-success"
                              : bus.utilization >= 60
                                ? "bg-warning"
                                : "bg-destructive",
                          )}
                          style={{ width: `${bus.utilization}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No utilization data</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
