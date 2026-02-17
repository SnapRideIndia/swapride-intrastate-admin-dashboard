import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MoreVertical, Edit, Eye, CheckCircle, Mail, Phone } from "lucide-react";
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
import { userService } from "@/features/users";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { StatCard } from "@/features/analytics";
import { Users as UsersIcon, UserCheck, Ban, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/users/${id}`);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const nameStr = user.fullName || "";
        const emailStr = user.email || "";
        const mobileStr = user.mobileNumber || "";

        const matchesSearch =
          nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emailStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mobileStr.includes(searchQuery);

        const matchesStatus = statusFilter === "all" || user.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  const handleBlockUser = async (id: string) => {
    try {
      setIsActionLoading(true);
      await userService.blockUser(id);
      await fetchUsers();
      toast({
        title: "User Blocked",
        description: "The user has been blocked successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to block user.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnblockUser = async (id: string) => {
    try {
      setIsActionLoading(true);
      await userService.unblockUser(id);
      await fetchUsers();
      toast({
        title: "User Unblocked",
        description: "The user has been unblocked successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unblock user.",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "ACTIVE":
        return "badge-success";
      case "BLOCKED":
        return "badge-error";
      case "SUSPENDED":
        return "badge-warning";
      default:
        return "badge-info";
    }
  };

  if (isLoading) {
    return <FullPageLoader show={true} label="Loading users..." />;
  }

  return (
    <DashboardLayout>
      <FullPageLoader show={isActionLoading} />
      <PageHeader title="User Management" subtitle={`Manage ${users.length} registered users`} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users" value={users.length} icon={UsersIcon} iconColor="text-primary" vibrant={true} />
        <StatCard
          title="Active Users"
          value={users.filter((u) => (u.status || "").toUpperCase() === "ACTIVE").length}
          icon={UserCheck}
          iconColor="text-success"
          vibrant={true}
        />
        <StatCard
          title="Blocked"
          value={users.filter((u) => (u.status || "").toUpperCase() === "BLOCKED").length}
          icon={Ban}
          iconColor="text-destructive"
          vibrant={true}
        />
        <StatCard
          title="Total Bookings"
          value={users.reduce((sum, u) => sum + (u.totalBookings || 0), 0)}
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
              placeholder="Search by name, email, or phone..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
      <div className="table-container">
        <Table>
          <TableHeader>
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
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleViewDetails(user.id)}
                >
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {user.mobileNumber}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.bloodGroup || "N/A"}</TableCell>
                  <TableCell>{user.totalBookings || 0}</TableCell>
                  <TableCell>₹{(user.totalAmountSpent || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    {user.lastBookingDate ? new Date(user.lastBookingDate).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <span className={getStatusBadge(user.status)}>{user.status}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
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
                          <DropdownMenuItem className="text-destructive" onClick={() => handleBlockUser(user.id)}>
                            <Ban className="h-4 w-4 mr-2" />
                            Block User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-success" onClick={() => handleUnblockUser(user.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Unblock User
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
      </div>
    </DashboardLayout>
  );
};

export default Users;
