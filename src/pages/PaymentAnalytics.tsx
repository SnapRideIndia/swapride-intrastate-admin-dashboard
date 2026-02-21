import { DollarSign, TrendingUp, AlertCircle, Wallet, ArrowUpCircle, Clock, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { usePaymentAnalytics } from "@/features/financials";
import { FullPageLoader } from "@/components/ui/full-page-loader";

const PaymentAnalytics = () => {
  const { data: analytics, isLoading, isError } = usePaymentAnalytics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) return <FullPageLoader show={true} label="Fetching analytics..." />;

  if (isError || !analytics) {
    return (
      <div className="p-12 text-center dashboard-card">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
        <p className="text-sm text-muted-foreground">Failed to fetch payment statistics from the server.</p>
      </div>
    );
  }

  const { overview, statusBreakdown, paymentMethods, paymentTypes } = analytics;

  return (
    <TabsContent value="analytics" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Key Metrics */}
        <Card className="dashboard-card border-none bg-gradient-to-br from-blue-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900">Total Revenue</p>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-950">{formatCurrency(overview.totalRevenue)}</p>
            <p className="mt-2 text-xs text-blue-600 font-medium italic">From {overview.totalPayments} transactions</p>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-none bg-gradient-to-br from-green-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-900">Success Rate</p>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-950">{overview.successRate}%</p>
            <p className="mt-2 text-xs text-green-600 font-medium italic">
              {statusBreakdown.successful} successful payments
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-none bg-gradient-to-br from-purple-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-900">Avg. Transaction</p>
              <Wallet className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-950">{formatCurrency(overview.avgTransaction)}</p>
            <p className="mt-2 text-xs text-purple-600 font-medium italic">Per successful payment</p>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-none bg-gradient-to-br from-yellow-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-yellow-900">Current Pending</p>
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-950">{statusBreakdown.pending}</p>
            <p className="mt-2 text-xs text-yellow-600 font-medium italic">Awaiting confirmation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="dashboard-card p-5">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Top Payment Methods
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Razorpay Gateway</span>
                  <span className="text-xs text-muted-foreground">
                    {paymentMethods.razorpay.count} payments • {formatCurrency(paymentMethods.razorpay.revenue)}
                  </span>
                </div>
                <span className="text-sm font-bold text-primary">{paymentMethods.razorpay.percentage}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${paymentMethods.razorpay.percentage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">User Wallet</span>
                  <span className="text-xs text-muted-foreground">
                    {paymentMethods.wallet.count} payments • {formatCurrency(paymentMethods.wallet.revenue)}
                  </span>
                </div>
                <span className="text-sm font-bold text-info">{paymentMethods.wallet.percentage}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-info rounded-full transition-all duration-500"
                  style={{ width: `${paymentMethods.wallet.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Types Breakdown */}
        <div className="dashboard-card p-5">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Revenue Distribution
          </h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                <ArrowUpCircle className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium">Bus Bookings</span>
                  <span className="text-sm font-bold">{formatCurrency(paymentTypes.booking.revenue)}</span>
                </div>
                <div className="text-xs text-muted-foreground">{paymentTypes.booking.count} bookings handled</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                <Wallet className="h-6 w-6 text-info" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium">Wallet Top-ups</span>
                  <span className="text-sm font-bold">{formatCurrency(paymentTypes.topup.revenue)}</span>
                </div>
                <div className="text-xs text-muted-foreground">{paymentTypes.topup.count} successful top-ups</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
};

export default PaymentAnalytics;
