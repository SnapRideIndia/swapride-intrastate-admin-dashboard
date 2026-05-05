import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatService } from "@/utils/format.service";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ROUTES } from "@/constants/routes";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Shield,
  Users,
  Key,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Role } from "@/types";
import { getRoleColor } from "@/features/admin";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { useRoles, useDeleteRole } from "@/features/admin/hooks/useRoleQueries";
import { useAdmins } from "@/features/admin/hooks/useAdminQueries";
import { permissionService } from "@/features/admin";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { StatCard } from "@/features/analytics";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { AccessDenied } from "@/components/AccessDenied";
import { useApiError } from "@/hooks/useApiError";
import { PERMISSIONS } from "@/constants/permissions";

const Roles = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const debouncedSearch = useDebounce(searchQuery, 500);
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("limit")) || 20;

  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  const updateFilters = (updates: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    if (!updates.page && updates.q !== undefined) {
      newParams.delete("page");
    }
    setSearchParams(newParams);
  };

  // Tanstack Query hooks
  const { data: rolesData, isLoading: loadingRoles, error: rolesError } = useRoles({
    search: debouncedSearch,
    page: currentPage,
    limit: pageSize,
  });
  const { data: adminsData, isLoading: loadingAdmins } = useAdmins({ limit: 1000 });
  const { isAccessDenied } = useApiError(rolesError);
  const deleteMutation = useDeleteRole();

  const roles = rolesData?.data || [];
  const totalCount = rolesData?.total || 0;


  const adminCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const admins = adminsData?.data || [];
    admins.forEach((admin: { roleId?: string }) => {
      if (admin.roleId) {
        counts[admin.roleId] = (counts[admin.roleId] || 0) + 1;
      }
    });
    return counts;
  }, [adminsData]);

  const handleDelete = async () => {
    if (!deleteRole) return;

    const count = adminCounts[deleteRole.id] || 0;
    if (count > 0) {
      toast({
        title: "Cannot delete role",
        description: `This role has ${count} admin(s) assigned. Reassign them first.`,
        variant: "destructive",
      });
      setDeleteRole(null);
      return;
    }

    try {
      const success = await deleteMutation.mutateAsync(deleteRole.id);
      if (success) {
        toast({ title: "Role deleted successfully" });
      } else {
        toast({ title: "Cannot delete system role", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to delete role", variant: "destructive" });
    }
    setDeleteRole(null);
  };

  const isLoading = loadingRoles || loadingAdmins;

  if (!hasPermission(PERMISSIONS.ROLE_VIEW) || isAccessDenied) {
    return (
      <DashboardLayout>
        <AccessDenied variant="page" section="Role Management" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Loading Roles..." />
      <FullPageLoader show={deleteMutation.isPending} label="Deleting Role..." />

      <PageHeader
        title="Role Management"
        subtitle="Define roles and assign permissions"
        actions={
          hasPermission(PERMISSIONS.ROLE_CREATE) && (
            <Button onClick={() => navigate(ROUTES.ROLE_CREATE)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Roles" value={totalCount} icon={Shield} iconColor="text-primary" vibrant={true} />
        <StatCard
          title="Total Permissions"
          value={permissionService.getAll().length}
          icon={Key}
          iconColor="text-warning"
          vibrant={true}
        />
        <StatCard
          title="System Roles"
          value={roles.filter((r) => r.isSystemRole).length}
          icon={Users}
          iconColor="text-success"
          vibrant={true}
        />
      </div>

      <div className="dashboard-card p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => updateFilters({ q: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      <div className="dashboard-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Admins</TableHead>
              <TableHead className="text-center">System</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading && roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-muted">
                      <Search className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">No roles found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow 
                  key={role.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(ROUTES.ROLE_DETAILS.replace(":id", role.id))}
                >
                  <TableCell>
                    <Badge className={`${getRoleColor(role.slug)} w-fit font-medium`}>
                      {formatService.slugToHuman(role.slug)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-[10px] bg-muted px-2 py-1 rounded font-mono uppercase text-muted-foreground">
                      {role.slug}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{adminCounts[role.id] || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {role.isSystemRole ? (
                      <Badge className="bg-primary/10 text-primary">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(ROUTES.ROLE_DETAILS.replace(":id", role.id))}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Permissions
                        </DropdownMenuItem>
                        {hasPermission(PERMISSIONS.ROLE_EDIT) && (
                          <DropdownMenuItem onClick={() => navigate(ROUTES.ROLE_DETAILS.replace(":id", role.id))}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                        )}
                        {hasPermission(PERMISSIONS.ROLE_DELETE) && !role.isSystemRole && (
                          <DropdownMenuItem
                            onClick={() => setDeleteRole(role)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Role
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

      <AlertDialog open={!!deleteRole} onOpenChange={(open) => !open && setDeleteRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Role
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role <strong>{deleteRole?.name}</strong>? This will affect all admins
              assigned to this role.
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
    </DashboardLayout>
  );
};

export default Roles;
