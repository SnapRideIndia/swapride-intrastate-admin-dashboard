import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAnalyticsKpi } from "../hooks/useAnalyticsQueries";
import { AnalyticsFilters } from "@/types";
import {
  Loader2,
  TrendingUp,
  Users,
  AlertCircle,
  MapPin,
  ExternalLink,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface KpiAnalyticsTabProps {
  filters: AnalyticsFilters;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function KpiAnalyticsTab({ filters }: KpiAnalyticsTabProps) {
  const { data, isLoading, error } = useAnalyticsKpi(filters);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-2 text-destructive">
        <AlertCircle className="h-10 w-10" />
        <p>Failed to load KPI metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="dashboard-card border-none bg-gradient-to-br from-indigo-50/50 to-white shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={80} className="text-indigo-600" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-indigo-900">Total Bus Demand Signals</p>
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-indigo-950">{data?.summary.totalFullTripSearches || 0}</p>
            <p className="mt-2 text-xs text-indigo-600 font-medium bg-indigo-100/50 w-fit px-2 py-0.5 rounded-full">
              Users who found all trips full
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-none bg-gradient-to-br from-rose-50/50 to-white shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle size={80} className="text-rose-600" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-rose-900">Seat Selection Drop-offs</p>
              <Users className="h-5 w-5 text-rose-600" />
            </div>
            <p className="text-3xl font-bold text-rose-950">{data?.summary.totalLayoutDropoffs || 0}</p>
            <p className="mt-2 text-xs text-rose-600 font-medium bg-rose-100/50 w-fit px-2 py-0.5 rounded-full">
              Users who exited without booking
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand Heatmap */}
        <Card className="dashboard-card p-5 border-none shadow-sm h-full">
          <CardHeader className="p-0 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Demand Heatmap</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Routes with highest unsatisfied search volume (100% full trips)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.demandHeatmap}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey={(d) => `${d.sourceName || "Unknown"} → ${d.destinationName || "Unknown"}`}
                  type="category"
                  tick={{ fontSize: 10, fill: "#666" }}
                  width={120}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="searchCount" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} name="Lost Searches" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dropoff Reasons */}
        <Card className="dashboard-card p-5 border-none shadow-sm h-full">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-sm font-semibold">Seat Preference Friction</CardTitle>
            <CardDescription className="text-xs">Why users leave the bus layout selection</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.dropoffReasons}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.dropoffReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Granular Insights: Recent Lost Opportunities */}
      <Card className="dashboard-card border-none shadow-sm h-full overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                Recent Lost Opportunities
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Detailed list of users who searched but found all buses full
              </CardDescription>
            </div>
            <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-1 rounded-full font-bold uppercase">
              Action Required
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <th className="px-5 py-3">Frustrated User</th>
                  <th className="px-5 py-3">Route Search</th>
                  <th className="px-5 py-3">Travel Date</th>
                  <th className="px-5 py-3">Logged At</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recentOverloads.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {item.userName.charAt(0)}
                        </div>
                        <div>
                          <p
                            className="text-sm font-bold text-slate-900 cursor-pointer hover:text-indigo-600 hover:underline decoration-2"
                            onClick={() => item.userId && navigate(ROUTES.USER_DETAILS.replace(":id", item.userId))}
                          >
                            {item.userName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">#{item.userId?.slice(-6) || "Guest"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700">{item.sourceName}</span>
                        <ArrowRight className="h-3 w-3 text-slate-300" />
                        <span className="text-sm font-semibold text-slate-700">{item.destinationName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <Calendar className="h-3.3 w-3.5 text-slate-400" />
                        {item.travelDate}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <Clock className="h-3.3 w-3.5 text-slate-400" />
                        {item.createdAt}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all"
                        onClick={() => item.userId && navigate(ROUTES.USER_DETAILS.replace(":id", item.userId))}
                        title="View User Details"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!data?.recentOverloads || data.recentOverloads.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400 italic">
                      No frustrated searchers recorded for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
