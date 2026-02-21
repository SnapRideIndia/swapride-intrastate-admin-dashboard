import { useEffect, useState } from "react";
import { Plus, Search, MoreVertical, Eye, Phone, Mail, XCircle, CheckCircle, RotateCcw, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
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
import { useUsers, useUpdateUserStatus, useDeleteUser } from "@/features/users";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/constants/routes";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDebounce } from "@/hooks/useDebounce";

const Passengers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const search = searchParams.get("q") || "";
  const debouncedSearch = useDebounce(search, 500);
  const statusFilter = searchParams.get("status") || "all";

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useUsers({
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const updateUserStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();

  const users = usersData?.users || [];
  const totalCount = usersData?.total || 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "all" || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  const handleStatusChange = (id: string, action: "block" | "unblock" | "suspend") => {
    updateUserStatusMutation.mutate({ id, action });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Syncing passenger database..." />
      <PageHeader
        title="Passenger Management"
        subtitle={`Monitoring activity across ${totalCount} registered passengers.`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="border-border/60 rounded-full h-10 w-10 shadow-sm transition-transform active:rotate-180"
              title="Refresh Data"
            >
              <RotateCcw className="h-4 w-4 text-slate-600" />
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Passenger
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="dashboard-card p-4 mb-6 flex flex-col md:flex-row gap-4 items-center shadow-sm border-border/60 rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, mobile, or email..."
            className="pl-10 h-10 border-border/60 rounded-lg bg-background/50 shadow-none focus-visible:ring-1"
            value={search}
            onChange={(e) => updateFilters({ q: e.target.value })}
          />
        </div>

        <div className="flex gap-2 ml-auto">
          <Select value={statusFilter} onValueChange={(val) => updateFilters({ status: val })}>
            <SelectTrigger className="w-[160px] h-10 border-border/60 rounded-lg shadow-none">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>

          {(search || statusFilter !== "all") && (
            <Button
              variant="ghost"
              className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setSearchParams({}, { replace: true })}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Passenger</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Seat Type</TableHead>
              <TableHead>Total Trips</TableHead>
              <TableHead>Pending Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No passengers found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {user.fullName
                            ? user.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {user.mobileNumber}
                      </div>
                      {user.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">{"All Routes"}</TableCell>
                  <TableCell>
                    <span className="badge-info">{"Regular"}</span>
                  </TableCell>
                  <TableCell>{"-"}</TableCell>
                  <TableCell>
                    <span className="text-success">₹0</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        user.status === "ACTIVE"
                          ? "badge-success"
                          : user.status === "BLOCKED"
                            ? "badge-error"
                            : "badge-warning"
                      }
                    >
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(ROUTES.USER_DETAILS.replace(":id", user.id))}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        {user.status === "ACTIVE" ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(user.id, "block")}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Block User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleStatusChange(user.id, "unblock")}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Unblock User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="border-t border-border/40">
          <TablePagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Passengers;
