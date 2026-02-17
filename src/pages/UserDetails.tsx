import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { User, Phone, Mail, Ban, CheckCircle, CreditCard, Activity, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { userService } from "@/features/users";
import { User as UserType } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUser = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await userService.getById(id);
      setUser(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user details.",
        variant: "destructive",
      });
      navigate(ROUTES.USERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleBlockUser = async () => {
    if (!id) return;
    try {
      setIsActionLoading(true);
      await userService.blockUser(id);
      await fetchUser();
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

  const handleUnblockUser = async () => {
    if (!id) return;
    try {
      setIsActionLoading(true);
      await userService.unblockUser(id);
      await fetchUser();
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
        return <Badge className="bg-success hover:bg-success/90">Active</Badge>;
      case "BLOCKED":
        return <Badge variant="destructive">Blocked</Badge>;
      case "SUSPENDED":
        return (
          <Badge variant="secondary" className="bg-warning text-warning-foreground hover:bg-warning/90">
            Suspended
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <FullPageLoader show={true} label="Fetching user details..." />;
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <FullPageLoader show={isActionLoading} label="Processing..." />

      <PageHeader title="User Details" subtitle="View and manage user information" backUrl={ROUTES.USERS} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - User Profile & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Card */}
          <Card className="shadow-sm border-border/60 overflow-hidden">
            <CardContent className="p-0">
              <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/60 relative">
                <div className="absolute -bottom-12 left-8">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={user.profileUrl || ""} />
                    <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
                      {user.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="pt-16 px-8 pb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      {user.fullName}
                      {getStatusBadge(user.status)}
                    </h2>
                    <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                      User ID: <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{user.id}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(user.status || "").toUpperCase() === "ACTIVE" ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10 border-destructive/20"
                          >
                            <Ban className="h-4 w-4 mr-2" /> Block User
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will prevent the user from accessing their account and making bookings.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleBlockUser}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes, Block User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button
                        variant="outline"
                        className="text-success hover:bg-success/10 border-success/20"
                        onClick={handleUnblockUser}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Unblock User
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" /> Personal Information
                    </h3>
                    <div className="space-y-3 pl-6 border-l-2 border-border/60">
                      <div>
                        <p className="text-xs text-muted-foreground">Email Address</p>
                        <p className="font-medium text-sm">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Mobile Number</p>
                        <p className="font-medium text-sm">{user.mobileNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Blood Group</p>
                        <p className="font-medium text-sm">{user.bloodGroup || "Not Provided"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date of Birth</p>
                        <p className="font-medium text-sm">
                          {user.dob ? new Date(user.dob).toLocaleDateString() : "Not Provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Activity className="h-4 w-4" /> Account Activity
                    </h3>
                    <div className="space-y-3 pl-6 border-l-2 border-border/60">
                      <div>
                        <p className="text-xs text-muted-foreground">Member Since</p>
                        <p className="font-medium text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Booking</p>
                        <p className="font-medium text-sm">
                          {user.lastBookingDate ? new Date(user.lastBookingDate).toLocaleDateString() : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-sm border-border/60 bg-muted/10">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold">₹{(user.totalAmountSpent || 0).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border/60 bg-muted/10">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-xl font-bold">{user.totalBookings || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar - Quick Actions & Emergency */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => window.open(`mailto:${user.email}`)}>
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send Email</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => window.open(`tel:${user.mobileNumber}`)}>
                      <Phone className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Call User</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetails;
