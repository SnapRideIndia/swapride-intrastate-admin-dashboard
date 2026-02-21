import { useNavigate, useParams } from "react-router-dom";
import { useSuggestion, useUpdateSuggestion } from "@/features/suggestions/hooks/useSuggestions";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, MapPin, Clock, MessageSquare, ExternalLink, Save, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { ROUTES } from "@/constants/routes";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { SuggestionStatus } from "@/types";

const SuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: suggestion, isLoading, isError } = useSuggestion(id!);
  const updateMutation = useUpdateSuggestion();

  const [status, setStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (suggestion) {
      setStatus(suggestion.status);
      setAdminNotes(suggestion.adminNotes || "");
    }
  }, [suggestion]);

  const handleSave = () => {
    if (!id) return;

    updateMutation.mutate(
      {
        id,
        data: { status: status as SuggestionStatus, adminNotes },
      },
      {
        onSuccess: () => {
          toast({
            title: "Suggestion Updated",
            description: `Status changed to ${status.toLowerCase()}.`,
          });
        },
        onError: (err: any) => {
          toast({
            title: "Update Failed",
            description: err.message || "Failed to update suggestion",
            variant: "destructive",
          });
        },
      },
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-none hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "REVIEWED":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none hover:bg-blue-100">
            Reviewed
          </Badge>
        );
      case "IMPLEMENTED":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-none hover:bg-green-100">
            Implemented
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 border-none hover:bg-red-100">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold">Error Loading Suggestion</h2>
          <p className="text-muted-foreground mb-6">Could not fetch suggestion details.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FullPageLoader
        show={isLoading || updateMutation.isPending}
        label={updateMutation.isPending ? "Updating Suggestion..." : "Fetching Details..."}
      />

      <PageHeader title="Review Suggestion" subtitle="Review details and update status" backUrl={ROUTES.SUGGESTIONS} />

      {suggestion && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Route & User Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Card */}
            <Card className="shadow-sm border-border/60 overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Proposed Route
                    </CardTitle>
                    <CardDescription className="mt-1">Requested stop details</CardDescription>
                  </div>
                  {getStatusBadge(suggestion.status)}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-primary before:via-border before:to-orange-500">
                  <div className="relative">
                    <div className="absolute -left-[32px] top-1 h-6 w-6 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-sm z-10">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Pickup Location</p>
                      <p className="text-sm font-medium leading-relaxed">{suggestion.pickupAddress}</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[32px] top-1 h-6 w-6 rounded-full bg-background border-2 border-orange-500 flex items-center justify-center shadow-sm z-10">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">
                        Dropoff Location
                      </p>
                      <p className="text-sm font-medium leading-relaxed">{suggestion.dropoffAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium text-foreground">{suggestion.reachingTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium text-foreground px-2 py-0.5 rounded-md bg-muted">
                        {suggestion.shift}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-9"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&origin=${suggestion.pickupLat},${suggestion.pickupLng}&destination=${suggestion.dropoffLat},${suggestion.dropoffLng}`;
                      window.open(url, "_blank");
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View on Maps
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Message Card */}
            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  User Request Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-sm italic text-muted-foreground leading-relaxed">
                  "{suggestion.description}"
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Actions & Meta */}
          <div className="space-y-6">
            {/* User Info Card */}
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Requested By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={suggestion.user?.profileUrl} />
                    <AvatarFallback>{suggestion.user?.fullName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm">{suggestion.user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">User ID: {suggestion.user?.id?.substring(0, 8)}...</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>Mobile</span>
                    </div>
                    <a href={`tel:${suggestion.user?.mobileNumber}`} className="hover:text-primary transition-colors">
                      {suggestion.user?.mobileNumber}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email</span>
                    </div>
                    <a
                      href={`mailto:${suggestion.user?.email}`}
                      className="hover:text-primary transition-colors truncate max-w-[150px]"
                      title={suggestion.user?.email}
                    >
                      {suggestion.user?.email}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Actions Card */}
            <Card className="shadow-sm border-border/60 bg-muted/10">
              <CardHeader>
                <CardTitle className="text-base font-medium">Review Actions</CardTitle>
                <CardDescription>Update status and add notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="REVIEWED">Reviewed</SelectItem>
                      <SelectItem value="IMPLEMENTED">Implemented</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Internal Notes
                  </label>
                  <Textarea
                    placeholder="Add administrative notes here..."
                    className="bg-background min-h-[120px] resize-none focus-visible:ring-primary/20"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>

                <Button className="w-full font-bold shadow-sm" onClick={handleSave} disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SuggestionDetails;
