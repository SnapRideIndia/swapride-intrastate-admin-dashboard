import { useState, useMemo } from "react";
import { formatService } from "@/utils/format.service";
import { DashboardLayout } from "@/layouts/DashboardLayout";
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
import { AddRoleDialog, getRoleColor } from "@/features/admin";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { useRoles, useDeleteRole, useRolePermissions } from "@/features/admin/hooks/useRoleQueries";
import { useAdmins } from "@/features/admin/hooks/useAdminQueries";
import { permissionService } from "@/features/admin";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { StatCard } from "@/features/analytics";

const Roles = () => {
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const [viewRole, setViewRole] = useState<Role | null>(null);

  // Tanstack Query hooks
  const { data: roles = [], isLoading: loadingRoles } = useRoles();
  const { data: admins = [], isLoading: loadingAdmins } = useAdmins();
  const deleteMutation = useDeleteRole();

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [roles, searchQuery]);

  const adminCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    admins.forEach((admin) => {
      if (admin.roleId) {
        counts[admin.roleId] = (counts[admin.roleId] || 0) + 1;
      }
    });
    return counts;
  }, [admins]);

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

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Loading Roles..." />
      <FullPageLoader show={deleteMutation.isPending} label="Deleting Role..." />

      <PageHeader
        title="Role Management"
        subtitle="Define roles and assign permissions"
        actions={
          hasPermission("ROLE_CREATE") && (
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Roles" value={roles.length} icon={Shield} iconColor="text-primary" vibrant={true} />
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
            {!isLoading && filteredRoles.length === 0 ? (
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
              filteredRoles.map((role) => (
                <TableRow key={role.id}>
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
                        <DropdownMenuItem onClick={() => setViewRole(role)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Permissions
                        </DropdownMenuItem>
                        {hasPermission("ROLE_EDIT") && (
                          <DropdownMenuItem onClick={() => setEditRole(role)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Role
                          </DropdownMenuItem>
                        )}
                        {hasPermission("ROLE_DELETE") && !role.isSystemRole && (
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
      </div>

      <AddRoleDialog
        open={addDialogOpen || !!editRole}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) setEditRole(null);
        }}
        onSuccess={() => {}} // Tanstack Query handles invalidation
        editRole={editRole}
      />

      <ViewPermissionsDialog role={viewRole} open={!!viewRole} onOpenChange={(open) => !open && setViewRole(null)} />

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

// Helper component for View Permissions Dialog
const ViewPermissionsDialog = ({
  role,
  open,
  onOpenChange,
}: {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { data: rolePermIds = [], isLoading } = useRolePermissions(role?.id || "");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {role ? formatService.slugToHuman(role.slug) : ""} Permissions
          </AlertDialogTitle>
          <AlertDialogDescription>{role?.description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex-1 overflow-y-auto my-4 min-h-[200px]">
          {isLoading ? (
            <FullPageLoader show={true} label="Loading permissions..." />
          ) : (
            <div className="space-y-4">
              {permissionService.getCategories().map((category) => {
                const categoryPerms = permissionService
                  .getByCategory(category)
                  .filter((p) => rolePermIds.includes(p.id));

                if (categoryPerms.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-semibold border-b pb-1">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {categoryPerms.map((perm) => (
                        <Badge key={perm.id} variant="secondary" className="text-[10px]">
                          {perm.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
              {rolePermIds.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No permissions assigned to this role.</div>
              )}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Roles;
