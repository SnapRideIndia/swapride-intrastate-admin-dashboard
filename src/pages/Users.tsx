import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, MoreVertical, Edit, Eye, CheckCircle, Mail, Phone, XCircle } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { StatCard } from "@/features/analytics";
import { Users as UsersIcon, UserCheck, Ban, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { TablePagination } from "@/components/ui/table-pagination";
import { useUsers, useUpdateUserStatus } from "@/features/users/hooks/useUsers";
import { useDebounce } from "@/hooks/useDebounce";

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("q") || "";
  const debouncedSearch = useDebounce(searchQuery, 500);
  const statusFilter = searchParams.get("status") || "all";
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 20;

  const updateFilters = (updates: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    // Reset to page 1 when filters change, unless page itself is being updated
    if (!updates.page && (updates.q !== undefined || updates.status !== undefined)) {
      newParams.delete("page");
    }
    setSearchParams(newParams);
  };

  const { data: usersData, isLoading } = useUsers({
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    search: debouncedSearch,
    status: statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
  });

  const updateUserStatus = useUpdateUserStatus();

  const users = usersData?.users || [];
  const totalCount = usersData?.total || 0;

  const handleViewDetails = (id: string) => {
    navigate(`/users/${id}`);
  };

  const handleBlockUser = (id: string) => {
    updateUserStatus.mutate({ id, action: "block" });
  };

  const handleUnblockUser = (id: string) => {
    updateUserStatus.mutate({ id, action: "unblock" });
  };

  const handleSuspendUser = (id: string) => {
    updateUserStatus.mutate({ id, action: "suspend" });
  };

  if (isLoading) {
    return <FullPageLoader show={true} label="Loading users..." />;
  }

  return (
    <DashboardLayout>
      <FullPageLoader show={updateUserStatus.isPending} />
      <PageHeader title="User Management" subtitle={`Manage ${totalCount} registered users`} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users" value={totalCount} icon={UsersIcon} iconColor="text-primary" vibrant={true} />
        <StatCard
          title="Active Users"
          value={usersData?.activeUsersCount || 0}
          icon={UserCheck}
          iconColor="text-success"
          vibrant={true}
        />
        <StatCard
          title="Blocked"
          value={usersData?.blockedUsersCount || 0}
          icon={Ban}
          iconColor="text-destructive"
          vibrant={true}
        />
        <StatCard
          title="Total Bookings"
          value={usersData?.totalBookingsCount || 0}
          icon={CreditCard}
          iconColor="text-info"
          vibrant={true}
        />
      </div>

      {/* Filters */}
      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or mobile..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => updateFilters({ q: e.target.value })}
            />
          </div>
          <Select value={statusFilter} onValueChange={(val) => updateFilters({ status: val })}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container shadow-sm border border-border/40 overflow-hidden bg-white rounded-xl">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Amount Spent</TableHead>
              <TableHead>Last Booking</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center opacity-60">
                    <UsersIcon className="h-10 w-10 mb-2 text-gray-300" />
                    <p className="text-lg font-medium">No users found matching your criteria.</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        updateFilters({ q: "", status: "all", page: 1 });
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="group transition-colors hover:bg-slate-50/50 cursor-pointer"
                  onClick={() => handleViewDetails(user.id)}
                >
                  <TableCell className="font-semibold text-slate-800">{user.fullName}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm font-medium text-slate-600">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {user.mobileNumber}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">{user.bloodGroup || "N/A"}</TableCell>
                  <TableCell className="text-slate-600 font-bold">{user.totalBookings || 0}</TableCell>
                  <TableCell className="text-slate-900 font-bold text-sm">
                    ₹{(user.totalAmountSpent || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-slate-500 font-medium text-xs">
                    {user.lastBookingDate ? new Date(user.lastBookingDate).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.status?.toUpperCase() === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : user.status?.toUpperCase() === "BLOCKED"
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : user.status?.toUpperCase() === "SUSPENDED"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-slate-50 text-slate-700 border border-slate-100"
                      }`}
                    >
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(user.id);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {(user.status || "").toUpperCase() === "ACTIVE" ? (
                          <>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleBlockUser(user.id)}>
                              <Ban className="h-4 w-4 mr-2" />
                              Block User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-amber-600" onClick={() => handleSuspendUser(user.id)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Suspend User
                            </DropdownMenuItem>
                          </>
                        ) : (user.status || "").toUpperCase() === "BLOCKED" ? (
                          <DropdownMenuItem className="text-success" onClick={() => handleUnblockUser(user.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Unblock User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-success" onClick={() => handleUnblockUser(user.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={(page) => updateFilters({ page })}
          onPageSizeChange={(size) => {
            updateFilters({ limit: size, page: 1 });
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Users;
