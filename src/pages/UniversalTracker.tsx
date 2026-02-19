import { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  User,
  DollarSign,
  ArrowRight,
  ClipboardCheck,
  History,
  CreditCard,
  ExternalLink,
  QrCode,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { financialsApi } from "@/api/financials";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FullPageLoader } from "@/components/ui/full-page-loader";

const UniversalTracker = () => {
  const [trackerId, setTrackerId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!trackerId.trim()) return;

    setLoading(true);
    setErrorStatus(false);
    try {
      const data = await financialsApi.trackId(trackerId.trim());
      if (data) {
        setResult(data);
        toast({ title: "Tracking Successful", description: `Found ${data.type.toLowerCase()} details.` });
      } else {
        setResult(null);
        setErrorStatus(true);
        toast({ title: "No Record Found", description: "Please enter a valid tracking ID.", variant: "destructive" });
      }
    } catch (error) {
      setResult(null);
      setErrorStatus(true);
      toast({ title: "Error", description: "Please enter a valid tracking ID.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
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

  const renderPaymentResult = (payment: any) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Summary Card */}
        <div className="dashboard-card p-6 border-l-4 border-primary">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment Details</p>
              <h3 className="text-2xl font-bold mt-1 text-primary">{formatCurrency(payment.amount)}</h3>
            </div>
            <Badge variant={payment.paymentStatus === "SUCCESS" ? "default" : "destructive"}>
              {payment.paymentStatus}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase">Method</p>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{payment.paymentMethod}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase">Type</p>
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{payment.paymentType}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase">Reference ID</p>
              <span className="text-sm font-mono">{payment.referenceId || "N/A"}</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase">Date</p>
              <span className="text-sm">{formatDate(payment.createdAt)}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-6"
            onClick={() => navigate(`/payments/${payment.id}`)}
          >
            View Deep Details <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        </div>

        {/* User Card */}
        <div className="dashboard-card p-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Payer Information</p>
          <div className="flex items-center gap-4 py-2">
            <Avatar className="h-16 w-16 border-2 border-primary/10">
              <AvatarImage src={payment.user.profileUrl || ""} />
              <AvatarFallback className="text-xl">{payment.user.fullName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-lg font-bold">{payment.user.fullName}</h4>
              <p className="text-sm text-muted-foreground">{payment.user.email}</p>
              <p className="text-sm text-muted-foreground">{payment.user.mobileNumber}</p>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/users/${payment.user.id}`)}
            >
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransactionResult = (txn: any) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="dashboard-card p-6 border-l-4 border-info">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Wallet Transaction</p>
            <h3 className="text-2xl font-bold mt-1 uppercase">{txn.type}</h3>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-info">{formatCurrency(txn.amount)}</p>
            <p className="text-xs text-muted-foreground font-mono">{txn.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase text-muted-foreground">Flow Details</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance Before</span>
                <span className="text-sm font-medium">{formatCurrency(txn.balanceBefore)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance After</span>
                <span className="text-sm font-medium text-info">{formatCurrency(txn.balanceAfter)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge>{txn.status}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase text-muted-foreground">User Context</h5>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{txn.wallet.user.fullName[0]}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{txn.wallet.user.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{txn.wallet.user.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase text-muted-foreground">Audit Log</h5>
            <p className="text-sm italic text-muted-foreground">"{txn.description}"</p>
            <p className="text-[10px] text-muted-foreground">{formatDate(txn.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookingResult = (booking: any) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="dashboard-card p-6 border-l-4 border-success">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Booking Audit</p>
            <h3 className="text-2xl font-bold mt-1">{booking.route.routeName}</h3>
          </div>
          <Badge variant="outline" className="text-success border-success/20 bg-success/5 px-4 py-1">
            {booking.bookingStatus}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase">Booking ID</span>
            </div>
            <p className="text-sm font-mono truncate">{booking.id}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase">Passenger</span>
            </div>
            <p className="text-sm font-medium">{booking.user.fullName}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase">Ticket Value</span>
            </div>
            <p className="text-base font-bold">{formatCurrency(booking.totalAmount)}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase">Success Date</span>
            </div>
            <p className="text-sm">{formatDate(booking.createdAt)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
            <MapPin className="h-3 w-3" /> Journey Sequence
          </h5>
          <div className="flex flex-wrap items-center gap-3">
            {booking.route.stops
              .sort((a: any, b: any) => a.sequenceOrder - b.sequenceOrder)
              .map((stop: any, idx: number) => (
                <div key={stop.id} className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-medium">
                    {stop.point.name}
                  </div>
                  {idx < booking.route.stops.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                </div>
              ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-8"
            onClick={() => navigate(`/bookings/${booking.id}`)}
          >
            Show Full Booking Details <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-10">
      <div className="text-center space-y-2">
        <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
          <Search className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Universal Tracker</h1>
        <p className="text-muted-foreground">Audit payments, transactions, and bookings instantly using a single ID</p>
      </div>

      <div className="bg-background/50 backdrop-blur-sm border border-border rounded-3xl p-3 shadow-xl max-w-2xl mx-auto flex items-center gap-3">
        <div className="relative flex-1">
          <ClipboardCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            className="h-14 pl-12 pr-4 text-lg border-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
            placeholder="Enter ID to track..."
            value={trackerId}
            onChange={(e) => setTrackerId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          />
        </div>
        <Button
          className="h-14 px-8 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
          onClick={handleTrack}
          disabled={loading}
        >
          {loading ? "Tracking..." : "Track Now"}
        </Button>
      </div>

      <div className="min-h-[400px]">
        {!result && !loading && !errorStatus && (
          <div className="h-[400px] flex flex-col items-center justify-center text-center opacity-30 select-none">
            <div className="h-24 w-24 border-4 border-dashed border-primary/20 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-primary/20" />
            </div>
            <p className="text-xl font-medium">Ready for input</p>
            <p className="text-sm">Found records will appear here automatically</p>
          </div>
        )}

        {errorStatus && !loading && (
          <div className="h-[400px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <p className="text-xl font-bold text-destructive">No Record Found</p>
            <p className="text-muted-foreground mt-2 max-w-xs">
              We couldn't find any payment, transaction, or booking with ID{" "}
              <span className="font-mono font-bold text-foreground">"{trackerId}"</span>.
            </p>
            <p className="text-sm text-muted-foreground mt-4">Please enter a valid tracking ID and try again.</p>
          </div>
        )}

        {loading && (
          <div className="h-[400px] flex items-center justify-center">
            <FullPageLoader show={true} label="Deep diving into records..." />
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between pb-4 border-b">
              <h4 className="text-lg font-bold">Audit Results</h4>
            </div>
            {result.type === "PAYMENT" && renderPaymentResult(result.data)}
            {result.type === "TRANSACTION" && renderTransactionResult(result.data)}
            {result.type === "BOOKING" && renderBookingResult(result.data)}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalTracker;
