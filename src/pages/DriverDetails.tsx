import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  User,
  Phone,
  Ban,
  CreditCard,
  Activity,
  FileText,
  Star,
  Bus as BusIcon,
  Calendar,
  ExternalLink,
  MessageSquare,
  Trash2,
  Loader2,
  Camera,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  useDriver,
  useDeleteDriver,
  useUpdateDriverPhoto,
  useDriverRatings,
  EditDriverDialog,
} from "@/features/drivers";
import { Driver, Trip, DriverRatingTag } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { TablePagination } from "@/components/ui/table-pagination";
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
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { tripsApi } from "@/features/trips/api/trips-api";

const safeFormatDate = (date: string | Date | null | undefined, formatStr: string, fallback = "N/A") => {
  if (!date) return fallback;
  const d = new Date(date);
  if (isNaN(d.getTime())) return fallback;
  return format(d, formatStr);
};

const DriverDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: driver, isLoading: isDriverLoading, refetch } = useDriver(id || "");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const uploadPhotoMutation = useUpdateDriverPhoto(id || "");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return;
    }
    uploadPhotoMutation.mutate(file, {
      onSuccess: () => refetch(),
    });
    e.target.value = "";
  };

  const [tripsPage, setTripsPage] = useState(1);
  const [tripsPageSize, setTripsPageSize] = useState(5);

  const [ratingsPage, setRatingsPage] = useState(1);
  const ratingsPageSize = 5;

  const { data: tripsData = { data: [], total: 0 }, isLoading: isTripsLoading } = useQuery({
    queryKey: ["driver-trips", id, tripsPage, tripsPageSize],
    queryFn: () =>
      tripsApi.getAll({
        driverId: id,
        limit: tripsPageSize,
        offset: (tripsPage - 1) * tripsPageSize,
      }),
    enabled: !!id,
  });

  const { data: ratingsData = { data: [], total: 0 } } = useDriverRatings(id || "", {
    limit: ratingsPageSize,
    offset: (ratingsPage - 1) * ratingsPageSize,
  });

  const paginatedTrips = tripsData.data;
  const totalTripsCount = tripsData.total;

  const deleteMutation = useDeleteDriver();

  const handleDelete = async () => {
    if (!driver) return;
    deleteMutation.mutate(driver.id, {
      onSuccess: () => {
        navigate(ROUTES.DRIVERS);
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "AVAILABLE":
        return <Badge className="bg-success hover:bg-success/90">Available</Badge>;
      case "ON_TRIP":
        return <Badge className="bg-primary hover:bg-primary/90">On Trip</Badge>;
      case "OFF_DUTY":
        return <Badge variant="secondary">Off Duty</Badge>;
      case "ON_LEAVE":
        return (
          <Badge variant="outline" className="border-warning text-warning">
            On Leave
          </Badge>
        );
      case "BLOCKED":
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isDriverLoading) {
    return <FullPageLoader show={true} label="Fetching driver details..." />;
  }

  if (!driver) return null;

  return (
    <DashboardLayout>
      <FullPageLoader show={deleteMutation.isPending} label="Deleting driver..." />

      <PageHeader title="Driver Details" subtitle={`Viewing profile of ${driver.name}`} backUrl={ROUTES.DRIVERS} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Driver Profile & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card className="shadow-sm border-border/60 overflow-hidden">
            <CardContent className="p-0">
              <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/60 relative">
                <div className="absolute -bottom-12 left-8">
                  {/* Hidden file input for photo upload */}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  {/* Clickable Avatar with camera overlay */}
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => photoInputRef.current?.click()}
                    title="Click to update profile photo"
                  >
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                      <AvatarImage src={driver.profileUrl || ""} />
                      <AvatarFallback className="text-2xl bg-muted text-muted-foreground uppercase">
                        {driver.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Upload overlay */}
                    <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadPhotoMutation.isPending ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-16 px-8 pb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      {driver.name}
                      {getStatusBadge(driver.status)}
                    </h2>
                    <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                      Driver ID: <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{driver.id}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                      Edit Profile
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" /> Personal Information
                    </h3>
                    <div className="space-y-3 pl-6 border-l-2 border-border/60">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-tight">Mobile Number</p>
                        <p className="font-medium text-sm">{driver.mobileNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-tight">License Number</p>
                        <p className="font-medium text-sm">{driver.licenseNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-tight">Rating</p>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm">{driver.rating || "N/A"}</span>
                          {driver.rating && <Star className="h-3.5 w-3.5 fill-warning text-warning" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Activity className="h-4 w-4" /> Performance Metrics
                    </h3>
                    <div className="space-y-3 pl-6 border-l-2 border-border/60">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-tight">Total Trips</p>
                        <p className="font-medium text-sm">{driver.totalTrips || 0} Trips</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-tight">Last Login</p>
                        <p className="font-medium text-sm">{safeFormatDate(driver.lastLogin, "PPP p", "Never")}</p>
                      </div>
                      {driver.assignedBus && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-tight">Current Assigned Bus</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="font-mono text-xs py-0">
                              {driver.assignedBus.busNumber}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{driver.assignedBus.model}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Trips Table */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Recent Trip Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/60">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Route</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b border-border/60">
                        Bus
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b border-border/60">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {isTripsLoading ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span>Fetching recent trips...</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedTrips.length > 0 ? (
                      paginatedTrips.map((trip: Trip) => (
                        <tr key={trip.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                            {safeFormatDate(trip.tripDate || (trip as any).date, "MMM d, yyyy")}
                          </td>
                          <td className="py-3 px-4 font-medium">{trip.route?.routeName || (trip as any).routeName}</td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                              {trip.bus?.busNumber || (trip as any).busNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">
                              {trip.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No recent trips found for this driver.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-2 border-t border-border/60">
                <TablePagination
                  currentPage={tripsPage}
                  totalCount={totalTripsCount}
                  pageSize={tripsPageSize}
                  onPageChange={setTripsPage}
                  onPageSizeChange={(size) => {
                    setTripsPageSize(size);
                    setTripsPage(1);
                  }}
                />
              </div>
              {driver.trips && driver.trips.length > tripsPageSize && (
                <div className="py-2 text-center">
                  <Button variant="link" size="sm" onClick={() => navigate(`${ROUTES.TRIPS}?driverId=${driver.id}`)}>
                    View All Trips (Deep Link)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ratings Card */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-warning" />
                Ratings & Reviews
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {ratingsData.total} review{ratingsData.total !== 1 ? "s" : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {ratingsData.data.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">No reviews yet.</div>
              ) : (
                <div className="space-y-4">
                  {ratingsData.data.map((r) => {
                    const positiveTags = [
                      DriverRatingTag.PUNCTUAL,
                      DriverRatingTag.SAFE_DRIVING,
                      DriverRatingTag.SMOOTH_RIDE,
                      DriverRatingTag.FRIENDLY,
                      DriverRatingTag.HELPFUL,
                      DriverRatingTag.PROFESSIONAL,
                      DriverRatingTag.CLEAN_BUS,
                      DriverRatingTag.GOOD_COMMUNICATION,
                    ];
                    return (
                      <div key={r.id} className="p-4 rounded-lg bg-muted/20 border border-border/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-4 w-4 ${
                                  s <= r.rating ? "fill-warning text-warning" : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {safeFormatDate(r.createdAt, "dd MMM yyyy")}
                          </span>
                        </div>
                        {r.user && (
                          <p className="text-xs text-muted-foreground">
                            by <span className="font-medium text-foreground">{r.user.fullName}</span>
                          </p>
                        )}
                        {r.comment && <p className="text-sm text-foreground/80 italic">"{r.comment}"</p>}
                        {r.tags && r.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {r.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className={`text-[10px] py-0 px-2 ${
                                  positiveTags.includes(tag)
                                    ? "border-success/40 text-success bg-success/10"
                                    : "border-destructive/40 text-destructive bg-destructive/10"
                                }`}
                              >
                                {tag.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {ratingsData.total > ratingsPageSize && (
                <div className="mt-4">
                  <TablePagination
                    currentPage={ratingsPage}
                    totalCount={ratingsData.total}
                    pageSize={ratingsPageSize}
                    onPageChange={setRatingsPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Documents & Actions */}
        <div className="space-y-6">
          {/* Document Section */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-semibold">Verification Documents</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 rounded-lg bg-muted/20 border border-border/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Driving License</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{driver.licenseNumber}</p>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground hover:bg-success/90 text-[9px] py-0">
                    Verified
                  </Badge>
                </div>

                {driver.licenseAttachment ? (
                  <div
                    className="relative group cursor-pointer overflow-hidden rounded-md border border-border/40 aspect-[4/3] bg-muted/30 flex items-center justify-center"
                    onClick={() => window.open(driver.licenseAttachment?.url, "_blank")}
                  >
                    <img
                      src={driver.licenseAttachment.url}
                      alt="License"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm" className="h-8 shadow-lg">
                        <ExternalLink className="h-3.5 w-3.5 mr-2" /> View Original
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-border/60 bg-muted/10 text-muted-foreground">
                    <FileText className="h-6 w-6 opacity-20 mb-1" />
                    <p className="text-[10px]">No attachment provided</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Actions */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <Button
                className="w-full justify-start gap-3"
                variant="outline"
                onClick={() => window.open(`tel:${driver.mobileNumber}`)}
              >
                <Phone className="h-4 w-4 text-green-600" />
                Call Driver
              </Button>
              <Button className="w-full justify-start gap-3" variant="outline" disabled>
                <MessageSquare className="h-4 w-4 text-blue-600" />
                Message Driver
              </Button>
              <Button
                className="w-full justify-start gap-3 text-destructive border-destructive/20 hover:bg-destructive/5"
                variant="outline"
                onClick={() => setIsDeleteAlertOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditDriverDialog
        driver={driver}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onDriverUpdated={() => refetch()}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the driver profile for{" "}
              <span className="font-semibold text-foreground">{driver.name}</span> and remove their data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Driver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default DriverDetails;
