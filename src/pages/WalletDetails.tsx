import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import {
  User,
  Phone,
  Mail,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  Wallet as WalletIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWalletDetails, useWalletTransactions } from "@/features/financials";
import { PageHeader } from "@/components/ui/page-header";
import { ROUTES } from "@/constants/routes";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDebounce } from "@/hooks/useDebounce";

const WalletDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: walletDetails, isLoading: isLoadingDetails } = useWalletDetails(id!);

  const { data: transactionsData, isLoading: isLoadingTxns } = useWalletTransactions(id!, {
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  const isLoading = isLoadingDetails || isLoadingTxns;

  const transactions = transactionsData?.data || [];
  const totalTransactions = transactionsData?.total || 0;

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      return prev;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    if (type === "CREDIT" || type === "REFUND" || type === "TOPUP") {
      return <ArrowUpCircle className="h-4 w-4 text-success" />;
    }
    return <ArrowDownCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Fetching wallet details..." />

      <PageHeader
        title="Wallet Details"
        subtitle="Manage user wallet and view transaction history"
        backUrl={ROUTES.PAYMENTS}
      />

      {walletDetails && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* User Info & Balance Card */}
          <Card className="md:col-span-1 shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-20 w-20 border-4 border-background shadow-lg mb-3">
                  <AvatarImage src={walletDetails.user.profileUrl || ""} />
                  <AvatarFallback className="text-xl bg-primary/5 text-primary">
                    {walletDetails.user.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-bold">{walletDetails.user.fullName}</h2>
                <Badge
                  variant={walletDetails.isActive ? "default" : "secondary"}
                  className="mt-2 text-xs px-2 py-0.5 h-auto"
                >
                  {walletDetails.isActive ? "Active Wallet" : "Inactive"}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <WalletIcon className="h-4 w-4" /> Balance
                  </span>
                  <span className="font-bold text-lg text-primary">{formatCurrency(walletDetails.balance)}</span>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{walletDetails.user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{walletDetails.user.mobileNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Created: {new Date((walletDetails as any)?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History - Main Content */}
          <Card className="md:col-span-2 shadow-sm border-border/60 flex flex-col min-h-[600px]">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Transaction History
                  </CardTitle>
                  <CardDescription className="mt-1">Recent activity for this wallet</CardDescription>
                </div>
                <div className="flex gap-4 text-sm text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Credit</span>
                    <span className="font-bold text-success">{formatCurrency(walletDetails.stats.totalCredit)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Debit</span>
                    <span className="font-bold text-destructive">{formatCurrency(walletDetails.stats.totalDebit)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="divide-y divide-border/60 flex-1">
                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                    <CreditCard className="h-12 w-12 mb-4 opacity-20" />
                    <p>No transactions found</p>
                  </div>
                ) : (
                  transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${txn.type === "CREDIT" || txn.type === "REFUND" || txn.type === "TOPUP" ? "bg-success/10" : "bg-destructive/10"}`}
                        >
                          {getTransactionIcon(txn.type)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{txn.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 h-5 font-normal text-muted-foreground border-border/60"
                            >
                              {txn.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatDate(txn.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold text-sm ${txn.type === "CREDIT" || txn.type === "REFUND" || txn.type === "TOPUP" ? "text-success" : "text-foreground"}`}
                        >
                          {txn.type === "CREDIT" || txn.type === "REFUND" || txn.type === "TOPUP" ? "+" : "-"}{" "}
                          {formatCurrency(txn.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Bal: {formatCurrency(txn.balanceAfter)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t bg-muted/5 mt-auto">
                <TablePagination
                  currentPage={currentPage}
                  totalCount={totalTransactions}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    handlePageChange(1);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default WalletDetails;
