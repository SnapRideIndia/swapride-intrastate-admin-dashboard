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
import { useSearchParams, useNavigate } from "react-router-dom";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { TablePagination } from "@/components/ui/table-pagination";
import { usePayments, usePaymentAnalytics } from "@/features/financials";
import { useDebounce } from "@/hooks/useDebounce";

const PaymentOverview = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "all";
  const methodFilter = searchParams.get("method") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch Payment Analytics
  const { data: analytics, isLoading: isLoadingAnalytics } = usePaymentAnalytics();

  // Fetch Global Payments
  const { data: paymentsData, isLoading: isLoadingPayments } = usePayments({
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    status: statusFilter === "all" ? undefined : statusFilter,
    method: methodFilter === "all" ? undefined : methodFilter,
    search: debouncedSearch,
  });

  const payments = paymentsData?.data || [];
  const totalCount = paymentsData?.total || 0;

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      return prev;
    });
  };

  const handleSearch = (val: string) => {
    setSearchParams((prev) => {
      if (val) prev.set("q", val);
      else prev.delete("q");
      prev.set("page", "1");
      return prev;
    });
  };

  const handleStatusFilter = (val: string) => {
    setSearchParams((prev) => {
      if (val !== "all") prev.set("status", val);
      else prev.delete("status");
      prev.set("page", "1");
      return prev;
    });
  };

  const handleMethodFilter = (val: string) => {
    setSearchParams((prev) => {
      if (val !== "all") prev.set("method", val);
      else prev.delete("method");
      prev.set("page", "1");
      return prev;
    });
  };

  const handleViewPayment = (paymentId: string) => {
    navigate(`/payments/${paymentId}`);
  };

  const overview = analytics?.overview || {
    totalRevenue: 0,
    successRate: 0,
    pendingAmount: 0,
    failureRate: 0,
    totalPayments: 0,
  };
  const statusBreakdown = analytics?.statusBreakdown || {
    pending: 0,
    failed: 0,
    successful: 0,
  };

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

  if (isLoadingPayments || isLoadingAnalytics)
    return <FullPageLoader show={true} label="Fetching payments overview..." />;

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
            <p className="text-3xl font-bold text-blue-950">{formatCurrency(overview.totalRevenue)}</p>
            <div className="mt-2 flex items-center text-xs text-blue-600 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" /> from {statusBreakdown.successful} successful payments
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-none bg-gradient-to-br from-green-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-900">Success Rate</p>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-950">{overview.successRate}%</p>
            <div className="mt-2 flex items-center text-xs text-green-600 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2" /> Out of {overview.totalPayments} payments
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-none bg-gradient-to-br from-yellow-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-yellow-900">Pending ({statusBreakdown.pending})</p>
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-950">{formatCurrency(overview.pendingAmount)}</p>
            <p className="mt-2 text-xs text-yellow-600 font-medium italic">Awaiting settlement</p>
          </CardContent>
        </Card>

        <Card className="dashboard-card border-none bg-gradient-to-br from-red-50/50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-red-900">Failed Payments</p>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-950">{statusBreakdown.failed}</p>
            <div className="mt-2 flex items-center text-xs text-red-600 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-2" /> {overview.failureRate}% failure rate
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
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select value={methodFilter} onValueChange={handleMethodFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="RAZORPAY">Razorpay</SelectItem>
              <SelectItem value="WALLET">Wallet</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
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
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={(size) => {
            setPageSize(size);
            handlePageChange(1);
          }}
          className="mt-4"
        />
      </div>
    </TabsContent>
  );
};

export default PaymentOverview;
