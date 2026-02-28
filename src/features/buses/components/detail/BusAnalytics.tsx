import { useState, useEffect } from "react";
import { TrendingUp, CheckCircle2, Zap, Calendar, RefreshCw } from "lucide-react";
import { busService } from "../../api/bus.service";
import { MetricCard } from "./shared/MetricCard";

interface BusAnalyticsProps {
  busId: string;
}

export const BusAnalytics = ({ busId }: BusAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    busService.getBusAnalytics(busId).then((data) => {
      setAnalytics(data);
      setLoading(false);
    });
  }, [busId]);

  if (loading)
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="animate-spin h-6 w-6 text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₹${analytics.totalRevenue.toLocaleString()}`}
          color="primary"
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Bookings"
          value={analytics.totalBookings.toLocaleString()}
          color="success"
          icon={CheckCircle2}
        />
        <MetricCard title="Occupancy" value={`${analytics.occupancyRate}%`} color="info" icon={Zap} />
        <MetricCard title="Utilization" value={`${analytics.dailyUtilization}%`} color="warning" icon={Calendar} />
      </div>

      <div className="dashboard-card p-6 h-[300px] flex items-center justify-center border-dashed opacity-40">
        <div className="text-center">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="font-bold">Comparative Performance Chart</p>
          <p className="text-xs text-muted-foreground mt-1">Detailed visualization appearing soon...</p>
        </div>
      </div>
    </div>
  );
};
