import { useState, useMemo, useEffect } from "react";
import { formatService } from "@/utils/format.service";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  UserX,
  UserCheck,
  Trash2,
  KeyRound,
  Users,
  Shield,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { AdminUser } from "@/types";
import { AddAdminDialog, getRoleColor } from "@/features/admin";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/providers/AuthContext";
import { format } from "date-fns";
import {
  useAdmins,
  useAdminStats,
  useDeleteAdmin,
  useSuspendAdmin,
  useActivateAdmin,
} from "@/features/admin/hooks/useAdminQueries";
import { useRoles } from "@/features/admin/hooks/useRoleQueries";
import { StatCard } from "@/features/analytics";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { TablePagination } from "@/components/ui/table-pagination";

const Admins = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<AdminUser | null>(null);
  const [suspendAdmin, setSuspendAdmin] = useState<AdminUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Tanstack Query hooks
  const { data: admins = [], isLoading: loadingAdmins } = useAdmins();
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: roles = [], isLoading: loadingRoles } = useRoles();

  const deleteMutation = useDeleteAdmin();
  const suspendMutation = useSuspendAdmin();
  const activateMutation = useActivateAdmin();

  const isLoading = loadingAdmins || loadingStats || loadingRoles;

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchesSearch =
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (admin.phone && admin.phone.includes(searchQuery));
      const matchesStatus = statusFilter === "all" || admin.status === statusFilter;
      const matchesRole = roleFilter === "all" || admin.roleId === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [admins, searchQuery, statusFilter, roleFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter]);

  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredAdmins.slice(start, end);
  }, [filteredAdmins, currentPage, pageSize]);

  const handleDelete = async () => {
    if (!deleteAdmin) return;
    if (deleteAdmin.id === user?.id) {
      toast({ title: "Cannot delete your own account", variant: "destructive" });
      setDeleteAdmin(null);
      return;
    }

    try {
      const success = await deleteMutation.mutateAsync(deleteAdmin.id);
      if (success) {
        toast({ title: "Admin deleted successfully" });
      } else {
        toast({ title: "Cannot delete the last Super Admin", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to delete admin", variant: "destructive" });
    }
    setDeleteAdmin(null);
  };

  const handleSuspendToggle = async () => {
    if (!suspendAdmin) return;
    if (suspendAdmin.id === user?.id) {
      toast({ title: "Cannot suspend your own account", variant: "destructive" });
      setSuspendAdmin(null);
      return;
    }

    try {
      if (suspendAdmin.status === "Suspended") {
        await activateMutation.mutateAsync(suspendAdmin.id);
        toast({ title: "Admin activated successfully" });
      } else {
        await suspendMutation.mutateAsync(suspendAdmin.id);
        toast({ title: "Admin suspended successfully" });
      }
    } catch {
      toast({ title: "Failed to update admin status", variant: "destructive" });
    }
    setSuspendAdmin(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Active</Badge>;
      case "Inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "Suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (admin: AdminUser) => {
    const slug = admin.roleSlug || "";
    return (
      <div className="flex flex-col gap-1">
        <Badge className={`${getRoleColor(slug)} w-fit`}>{formatService.slugToHuman(slug)}</Badge>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Loading Admins..." />
      <FullPageLoader show={deleteMutation.isPending} label="Deleting Admin..." />
      <FullPageLoader show={suspendMutation.isPending || activateMutation.isPending} label="Updating Status..." />

      <PageHeader
        title="Admin Management"
        subtitle="Manage admin users and their access permissions"
        actions={
          hasPermission("ADMIN_CREATE") && (
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Admins"
          value={stats?.totalAdmins || 0}
          icon={Users}
          iconColor="text-primary"
          vibrant={true}
        />
        <StatCard
          title="Active Admins"
          value={stats?.activeAdmins || 0}
          icon={UserCheck}
          iconColor="text-success"
          vibrant={true}
        />
        <StatCard
          title="Suspended"
          value={stats?.suspendedAdmins || 0}
          icon={UserX}
          iconColor="text-destructive"
          vibrant={true}
        />
        <StatCard title="Roles" value={roles.length} icon={Shield} iconColor="text-info" vibrant={true} />
      </div>

      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {formatService.slugToHuman(role.slug)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="dashboard-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading && filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-muted">
                      <Search className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">No admins found</p>
                    <p className="text-xs">Try adjusting your filters or search query</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {admin.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatService.slugToHuman(admin.roleSlug)}
                          {admin.department && ` • ${admin.department}`}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.phone}</TableCell>
                  <TableCell>{getRoleBadge(admin)}</TableCell>
                  <TableCell>{getStatusBadge(admin.status)}</TableCell>
                  <TableCell>
                    {admin.lastLogin ? format(new Date(admin.lastLogin), "MMM d, yyyy HH:mm") : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admins/${admin.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {hasPermission("ADMIN_EDIT") && (
                          <DropdownMenuItem onClick={() => setEditAdmin(admin)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {hasPermission("ADMIN_PASSWORD_RESET") && (
                          <DropdownMenuItem>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {hasPermission("ADMIN_SUSPEND") && admin.id !== user?.id && (
                          <DropdownMenuItem onClick={() => setSuspendAdmin(admin)}>
                            {admin.status === "Suspended" ? (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            ) : (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Suspend
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        {hasPermission("ADMIN_DELETE") && admin.id !== user?.id && (
                          <DropdownMenuItem
                            onClick={() => setDeleteAdmin(admin)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
          className="mt-4"
          currentPage={currentPage}
          totalCount={filteredAdmins.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      <AddAdminDialog
        open={addDialogOpen || !!editAdmin}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) setEditAdmin(null);
        }}
        onSuccess={() => {}}
        editAdmin={editAdmin}
      />

      <AlertDialog open={!!deleteAdmin} onOpenChange={(open) => !open && setDeleteAdmin(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Admin
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteAdmin?.name}</strong>? This action cannot be undone and
              will permanently remove their account and access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!suspendAdmin} onOpenChange={(open) => !open && setSuspendAdmin(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{suspendAdmin?.status === "Suspended" ? "Activate" : "Suspend"} Admin</AlertDialogTitle>
            <AlertDialogDescription>
              {suspendAdmin?.status === "Suspended" ? (
                <>
                  Are you sure you want to activate <strong>{suspendAdmin?.name}</strong>? They will regain access to
                  the system.
                </>
              ) : (
                <>
                  Are you sure you want to suspend <strong>{suspendAdmin?.name}</strong>? They will lose access to the
                  system until reactivated.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendToggle}
              disabled={suspendMutation.isPending || activateMutation.isPending}
            >
              {suspendMutation.isPending || activateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {suspendAdmin?.status === "Suspended" ? "Activate" : "Suspend"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Admins;
