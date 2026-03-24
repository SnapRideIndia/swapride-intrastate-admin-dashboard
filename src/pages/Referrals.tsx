import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  MoreVertical,
  CheckCircle2,
  Users,
  Gift,
  Eye,
  RotateCcw,
  Clock,
  ExternalLink,
  Filter,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablePagination } from "@/components/ui/table-pagination";
import { useReferrals, useReferralStats } from "@/features/referrals";
import { StatCard } from "@/features/analytics";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { useDebounce } from "@/hooks/useDebounce";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export default function Referrals() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const search = searchParams.get("q") || "";
  // Ensure we check for 'all' specifically to avoid falling back to the default
  const statusFilter = searchParams.get("status") || "PENDING";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [pageSize, setPageSize] = useState(15);

  const debouncedSearch = useDebounce(search, 500);

  const { data: referralsData, isLoading, refetch } = useReferrals({
    q: debouncedSearch,
    status: statusFilter,
    page: currentPage,
    limit: pageSize,
  });

  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useReferralStats();

  const referrals = referralsData?.data ?? [];
  const totalCount = referralsData?.pagination?.total ?? 0;

  // Log response for debugging
  useEffect(() => {
    if (referralsData) {
      console.log("Referrals Data Response:", referralsData);
    }
  }, [referralsData]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) newParams.delete(key);
      // We keep 'all' as a literal value so it doesn't fall back to PENDING default
      else if (key === "status" && value === "all") newParams.set(key, "all");
      else newParams.set(key, value);
    });
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const statusConfigs: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: "Success Ride", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    PENDING: { label: "Awaiting Ride", className: "bg-amber-50 text-amber-700 border-amber-100" },
    EXPIRED: { label: "Expired", className: "bg-slate-50 text-slate-500 border-slate-100" },
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading && referrals.length === 0} label="Fetching referral records..." />
      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title="Referral Program"
          subtitle="Monitor invitation status and automated reward distributions."
          actions={
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                refetch();
                refetchStats();
              }}
              className="rounded-full shadow-sm hover:rotate-180 transition-transform duration-500"
            >
              <RotateCcw className={cn("h-4 w-4", (isLoading || isStatsLoading) && "animate-spin")} />
            </Button>
          }
        />

        {/* Stats Grid - Using Standard StatCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Referrals"
            value={stats?.total ?? 0}
            icon={Users}
            iconColor="text-primary"
            vibrant
          />
          <StatCard
            title="Successful Rides"
            value={stats?.completed ?? 0}
            icon={CheckCircle2}
            iconColor="text-success"
            vibrant
            change={`${stats?.total ? Math.round((stats.completed / (stats.total || 1)) * 100) : 0}% success rate`}
          />
          <StatCard
            title="Pending Rewards"
            value={stats?.pending ?? 0}
            icon={Clock}
            iconColor="text-warning"
            vibrant
          />
          <StatCard
            title="Total Disbursed"
            value={`₹${stats?.totalRewardValue ?? 0}`}
            icon={Gift}
            iconColor="text-info"
            vibrant
          />
        </div>

        {/* Filters */}
        <Card className="dashboard-card p-4 flex flex-col md:flex-row gap-4 items-center bg-white shadow-sm border-border/80">
          <Tabs
            value={statusFilter}
            onValueChange={(val) => updateFilters({ status: val })}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all" className="uppercase font-bold text-[11px] px-6">All</TabsTrigger>
              <TabsTrigger value="PENDING" className="uppercase font-bold text-[11px] px-6 text-amber-600 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">Pending</TabsTrigger>
              <TabsTrigger value="COMPLETED" className="uppercase font-bold text-[11px] px-6 text-emerald-600 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sender or friend email..."
              className="pl-10 h-10 border-border/50 bg-white shadow-sm"
              value={search}
              onChange={(e) => updateFilters({ q: e.target.value })}
            />
          </div>
        </Card>

        {/* Table/List */}
        <div className="dashboard-card overflow-hidden bg-white shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border">
                  <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inviter (Referrer)</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Friend (Referee)</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reward Status</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invitation Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.length > 0 ? (
                  referrals.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50/40 transition-colors group">
                      <TableCellUser 
                        user={r.referrerUser} 
                        onClick={() => navigate(`${ROUTES.USERS}/${r.referrerUserId}`)} 
                      />
                      <TableCellUser 
                        user={r.referredUser} 
                        onClick={() => navigate(`${ROUTES.USERS}/${r.referredUserId}`)} 
                      />
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                           <Badge variant="outline" className={cn("w-fit font-bold text-[9px] uppercase tracking-wide px-2", statusConfigs[r.status]?.className)}>
                              {statusConfigs[r.status]?.label || r.status}
                           </Badge>
                           {r.rewardStatus === "CLAIMED" && (
                             <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1 ml-1 uppercase">
                               <CheckCircle2 className="h-2.5 w-2.5" /> Auto-Credited
                             </span>
                           )}
                           {r.rewardStatus === "PENDING" && (
                             <span className="text-[9px] font-bold text-amber-500/80 flex items-center gap-1 ml-1 uppercase text-nowrap">
                               <Clock className="h-2.5 w-2.5" /> Awaiting Ride
                             </span>
                           )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-700">₹{r.rewardAmount || 0}</div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Wallet Credit</p>
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-slate-600">
                        {formatDate(r.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-32 text-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-slate-50/20 -z-10" />
                       <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                          <div className="h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                             <Filter className="h-8 w-8" />
                          </div>
                          <h3 className="text-xl font-black text-slate-800 mb-2">No Records Found</h3>
                          <p className="text-sm text-slate-500 font-medium mb-6">We couldn't find any referral records matching those filters.</p>
                          <Button variant="secondary" className="rounded-xl px-8" onClick={() => { updateFilters({ q: "", status: "all" }); }}>Reset Filters</Button>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                Showing {referrals.length} of {totalCount} records
             </p>
             <TablePagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={(page) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("page", page.toString());
                  setSearchParams(newParams);
                }}
             />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TableCellUser({ user, onClick }: any) {
  return (
    <td className="py-4 px-6">
      <div 
        className="flex items-center gap-3 cursor-pointer group/user w-fit"
        onClick={onClick}
      >
        <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-100 transition-all group-hover/user:ring-primary/20">
          <AvatarImage src={user?.profileUrl || ""} />
          <AvatarFallback className="bg-slate-50 text-slate-400 font-bold text-xs">
            {user?.fullName?.substring(0, 2).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 group-hover/user:text-primary transition-colors truncate">
            {user?.fullName || "Guest User"}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">
            {user?.email || "No email provided"}
          </p>
        </div>
      </div>
    </td>
  );
}
