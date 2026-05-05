import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users as UsersIcon,
  Phone,
  Mail,
  ExternalLink,
  Navigation,
  MessageSquare,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Separator } from "@/components/ui/separator";
import { useRental, useUpdateRental, RentalStatusBadge } from "@/features/rentals";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RentalStatus } from "@/features/rentals/types";
import { ROUTES } from "@/constants/routes";

export default function RentalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: rental, isLoading } = useRental(id!);
  const updateMutation = useUpdateRental();

  const [status, setStatus] = useState<RentalStatus>("PENDING");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (rental) {
      setStatus(rental.status);
      setNotes(rental.notes || "");
    }
  }, [rental]);

  const handleUpdate = () => {
    updateMutation.mutate({ id: id!, status, notes });
  };

  const openMapDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${rental!.originLat},${rental!.originLng}&destination=${rental!.destinationLat},${rental!.destinationLng}`;
    window.open(url, "_blank");
  };

  const navigateOrigin = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${rental!.originLat},${rental!.originLng}`;
    window.open(url, "_blank");
  };

  const navigateDestination = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${rental!.destinationLat},${rental!.destinationLng}`;
    window.open(url, "_blank");
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (isLoading) return <FullPageLoader show label="Loading rental inquiry details..." />;
  if (!rental) return <div className="p-8 text-center text-muted-foreground">Inquiry not found.</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Rental Inquiry"
          subtitle={`Reviewing inquiry from ${rental.user?.fullName || "Guest"}`}
          backUrl={ROUTES.RENTALS}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-xl border-border/60 font-semibold h-10 px-4 shadow-sm"
                onClick={handleUpdate}
                disabled={updateMutation.isPending || (status === rental.status && notes === (rental.notes || ""))}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Journey Card */}
            <Card className="shadow-sm border-border/60 overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Journey Route
                    </CardTitle>
                    <CardDescription className="mt-1">Origin and destination details</CardDescription>
                  </div>
                  <RentalStatusBadge status={rental.status} />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Route path */}
                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-blue-500 before:via-border before:to-indigo-500">
                  <div className="relative">
                    <div className="absolute -left-[32px] top-1 h-6 w-6 rounded-full bg-background border-2 border-blue-500 flex items-center justify-center shadow-sm z-10">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Origin</p>
                      <p className="text-sm font-medium leading-relaxed">{rental.originAddress}</p>
                      <button
                        onClick={navigateOrigin}
                        className="mt-1 text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        <Navigation className="h-3 w-3" /> Navigate to origin
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[32px] top-1 h-6 w-6 rounded-full bg-background border-2 border-indigo-500 flex items-center justify-center shadow-sm z-10">
                      <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Destination</p>
                      <p className="text-sm font-medium leading-relaxed">{rental.destinationAddress}</p>
                      <button
                        onClick={navigateDestination}
                        className="mt-1 text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        <Navigation className="h-3 w-3" /> Navigate to destination
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trip Meta + Map Button */}
                <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex gap-6 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium text-foreground">{formatDate(rental.departureDate)}</span>
                      <span className="text-xs">Departure</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium text-foreground">{formatDate(rental.arrivalDate)}</span>
                      <span className="text-xs">Return</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UsersIcon className="h-4 w-4" />
                      <span className="font-medium text-foreground px-2 py-0.5 rounded-md bg-muted">
                        {rental.passengerRange} seats
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 h-9" onClick={openMapDirections}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    View on Maps
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes card (read-only preview if notes exist) */}
            {rental.notes && (
              <Card className="shadow-sm border-border/60">
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    Admin Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-sm italic text-muted-foreground leading-relaxed">
                    "{rental.notes}"
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Card */}
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Requested By</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="flex items-center gap-4 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`${ROUTES.USERS}/${rental.user?.id || rental.userId}`)}
                >
                  <UserAvatar 
                    src={rental.user?.profileUrl} 
                    name={rental.user?.fullName} 
                    className="h-12 w-12 border border-border" 
                  />
                  <div>
                    <p className="font-bold text-sm hover:text-primary transition-colors">
                      {rental.user?.fullName || "Guest User"}
                    </p>
                    <p className="text-xs text-muted-foreground">Tap to view full profile</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-3 text-sm">
                  {/* Phone row */}
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-background border border-border flex items-center justify-center">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">
                        Mobile
                      </p>
                      <a
                        href={`tel:${rental.user?.mobileNumber}`}
                        className="text-sm font-semibold hover:text-primary transition-colors"
                      >
                        {rental.user?.mobileNumber || "N/A"}
                      </a>
                    </div>
                  </div>
                  {/* Email row */}
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-background border border-border flex items-center justify-center mt-0.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">
                        Email
                      </p>
                      <a
                        href={`mailto:${rental.user?.email}`}
                        className="text-sm font-semibold hover:text-primary transition-colors break-all"
                      >
                        {rental.user?.email || "N/A"}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="pt-4 mt-2">
                  <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                    <a href={`tel:${rental.user?.mobileNumber}`}>
                      <Phone className="h-3.5 w-3.5" />
                      Call Customer
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Center */}
            <Card className="shadow-sm border-border/60 bg-muted/10">
              <CardHeader>
                <CardTitle className="text-base font-medium">Review Actions</CardTitle>
                <CardDescription>Update status and add notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
                  <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CALLED">Called (In Contact)</SelectItem>
                      <SelectItem value="QUOTED">Quoted (Estimate Sent)</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed (Booked)</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled (Rejected)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Internal Notes
                  </label>
                  <Textarea
                    className="min-h-[120px] bg-background resize-none focus-visible:ring-primary/20"
                    placeholder="Log call notes, quotation details, or special requests..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full font-bold shadow-sm"
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending || (status === rental.status && notes === (rental.notes || ""))}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
