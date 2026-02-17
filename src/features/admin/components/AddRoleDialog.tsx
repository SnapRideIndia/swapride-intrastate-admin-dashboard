import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Role } from "@/types";
import { roleService } from "@/features/admin";
import { permissionService, PERMISSION_CATEGORIES } from "@/features/admin";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronRight, Loader2, Check, Minus } from "lucide-react";
import { useCreateRole, useUpdateRole } from "../hooks/useRoleQueries";

interface AddRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editRole?: Role | null;
}

export function AddRoleDialog({ open, onOpenChange, onSuccess, editRole }: AddRoleDialogProps) {
  const { toast } = useToast();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Tanstack Query hooks
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const allPermissions = permissionService.getAll();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isSystemRole: false,
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadRoleData = async () => {
      if (editRole) {
        setFormData({
          name: editRole.name,
          slug: editRole.slug,
          description: editRole.description,
          isSystemRole: editRole.isSystemRole,
        });
        const perms = await roleService.getRolePermissions(editRole.id);
        setSelectedPermissions(perms);
      } else {
        resetForm();
      }
    };

    if (open) {
      loadRoleData();
    }
  }, [editRole, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[A-Z_]+$/.test(formData.slug)) {
      newErrors.slug = "Slug must be uppercase with underscores only";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (selectedPermissions.length === 0) {
      newErrors.permissions = "At least one permission is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editRole) {
        await updateMutation.mutateAsync({
          id: editRole.id,
          data: { ...formData, permissions: selectedPermissions },
        });
        toast({ title: "Role updated successfully" });
      } else {
        await createMutation.mutateAsync({
          ...formData,
          permissions: selectedPermissions,
        });
        toast({ title: "Role created successfully" });
      }
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch {
      toast({ title: "Error saving role", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      isSystemRole: false,
    });
    setSelectedPermissions([]);
    setErrors({});
    setExpandedCategories([]);
  };

  const generateSlug = (name: string) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const getCategoryPermissions = (category: string) => {
    return allPermissions.filter((p) => p.category === category);
  };

  const isCategoryFullySelected = (category: string) => {
    const catPerms = getCategoryPermissions(category);
    return catPerms.every((p) => selectedPermissions.includes(p.id));
  };

  const isCategoryPartiallySelected = (category: string) => {
    const catPerms = getCategoryPermissions(category);
    const selected = catPerms.filter((p) => selectedPermissions.includes(p.id));
    return selected.length > 0 && selected.length < catPerms.length;
  };

  const toggleCategoryPermissions = (category: string) => {
    const catPerms = getCategoryPermissions(category);
    const catPermIds = catPerms.map((p) => p.id);

    if (isCategoryFullySelected(category)) {
      setSelectedPermissions((prev) => prev.filter((id) => !catPermIds.includes(id)));
    } else {
      setSelectedPermissions((prev) => {
        const newPerms = new Set([...prev, ...catPermIds]);
        return Array.from(newPerms);
      });
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId],
    );
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(allPermissions.map((p) => p.id));
  };

  const deselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editRole ? "Edit Role" : "Create New Role"}</DialogTitle>
          <DialogDescription>
            {editRole ? "Update role details and permissions" : "Define a new role with specific permissions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name *</Label>
                <Input
                  id="role-name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Operations Manager"
                  className={errors.name ? "border-destructive" : ""}
                  disabled={editRole?.isSystemRole || isLoading}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-slug">Slug *</Label>
                <Input
                  id="role-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toUpperCase() })}
                  placeholder="e.g., OPERATIONS_MANAGER"
                  className={errors.slug ? "border-destructive" : ""}
                  disabled={editRole?.isSystemRole || isLoading}
                />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-description">Description *</Label>
              <Textarea
                id="role-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this role can do..."
                rows={2}
                className={errors.description ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
          </div>

          {/* Permissions Section */}
          <div className="flex-1 overflow-hidden flex flex-col border rounded-lg">
            <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
              <div>
                <p className="font-medium">Permissions</p>
                <p className="text-xs text-muted-foreground">
                  {selectedPermissions.length} of {allPermissions.length} selected
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAllPermissions} disabled={isLoading}>
                  Select All
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={deselectAllPermissions} disabled={isLoading}>
                  Deselect All
                </Button>
              </div>
            </div>
            {errors.permissions && <p className="text-xs text-destructive px-3 pt-2">{errors.permissions}</p>}

            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {PERMISSION_CATEGORIES.map((category) => {
                  const categoryPerms = getCategoryPermissions(category);
                  const isExpanded = expandedCategories.includes(category);
                  const isFullySelected = isCategoryFullySelected(category);
                  const isPartiallySelected = isCategoryPartiallySelected(category);

                  return (
                    <Collapsible key={category} open={isExpanded} onOpenChange={() => toggleCategory(category)}>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategoryPermissions(category);
                          }}
                          className="flex items-center justify-center h-5 w-5 rounded border bg-background"
                        >
                          {isFullySelected ? (
                            <Check className="h-3 w-3" />
                          ) : isPartiallySelected ? (
                            <Minus className="h-3 w-3" />
                          ) : null}
                        </button>
                        <CollapsibleTrigger asChild>
                          <button
                            type="button"
                            className="flex-1 flex items-center justify-between text-left"
                            disabled={isLoading}
                          >
                            <span className="font-medium text-sm">{category}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {categoryPerms.filter((p) => selectedPermissions.includes(p.id)).length}/
                                {categoryPerms.length}
                              </span>
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </div>
                          </button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent>
                        <div className="pl-8 py-2 space-y-2">
                          {categoryPerms.map((permission) => (
                            <div key={permission.id} className="flex items-start gap-2">
                              <Checkbox
                                id={permission.id}
                                checked={selectedPermissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                                disabled={isLoading}
                              />
                              <label htmlFor={permission.id} className="text-sm cursor-pointer flex-1">
                                <span className="font-medium">{permission.name}</span>
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                              </label>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editRole ? "Update Role" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
