import { User, Bell, Shield, Database, Key } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers/AuthContext";
import { useState, useEffect } from "react";
import { apiClient } from "@/api/api-client";
import { FullPageLoader } from "@/components/ui/full-page-loader";

const Settings = () => {
  const { user } = useAuth();
  const [rawUserData, setRawUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRawUserData = async () => {
      try {
        const response = await apiClient.get("/admin/me");
        console.log("User Profile Response:", response.data);
        setRawUserData(response.data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRawUserData();
  }, []);

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Loading settings..." />
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

        <TabsContent value="profile">
          <div className="space-y-6">
            {/* Profile Information Card */}
            <div className="dashboard-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user?.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue={user?.roleName || user?.roleSlug} disabled />
                </div>
              </div>
            </div>

            {/* Account Details Card */}
            <div className="dashboard-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Account Details</h3>
              {rawUserData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Account ID</Label>
                    <Input value={rawUserData.id} disabled className="font-mono text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <Input
                      value={rawUserData.createdAt ? new Date(rawUserData.createdAt).toLocaleDateString() : "N/A"}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <Input
                      value={rawUserData.updatedAt ? new Date(rawUserData.updatedAt).toLocaleDateString() : "N/A"}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Login</Label>
                    <Input
                      value={rawUserData.lastLogin ? new Date(rawUserData.lastLogin).toLocaleString() : "Never"}
                      disabled
                    />
                  </div>
                </div>
              ) : null}
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div></div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
              <Button>Update Password</Button>

              <Separator className="my-6" />

              <div>
                <h4 className="text-sm font-medium mb-4">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable 2FA</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
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
            {/* Role Information Card */}
            <div className="dashboard-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Role Information</h3>
              {rawUserData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Role</p>
                      <p className="text-lg font-semibold text-foreground mt-1">
                        {rawUserData.role?.name || "No Role Assigned"}
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {rawUserData.role?.name === "SUPER_ADMIN" ? "Full Access" : "Limited Access"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Role ID</p>
                      <p className="text-sm font-mono mt-1 truncate">{rawUserData.roleId || "N/A"}</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Last Login</p>
                      <p className="text-sm mt-1">
                        {rawUserData.lastLogin ? new Date(rawUserData.lastLogin).toLocaleString() : "N/A"}
                      </p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Permissions</p>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {rawUserData.role?.rolePermissions?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Permissions Card */}
            <div className="dashboard-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Your Permissions</h3>
                {rawUserData?.role?.rolePermissions?.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {rawUserData.role.rolePermissions.length} permission
                    {rawUserData.role.rolePermissions.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {rawUserData ? (
                rawUserData.role?.rolePermissions?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rawUserData.role.rolePermissions.map((rp: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {rp.permission?.slug || "UNKNOWN"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {rp.permission?.description || "No description available"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-lg">
                    <Shield className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-foreground">No Permissions Assigned</p>
                    <p className="text-xs text-muted-foreground mt-1">Contact your administrator to request access</p>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
