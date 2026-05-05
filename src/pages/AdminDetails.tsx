import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import { Edit, KeyRound, Mail, Phone, Building, Calendar, Clock, Shield, Check, ShieldCheck } from "lucide-react";
import { AdminUser } from "@/types";
import { adminService } from "@/features/admin";
import { roleService } from "@/features/admin";
import { permissionService, PERMISSION_CATEGORIES } from "@/features/admin";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { PERMISSIONS } from "@/constants/permissions";
import { format } from "date-fns";
import { formatService } from "@/utils/format.service";
import { AddAdminDialog } from "@/features/admin";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { PageHeader } from "@/components/ui/page-header";
import { UserAvatar } from "@/components/common/UserAvatar";

const AdminDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<any | null>(null);
  const [rolePermissionIds, setRolePermissionIds] = useState<string[]>([]);
  const [adminCount, setAdminCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const fetchAdminData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const foundAdmin = await adminService.getById(id);
      if (foundAdmin) {
        setAdmin(foundAdmin);

        // Fetch role, permissions, and count in parallel
        const [roleData, permissionIds, countResp] = await Promise.all([
          foundAdmin.roleId ? roleService.getById(foundAdmin.roleId) : Promise.resolve(null),
          foundAdmin.roleId ? roleService.getRolePermissions(foundAdmin.roleId) : Promise.resolve([]),
          foundAdmin.roleId ? roleService.getAdminCountByRole(foundAdmin.roleId) : Promise.resolve({ count: 0 }),
        ]);

        setRole(roleData || null);
        setRolePermissionIds(Array.isArray(permissionIds) ? permissionIds : []);
        setAdminCount(typeof countResp === "number" ? countResp : (countResp as any).count || 0);
      } else {
        setAdmin(null);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load admin details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [id]);

  if (!admin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Admin not found</p>
          <Button variant="link" onClick={() => navigate(ROUTES.ADMINS)}>
            Back to Admins
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const permissions = permissionService
    .getAll()
    .filter((p) => rolePermissionIds.includes(p.slug) || (admin?.permissions || []).includes("ALL"));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-emerald-500/10 text-emerald-500">Active</Badge>;
      case "Inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "Suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (roleName: string, roleSlug: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: "bg-purple-500/10 text-purple-500",
      OPERATIONS_MANAGER: "bg-blue-500/10 text-blue-500",
      SUPPORT_AGENT: "bg-green-500/10 text-green-500",
      FINANCE_MANAGER: "bg-amber-500/10 text-amber-500",
      DISPATCHER: "bg-cyan-500/10 text-cyan-500",
      VIEWER: "bg-slate-500/10 text-slate-500",
    };
    return <Badge className={`${colors[roleSlug] || "bg-muted"} text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 h-auto`}>{roleName}</Badge>;
  };

  const permissionsByCategory = PERMISSION_CATEGORIES.map((category) => ({
    category,
    permissions: permissions.filter((p) => p.category === category),
    allInCategory: permissionService.getByCategory(category),
  })).filter((group) => group.permissions.length > 0 || (admin?.permissions || []).includes("ALL"));

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Loading admin details..." />
      <PageHeader
        title={admin.name}
        subtitle={formatService.slugToHuman(admin.roleSlug)}
        backUrl={ROUTES.ADMINS}
        actions={
          <div className="flex gap-2">
            {hasPermission(PERMISSIONS.ADMIN_PASSWORD_RESET) && (
              <Button variant="outline" size="sm">
                <KeyRound className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
            )}
            {hasPermission(PERMISSIONS.ADMIN_EDIT) && (
              <Button size="sm" onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        }
      />

      {/* Profile Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <div className="dashboard-card p-6 h-full flex flex-col items-center text-center">
            <UserAvatar 
              src={admin.profilePicture} 
              name={admin.name} 
              className="h-24 w-24 border-4 border-background shadow-lg mb-4"
              fallbackClassName="text-3xl font-bold"
            />
            <h2 className="text-xl font-bold mb-1">{admin.name}</h2>
            <div className="flex items-center gap-2 mb-4 justify-center">
              {getStatusBadge(admin.status)}
              {getRoleBadge(admin.roleName || "No Role", admin.roleSlug)}
            </div>
            <Separator className="my-4" />
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> Email
                </span>
                <span className="font-medium">{admin.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> Phone
                </span>
                <span className="font-medium">{admin.phone || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Building className="h-3.5 w-3.5" /> Dept
                </span>
                <span className="font-medium">{admin.department || "Operations"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="dashboard-card p-6 h-full">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Account Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date Joined</p>
                  <p className="font-semibold">{format(new Date(admin.createdAt), "MMMM d, yyyy")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{format(new Date(admin.createdAt), "hh:mm a")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Activity</p>
                  <p className="font-semibold">
                    {admin.lastLogin ? format(new Date(admin.lastLogin), "MMMM d, yyyy") : "No login recorded"}
                  </p>
                  {admin.lastLogin && (
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(admin.lastLogin), "hh:mm a")}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="flex gap-4 items-center">
              <div className="flex-1 p-4 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-2xl font-bold text-primary">{permissions.length}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Total Permissions</p>
              </div>
              <div className="flex-1 p-4 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-2xl font-bold text-primary">{adminCount}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Admins with this Role</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="permissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="role" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Role Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions">
          <div className="dashboard-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {(admin?.permissions || []).includes("ALL")
                  ? "Full Access Permissions"
                  : `Assigned Permissions (${permissions.length})`}
              </h3>
              {(admin?.permissions || []).includes("ALL") && (
                <Badge className="bg-primary/10 text-primary border-primary/20">System Master</Badge>
              )}
            </div>

            {(admin?.permissions || []).includes("ALL") ? (
              <p className="text-muted-foreground">This admin has Super Admin access with all system permissions.</p>
            ) : (
              <div className="space-y-6">
                {permissionsByCategory.map(({ category, permissions: catPerms, allInCategory }) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {((admin?.permissions || []).includes("ALL") ? allInCategory : catPerms).map((perm) => (
                        <div key={perm.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                          <Check className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm">{perm.name}</span>
                        </div>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="role">
          <div className="dashboard-card p-6">
            {role ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{role.name}</h3>
                  {role.isSystemRole && <Badge variant="outline">System Role</Badge>}
                </div>
                <p className="text-muted-foreground">{role.description}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">{rolePermissionIds.length}</p>
                    <p className="text-xs text-muted-foreground">Permissions</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">{adminCount}</p>
                    <p className="text-xs text-muted-foreground">Admins with this role</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Role information not available</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <AddAdminDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchAdminData}
        editAdmin={admin}
      />
    </DashboardLayout>
  );
};

export default AdminDetails;
