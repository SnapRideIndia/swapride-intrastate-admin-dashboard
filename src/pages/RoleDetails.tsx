import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import { permissionService, PERMISSION_CATEGORIES } from "@/features/admin";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { 
  ShieldCheck, 
  Edit, 
  Save, 
  X, 
  Check, 
  Minus,
  Trash2,
  AlertTriangle,
  Info
} from "lucide-react";

import { useRole, useRolePermissions, useUpdateRole, useCreateRole, useDeleteRole } from "@/features/admin/hooks/useRoleQueries";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { AccessDenied } from "@/components/AccessDenied";
import { useApiError } from "@/hooks/useApiError";
import { PERMISSIONS } from "@/constants/permissions";
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

const RoleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const isNew = id === "create" || pathname.endsWith("/create");

  const [isEditing, setIsEditing] = useState(isNew);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Queries
  const { data: role, isLoading: loadingRole, error: roleError } = useRole(id || "", { enabled: !isNew });
  const { data: rolePerms = [], isLoading: loadingPerms } = useRolePermissions(id || "", { enabled: !isNew && !!id });
  const { isAccessDenied } = useApiError(roleError);
  const updateMutation = useUpdateRole();
  const createMutation = useCreateRole();
  const deleteMutation = useDeleteRole();

  const allPermissions = permissionService.getAll();

  useEffect(() => {
    if (role && !isNew) {
      setFormData({
        name: role.name,
        slug: role.slug,
        description: role.description || "",
      });
    }
  }, [role, isNew]);

  // Serialize to a stable string so a new array reference doesn't re-trigger the effect
  const rolePermsKey = rolePerms.join(",");

  useEffect(() => {
    // Sync from server data only when viewing (not editing)
    if (!isNew && !isEditing) {
      setSelectedPermissions(rolePerms);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolePermsKey, isNew, isEditing]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Role name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (selectedPermissions.length === 0) newErrors.permissions = "At least one permission is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (isNew) {
        const result = await createMutation.mutateAsync({
          ...formData,
          permissions: selectedPermissions,
        });
        toast({ title: "Role created successfully" });
        navigate(ROUTES.ROLE_DETAILS.replace(":id", result.id));
      } else if (role) {
        setIsEditing(false);
        await updateMutation.mutateAsync({
          id: role.id,
          data: { ...formData, permissions: selectedPermissions },
        });
        toast({ title: "Role updated successfully" });
      }
    } catch {
      setIsEditing(true); // restore editing state on error
      toast({ title: "Error saving role", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!role) return;
    try {
      await deleteMutation.mutateAsync(role.id);
      toast({ title: "Role deleted successfully" });
      navigate(ROUTES.ROLES);
    } catch {
      toast({ title: "Error deleting role", variant: "destructive" });
    }
  };

  const togglePermission = (slug: string) => {
    if (!isEditing) return;
    setSelectedPermissions((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleCategory = (category: string) => {
    if (!isEditing) return;
    const catPerms = permissionService.getByCategory(category).map(p => p.slug);
    const allSelected = catPerms.every(slug => selectedPermissions.includes(slug));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(slug => !catPerms.includes(slug)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...catPerms])));
    }
  };

  const isCategoryFullySelected = (category: string) => {
    const catPerms = permissionService.getByCategory(category);
    return catPerms.every((p) => selectedPermissions.includes(p.slug));
  };

  const isCategoryPartiallySelected = (category: string) => {
    const catPerms = permissionService.getByCategory(category);
    const selectedCount = catPerms.filter((p) => selectedPermissions.includes(p.slug)).length;
    return selectedCount > 0 && selectedCount < catPerms.length;
  };

  const isLoading = loadingRole || loadingPerms || updateMutation.isPending || createMutation.isPending || deleteMutation.isPending;


  if (!hasPermission(PERMISSIONS.ROLE_VIEW) || isAccessDenied) {
    return (
      <DashboardLayout>
        <AccessDenied variant="page" section="Role Details" />
      </DashboardLayout>
    );
  }

  const pageTitle = isNew ? "Create New Role" : isEditing ? `Edit Role: ${role?.name}` : role?.name || "Role Details";
  const pageSubtitle = isNew ? "Define a new administrative role" : isEditing ? "Modify permissions and details" : "View assigned permissions";

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Processing..." />
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        backUrl={ROUTES.ROLES}
        actions={
          <div className="flex gap-2">
            {!isNew && !isEditing ? (
              <>
                {hasPermission(PERMISSIONS.ROLE_EDIT) && (
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Role
                  </Button>
                )}
                {hasPermission(PERMISSIONS.ROLE_DELETE) && !role?.isSystemRole && (
                  <Button size="sm" variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => isNew ? navigate(ROUTES.ROLES) : setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isNew ? "Create Role" : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Role Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="dashboard-card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Role Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ 
                      ...formData, 
                      name, 
                      slug: isNew ? name.toUpperCase().trim().replace(/[^A-Z0-9]/g, "_") : formData.slug 
                    });
                  }}
                  disabled={!isEditing || (role?.isSystemRole && !isNew)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-slug">Slug</Label>
                <code className="block text-xs font-mono bg-muted p-2 rounded border text-muted-foreground">
                  {formData.slug || "AUTO_GENERATED"}
                </code>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>

              {role?.isSystemRole && (
                <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <Info className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-xs text-primary font-medium">
                    This is a system role. Core metadata cannot be modified.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Permissions</span>
                <span className="font-bold text-primary">{selectedPermissions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Categories Covered</span>
                <span className="font-medium">
                  {PERMISSION_CATEGORIES.filter(c => permissionService.getByCategory(c).some(p => selectedPermissions.includes(p.slug))).length} / {PERMISSION_CATEGORIES.length}
                </span>
              </div>
              {errors.permissions && <p className="text-xs text-destructive mt-2">{errors.permissions}</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Permissions Matrix */}
        <div className="lg:col-span-2">
          <div className="dashboard-card overflow-hidden">
            <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Permissions Matrix
              </h3>
              {isEditing && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setSelectedPermissions(allPermissions.map(p => p.slug))}>
                    Select All
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedPermissions([])}>
                    Deselect All
                  </Button>
                </div>
              )}
            </div>
            
            <div className="p-0">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="p-6 space-y-8">
                  {PERMISSION_CATEGORIES.map((category) => {
                    const catPerms = permissionService.getByCategory(category);
                    const isFullySelected = isCategoryFullySelected(category);
                    const isPartiallySelected = isCategoryPartiallySelected(category);

                    return (
                      <div key={category} className="space-y-4">
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleCategory(category)}
                              disabled={!isEditing}
                              className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                                isFullySelected ? "bg-primary border-primary text-white" : 
                                isPartiallySelected ? "bg-primary/20 border-primary text-primary" : "bg-background border-input"
                              } ${!isEditing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              {isFullySelected ? <Check className="h-3 w-3" /> : isPartiallySelected ? <Minus className="h-3 w-3" /> : null}
                            </button>
                            <span className="font-bold text-sm tracking-tight uppercase text-muted-foreground">{category}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] opacity-60">
                            {catPerms.filter(p => selectedPermissions.includes(p.slug)).length} / {catPerms.length}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                          {catPerms.map((perm) => (
                            <div 
                              key={perm.slug} 
                              onClick={() => isEditing && togglePermission(perm.slug)}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                                selectedPermissions.includes(perm.slug) 
                                ? "bg-primary/5 border-primary/20 ring-1 ring-primary/10" 
                                : "bg-background border-border/50 opacity-60"
                              } ${isEditing ? "cursor-pointer hover:border-primary/30" : "cursor-default"}`}
                            >
                              <Checkbox
                                checked={selectedPermissions.includes(perm.slug)}
                                onCheckedChange={() => togglePermission(perm.slug)}
                                onClick={(e) => e.stopPropagation()}
                                disabled={!isEditing}
                                className="mt-0.5"
                              />
                              <div className="space-y-0.5">
                                <p className="text-xs font-semibold leading-none">{perm.name}</p>
                                <p className="text-[10px] text-muted-foreground line-clamp-1">{perm.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Separator className="mt-6 opacity-50" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Role
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role <strong>{role?.name}</strong>? This action cannot be undone and will affect all assigned admins.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default RoleDetails;
