import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AdminUser } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Camera } from "lucide-react";
import { useCreateAdmin, useUpdateAdmin } from "../hooks/useAdminQueries";
import { useRoles } from "../hooks/useRoleQueries";
import { UserAvatar } from "@/components/common/UserAvatar";
import { createAdminSchema, updateAdminSchema, CreateAdminFormData } from "../schemas/admin.schema";

interface AddAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editAdmin?: AdminUser | null;
}

export function AddAdminDialog({ open, onOpenChange, onSuccess, editAdmin }: AddAdminDialogProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Tanstack Query hooks
  const { data: rolesData, isLoading: loadingRoles } = useRoles();
  const roles = rolesData?.data || [];
  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const form = useForm<CreateAdminFormData>({
    resolver: zodResolver(editAdmin ? updateAdminSchema : createAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      roleId: "",
      status: "Active",
      department: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (editAdmin && open) {
      form.reset({
        name: editAdmin.name || "",
        email: editAdmin.email || "",
        phone: editAdmin.phone || "",
        roleId: editAdmin.roleId || "",
        status: (editAdmin.status as any) || "Active",
        department: editAdmin.department || "",
        password: "",
        confirmPassword: "",
      });
      setPreviewUrl(editAdmin.profilePicture || "");
    } else if (!open) {
      form.reset();
      setSelectedFile(null);
      if (previewUrl && !editAdmin?.profilePicture) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  }, [editAdmin, open, form]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: CreateAdminFormData) => {
    try {
      const payload = new FormData();
      payload.append("fullName", data.name);
      payload.append("email", data.email);
      payload.append("phone", data.phone);
      payload.append("roleId", data.roleId);
      payload.append("status", data.status);
      payload.append("department", data.department || "");

      if (selectedFile) {
        payload.append("profile_picture", selectedFile);
      }

      if (editAdmin) {
        await updateMutation.mutateAsync({
          id: editAdmin.id,
          data: payload,
        });
        toast({ title: "Admin updated successfully" });
      } else {
        payload.append("password", data.password || "");
        await createMutation.mutateAsync(payload);
        toast({ title: "Admin created successfully" });
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({ title: "Error saving admin", variant: "destructive" });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editAdmin ? "Edit Admin" : "Add New Admin"}</DialogTitle>
          <DialogDescription>
            {editAdmin ? "Update admin information" : "Create a new admin account with role-based access"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="relative group">
                <UserAvatar
                  src={previewUrl}
                  name={form.watch("name")}
                  className="h-24 w-24 border-2 border-border shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleImageClick}
                  disabled={isLoading}
                  className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                >
                  <Camera className="h-3 w-3" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Admin Profile Picture
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...field}
                        disabled={isLoading || !!editAdmin}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 98765 43210" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || loadingRoles}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingRoles ? "Loading roles..." : "Select a role"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Operations, Finance" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!editAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            className="pr-10"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Min 8 chars, 1 uppercase, 1 number, 1 special char
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password *</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            className="pr-10"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}


            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editAdmin ? "Update Admin" : "Create Admin"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
