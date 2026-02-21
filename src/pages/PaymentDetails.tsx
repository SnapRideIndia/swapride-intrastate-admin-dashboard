import { useNavigate, useParams } from "react-router-dom";
import {
  ExternalLink,
  MapPin,
  Bus,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  RotateCcw,
  Mail,
  Phone,
  Activity,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { PageHeader } from "@/components/ui/page-header";
import { ROUTES } from "@/constants/routes";
import { usePaymentDetails } from "@/features/financials";

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: payment, isLoading, error } = usePaymentDetails(id!);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/20 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Success
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="outline" className="text-warning bg-warning/5 border-warning/20 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge
            variant="destructive"
            className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground border-border flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) return <FullPageLoader show={true} label="Fetching payment details..." />;

  if (error || !payment) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Payment Not Found</h2>
          <Button onClick={() => navigate("/payments")}>Back to Payments</Button>
        </div>
      </DashboardLayout>
    );
  }

  const seatNumbers = payment.booking?.seats?.map((s) => s.seat.seatNumber).join(", ") || "N/A";
  const sortedStops = [...(payment.booking?.route?.stops || [])].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  const departureCity = sortedStops[0]?.point.city || "N/A";
  const arrivalCity = sortedStops[sortedStops.length - 1]?.point.city || "N/A";

  return (
    <DashboardLayout>
      <PageHeader
        title="Payment Detail"
        subtitle={
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-mono text-muted-foreground">{payment.id}</span>
            {getStatusBadge(payment.paymentStatus)}
          </div>
        }
        backUrl={ROUTES.PAYMENTS}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Download className="h-4 w-4 mr-2" /> Receipt
            </Button>
            {payment.paymentStatus === "SUCCESS" && (
              <Button size="sm" className="h-9">
                <RotateCcw className="h-4 w-4 mr-2" /> Refund
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-medium">Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(payment.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Method</p>
                  <p className="text-sm font-semibold">{payment.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Type</p>
                  <p className="text-sm font-semibold">{payment.paymentType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-semibold">{formatDate(payment.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Identification Details */}
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-medium">Identification & Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    SwapRide Payment ID
                  </p>
                  <p className="text-sm font-mono">{payment.id}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    Gateway Transaction ID
                  </p>
                  <p className="text-sm font-mono">{payment.transactionId || "N/A"}</p>
                </div>
                {payment.gatewayOrderId && (
                  <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                      Gateway Order ID
                    </p>
                    <p className="text-sm font-mono">{payment.gatewayOrderId}</p>
                  </div>
                )}
                {payment.referenceId && (
                  <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                      Reference Reference ID
                    </p>
                    <p className="text-sm font-mono">{payment.referenceId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Details (If exists) */}
          {payment.booking && (
            <Card className="shadow-sm border-border/60 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium">Booking Information</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-primary group"
                    onClick={() => navigate(`/bookings/${payment.booking?.id}`)}
                  >
                    View Booking{" "}
                    <ExternalLink className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-6 pb-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Route</p>
                          <p className="text-sm font-semibold">
                            {departureCity} → {arrivalCity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                          <Bus className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Seat(s)</p>
                          <p className="text-sm font-semibold">{seatNumbers}</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-px bg-border/60 hidden md:block" />
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2">
                          Booking Identifier
                        </p>
                        <p className="text-sm font-mono mb-1">{payment.booking.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - User & Actions */}
        <div className="space-y-6">
          {/* User Card */}
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-medium">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                  <AvatarImage src={payment.user.profileUrl || ""} />
                  <AvatarFallback className="bg-primary/5 text-primary text-lg">
                    {payment.user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg leading-tight">{payment.user.fullName}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Customer since {new Date(payment.user.createdAt).getFullYear()}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <p className="text-sm font-medium">{payment.user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <p className="text-sm font-medium">{payment.user.mobileNumber}</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-2" onClick={() => navigate(`/users/${payment.user.id}`)}>
                View Full Profile
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-medium">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-xl flex items-start gap-3 border border-primary/10">
                <Activity className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-xs text-primary leading-relaxed">
                  This transaction was processed via <strong>{payment.paymentMethod}</strong>. Status is currently
                  marked as <strong>{payment.paymentStatus}</strong>.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => window.open(`mailto:${payment.user.email}?subject=Payment%20Query:%20${payment.id}`)}
              >
                <Mail className="h-4 w-4" /> Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentDetails;
