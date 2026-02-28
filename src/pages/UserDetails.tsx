import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  User,
  Phone,
  Mail,
  Ban,
  CheckCircle,
  CreditCard,
  Activity,
  MapPin,
  Share2,
  UserPlus,
  Calendar,
  Clock,
  User as GenderIcon,
  History,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
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

import { useUser, useUpdateUserStatus } from "@/features/users/hooks/useUsers";

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userIdCopied, setUserIdCopied] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);

  const { data: user, isLoading, error } = useUser(id || "");
  const updateUserStatus = useUpdateUserStatus();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user details.",
        variant: "destructive",
      });
      navigate(ROUTES.USERS);
    }
  }, [error, navigate]);

  const handleStatusChange = async (action: "block" | "unblock" | "suspend") => {
    if (!id) return;
    updateUserStatus.mutate({ id, action });
  };

  const copyToClipboard = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setUserIdCopied(true);
    setTimeout(() => setUserIdCopied(false), 2000);
    toast({
      title: "Copied",
      description: "User ID copied to clipboard",
    });
  };

  const copyReferralCode = () => {
    if (!user?.referralCode) return;
    navigator.clipboard.writeText(user.referralCode);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Referral code copied to clipboard",
    });
  };

  const handleShare = async () => {
    if (!user?.referralCode) return;
    const shareText = `Use my referral code ${user.referralCode} to join SwapRide!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "SwapRide Referral",
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      copyReferralCode();
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
          <Badge variant="secondary" className="bg-warning/15 text-warning hover:bg-warning/20 border-warning/20">
            Suspended
          </Badge>
        );
      case "DELETION_PENDING":
        return (
          <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5 animate-pulse">
            Deletion Pending
          </Badge>
        );
      case "DELETED":
        return (
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 bg-muted/20">
            Deleted (Retired)
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
      <FullPageLoader show={updateUserStatus.isPending} label="Processing..." />

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
                    <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1 px-1">
                      User ID:{" "}
                      <span className="font-mono text-[10px] bg-muted px-1.5 py-0.4 rounded flex items-center gap-1.5 border border-border/40 group/id relative">
                        {user.id}
                        <button
                          onClick={copyToClipboard}
                          className="hover:text-primary transition-colors p-0.5 rounded hover:bg-primary/5"
                          title="Copy ID"
                        >
                          {userIdCopied ? (
                            <Check className="h-3 w-3 text-success animate-in zoom-in duration-300" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-60 group-hover/id:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </span>
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
                              onClick={() => handleStatusChange("block")}
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
                        onClick={() => handleStatusChange("unblock")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Unblock User
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                      <User className="h-3.5 w-3.5" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 pl-4 border-l-2 border-primary/20">
                      <div className="col-span-2">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">Email Address</p>
                        <p className="font-semibold text-sm truncate">{user.email}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">Mobile Number</p>
                        <p className="font-semibold text-sm">{user.mobileNumber}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">Referral Code</p>
                        <div className="flex items-center gap-2">
                          <code
                            onClick={copyReferralCode}
                            className="bg-primary/5 text-primary px-1.5 py-0.5 rounded text-xs font-bold border border-primary/10 tracking-wider cursor-pointer hover:bg-primary/10 transition-all flex items-center gap-1.5"
                          >
                            {user.referralCode || "NONE"}
                            {referralCopied ? (
                              <Check className="h-2.5 w-2.5 text-success" />
                            ) : (
                              <Copy className="h-2.5 w-2.5 opacity-40" />
                            )}
                          </code>
                          {user.referralCode && (
                            <button
                              onClick={handleShare}
                              className="p-1 rounded-full hover:bg-primary/5 transition-colors"
                            >
                              <Share2 className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">Gender</p>
                        <p className="font-semibold text-sm flex items-center gap-1.5">
                          <GenderIcon className="h-3 w-3 text-muted-foreground/70" />
                          {user.gender || "Not Provided"}
                        </p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">Blood Group</p>
                        <p className="font-semibold text-sm">{user.bloodGroup || "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">Date of Birth</p>
                        <p className="font-semibold text-sm flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                          {user.dateOfBirth
                            ? new Date(user.dateOfBirth).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Not Provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5" /> Account Activity
                    </h3>
                    <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                      <div className="flex justify-between items-center group">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                            Member Since
                          </p>
                          <p className="font-semibold text-sm">
                            {new Date(user.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <Clock className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
                      </div>
                      <div className="flex justify-between items-center group">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">Last Login</p>
                          <p className="font-semibold text-sm">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Never"}
                          </p>
                        </div>
                        <History className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
                      </div>
                      <div className="flex justify-between items-center group">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">
                            Last Booking
                          </p>
                          <p className="font-semibold text-sm">
                            {user.lastBookingDate
                              ? new Date(user.lastBookingDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : "No Bookings"}
                          </p>
                        </div>
                        <CheckCircle className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
                      </div>

                      {user.referredById && (
                        <div className="pt-2">
                          <Link
                            to={`${ROUTES.USERS}/${user.referredById}`}
                            className="inline-flex items-center gap-2 group/link text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-lg border border-primary/10 transition-all"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            Show Referred By
                            <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      )}
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
