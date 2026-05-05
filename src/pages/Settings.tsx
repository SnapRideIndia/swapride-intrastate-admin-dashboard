import { User, Bell, Shield, Database, Key, Camera, Eye, EyeOff, Search } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers/AuthContext";
import { useUserProfile } from "@/features/users/hooks/useUsers";
import { useUpdateMe } from "@/features/admin/hooks/useAdminQueries";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState, useMemo } from "react";
import { adminService } from "@/features/admin";
import { AccessDenied } from "@/components/AccessDenied";
import { useApiError } from "@/hooks/useApiError";

const Settings = () => {
  const { user } = useAuth();
  const { data: rawUserData, isLoading: isProfileLoading, error: profileError } = useUserProfile();
  const updateMeMutation = useUpdateMe();
  const { isAccessDenied } = useApiError(profileError);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    department: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [permissionSearch, setPermissionSearch] = useState("");

  const groupedPermissions = useMemo(() => {
    if (!rawUserData?.role?.rolePermissions) return {};
    
    const filtered = rawUserData.role.rolePermissions.filter((rp: any) => {
      if (!permissionSearch) return true;
      const search = permissionSearch.toLowerCase();
      const slug = (rp.permission?.slug || "").toLowerCase();
      const desc = (rp.permission?.description || "").toLowerCase();
      return slug.includes(search) || desc.includes(search);
    });

    return filtered.reduce((acc: Record<string, any[]>, rp: any) => {
      const slug = rp.permission?.slug || "OTHER";
      const parts = slug.split("_");
      const category = parts[0] || "OTHER";
      
      if (!acc[category]) acc[category] = [];
      acc[category].push(rp);
      return acc;
    }, {});
  }, [rawUserData?.role?.rolePermissions, permissionSearch]);

  const isLoading = isProfileLoading;

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append("profile_picture", file);

      // Update admin profile - backend handles S3 upload
      await updateMeMutation.mutateAsync(formData);

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as { message?: string }).message || "Failed to update profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
 
  const startEditing = () => {
    setProfileForm({
      fullName: rawUserData?.fullName || user?.name || "",
      phone: rawUserData?.phone || "",
      department: rawUserData?.department || "Operations",
    });
    setIsEditingProfile(true);
  };

  const handleProfileUpdate = async () => {
    try {
      await updateMeMutation.mutateAsync(profileForm);
      toast({ title: "Profile updated successfully" });
      setIsEditingProfile(false);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { message?: string }).message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    try {
      setIsChangingPassword(true);
      await adminService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast({ title: "Password updated successfully" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { message?: string }).message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isAccessDenied) {
    return (
      <DashboardLayout>
        <AccessDenied variant="page" section="Settings" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FullPageLoader 
        show={isLoading || updateMeMutation.isPending || isUploading || isChangingPassword} 
        label={isUploading ? "Uploading image..." : updateMeMutation.isPending ? "Updating profile..." : isChangingPassword ? "Changing password..." : "Loading settings..."} 
      />
      <PageHeader title="Settings" subtitle="Manage your account and application settings" />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Avatar & Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              <div className="dashboard-card p-8 flex flex-col items-center text-center">
                <div className="relative group">
                  <UserAvatar 
                    src={rawUserData?.profilePicture || user?.profilePicture} 
                    name={user?.name} 
                    className="h-32 w-32 border-4 border-background shadow-xl"
                    fallbackClassName="text-3xl"
                  />
                  <button
                    onClick={handleImageClick}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:scale-100"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <h2 className="mt-4 text-xl font-bold text-foreground">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.roleName || user?.roleSlug}</p>
                <div className="mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {rawUserData?.status || "Active"}
                </div>

                <div className="w-full mt-8 pt-6 border-t border-border space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={handleImageClick}>
                    <Camera className="h-4 w-4" /> Change Photo
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="dashboard-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-foreground">Personal Information</h3>
                  {!isEditingProfile ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                      onClick={startEditing}
                    >
                      Edit Details
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleProfileUpdate} disabled={updateMeMutation.isPending}>
                        Save
                      </Button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</Label>
                    {isEditingProfile ? (
                      <Input
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="h-8"
                      />
                    ) : (
                      <p className="text-sm font-medium border-b pb-1 border-border/50">{rawUserData?.fullName || user?.name || "N/A"}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email Address</Label>
                    <p className="text-sm font-medium border-b pb-1 border-border/50 opacity-70 cursor-not-allowed">{user?.email || "N/A"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Phone Number</Label>
                    {isEditingProfile ? (
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="h-8"
                      />
                    ) : (
                      <p className="text-sm font-medium border-b pb-1 border-border/50">{rawUserData?.phone || "N/A"}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Department</Label>
                    {isEditingProfile ? (
                      <Input
                        value={profileForm.department}
                        onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                        className="h-8"
                      />
                    ) : (
                      <p className="text-sm font-medium border-b pb-1 border-border/50">
                        {rawUserData?.department || "Operations"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Designation</Label>
                    <p className="text-sm font-medium border-b pb-1 border-border/50 opacity-70 cursor-not-allowed">
                      {user?.roleName || user?.roleSlug}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="dashboard-card p-6">
                <h3 className="text-base font-bold text-foreground mb-6">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Account ID</Label>
                    <p className="text-xs font-mono bg-muted/50 p-2 rounded border border-border/50">
                      {rawUserData?.id || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Account Created</Label>
                    <p className="text-sm font-medium">{formatDate(rawUserData?.createdAt)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Last Login</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-sm font-medium">{formatDateTime(rawUserData?.lastLogin)}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Last Profile Update</Label>
                    <p className="text-sm font-medium">{formatDate(rawUserData?.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="dashboard-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Notification Preferences</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive email updates for important events</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">New Ticket Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified when new support tickets are created</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Payment Alerts</p>
                  <p className="text-xs text-muted-foreground">Notifications for payment issues and failures</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Bus Delay Alerts</p>
                  <p className="text-xs text-muted-foreground">Get alerted when buses are running late</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Daily Summary</p>
                  <p className="text-xs text-muted-foreground">Receive a daily summary of operations</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="dashboard-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Security Settings</h3>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div></div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      placeholder="Enter new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      placeholder="Confirm new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={isChangingPassword}>
                Update Password
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <div className="dashboard-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">System Configuration</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue="Telangana Shuttle Services" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" type="email" defaultValue="support@shuttleservice.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-phone">Support Phone</Label>
                  <Input id="support-phone" defaultValue="1800-XXX-XXXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="Asia/Kolkata (IST)" disabled />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-4">Data Management</h4>
                <div className="flex gap-3">
                  <Button variant="outline">Export Data</Button>
                  <Button variant="outline">Backup Database</Button>
                </div>
              </div>

              <div className="mt-6">
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="space-y-6">
            {/* Compact Role Information Header */}
            <div className="dashboard-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {rawUserData?.role?.name || "No Role Assigned"}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      {rawUserData?.roleId || "N/A"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{rawUserData?.role?.rolePermissions?.length || 0} Permissions</span>
                  </div>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                {rawUserData?.role?.name === "SUPER_ADMIN" ? "Unrestricted System Access" : "Role-Based Access"}
              </div>
            </div>

            {/* Permissions Explorer */}
            <div className="dashboard-card overflow-hidden">
              <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/20">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Permission Explorer</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Browse capabilities assigned to your role</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search permissions..." 
                    className="pl-9 h-9 text-xs"
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-0">
                {rawUserData ? (
                  Object.keys(groupedPermissions).length > 0 ? (
                    <div className="divide-y divide-border max-h-[600px] overflow-y-auto custom-scrollbar">
                      {Object.entries(groupedPermissions).map(([category, perms]: [string, any[]]) => (
                        <div key={category} className="p-4 hover:bg-muted/5 transition-colors">
                          <h4 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                            {category}
                            <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] text-muted-foreground font-medium">
                              {perms.length}
                            </span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                            {perms.map((rp: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 py-1 group">
                                <div className="mt-1.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[13px] font-semibold text-foreground leading-none mb-1">
                                    {rp.permission?.slug || "UNKNOWN"}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 pr-2">
                                    {rp.permission?.description || "No description available"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Search className="h-5 w-5 text-muted-foreground/60" />
                      </div>
                      <p className="text-sm font-medium text-foreground">No permissions found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {permissionSearch ? "Try adjusting your search terms" : "Your role does not have any assigned permissions."}
                      </p>
                      {permissionSearch && (
                        <Button variant="link" size="sm" onClick={() => setPermissionSearch("")} className="mt-2 text-xs">
                          Clear Search
                        </Button>
                      )}
                    </div>
                  )
                ) : (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
