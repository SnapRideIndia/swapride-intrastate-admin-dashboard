import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  Filter as FilterIcon,
  CreditCard,
  Search,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { financialsApi } from "@/api/financials";
import { useNavigate } from "react-router-dom";
import { FullPageLoader } from "@/components/ui/full-page-loader";

const PaymentOverview = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Global Payments (Overview)
  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["admin-payments", statusFilter, methodFilter, searchTerm],
    queryFn: () =>
      financialsApi.getPayments({
        limit: 20,
        status: statusFilter,
        method: methodFilter,
        search: searchTerm,
      }),
  });

  const payments = paymentsData?.payments || [];

  const handleViewPayment = (paymentId: string) => {
    navigate(`/payments/${paymentId}`);
  };

  // Calculate metrics
  const calculateMetrics = () => {
    const total = payments.reduce((sum, p) => sum + (p.paymentStatus === "SUCCESS" ? Number(p.amount) : 0), 0);
    const successCount = payments.filter((p) => p.paymentStatus === "SUCCESS").length;
    const pendingAmount = payments
      .filter((p) => p.paymentStatus === "PENDING")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingCount = payments.filter((p) => p.paymentStatus === "PENDING").length;
    const failedCount = payments.filter((p) => p.paymentStatus === "FAILED").length;
    const successRate = payments.length > 0 ? ((successCount / payments.length) * 100).toFixed(1) : "0.0";
    const failureRate = payments.length > 0 ? ((failedCount / payments.length) * 100).toFixed(1) : "0.0";

    return { total, successRate, pendingAmount, pendingCount, failedCount, failureRate };
  };

  const metrics = calculateMetrics();

  // Payment status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      SUCCESS: "default",
      PENDING: "secondary",
      FAILED: "destructive",
      REFUNDED: "outline",
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>;
  };

  // Payment method badge
  const getMethodBadge = (method: string) => {
    return (
      <Badge variant="outline" className="flex items-center gap-1 bg-muted/50">
        <CreditCard className="h-3 w-3" /> {method}
      </Badge>
    );
  };

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

  const filteredPayments = payments;

  if (isLoadingPayments) return <FullPageLoader show={true} label="Fetching payments..." />;

  return (
    <TabsContent value="overview" className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dashboard-card border-none bg-gradient-to-br from-blue-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900">Total Revenue</p>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-950">{formatCurrency(metrics.total)}</p>
            <div className="mt-2 flex items-center text-xs text-blue-600 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" /> 12% increase
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-none bg-gradient-to-br from-green-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-900">Success Rate</p>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-950">{metrics.successRate}%</p>
            <div className="mt-2 flex items-center text-xs text-green-600 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2" /> Very Healthy
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-none bg-gradient-to-br from-yellow-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-yellow-900">Pending ({metrics.pendingCount})</p>
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-950">{formatCurrency(metrics.pendingAmount)}</p>
            <p className="mt-2 text-xs text-yellow-600 font-medium italic">Awaiting settlement</p>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-none bg-gradient-to-br from-red-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-red-900">Failed Payments</p>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-950">{metrics.failedCount}</p>
            <div className="mt-2 flex items-center text-xs text-red-600 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2" /> Needs Attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <div className="dashboard-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold">Recent Payments</h3>
            <p className="text-sm text-muted-foreground">Gateway and wallet payment transactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, transaction ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="RAZORPAY">Razorpay</SelectItem>
              <SelectItem value="WALLET">Wallet</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Payment ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Booking ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Method</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Transaction ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleViewPayment(payment.id)}
                >
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-primary hover:underline">
                      {payment.id.split("-")[0]}...
                    </span>
                    {payment.gatewayOrderId && (
                      <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                        {payment.gatewayOrderId}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={payment.user.profileUrl || ""} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs">
                          {payment.user.fullName
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase() || "UN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{payment.user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{payment.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {payment.bookingId ? (
                      <span
                        className="text-sm text-primary hover:underline cursor-pointer"
                        onClick={() => navigate(`/bookings/${payment.bookingId}`)}
                      >
                        {payment.bookingId.split("-")[0]}...
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold">{formatCurrency(payment.amount)}</span>
                  </td>
                  <td className="py-3 px-4">{getMethodBadge(payment.paymentMethod)}</td>
                  <td className="py-3 px-4">{getStatusBadge(payment.paymentStatus)}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[100px] block">
                      {payment.transactionId || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Showing {Math.min(20, filteredPayments.length)} of {filteredPayments.length} payments
        </p>
      </div>
    </TabsContent>
  );
};

export default PaymentOverview;
