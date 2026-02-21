import { useState } from "react";
import { Search, ArrowUpCircle, ArrowDownCircle, RotateCcw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { TablePagination } from "@/components/ui/table-pagination";
import { useWallets, useGlobalWalletTransactions } from "@/features/financials";
import { useDebounce } from "@/hooks/useDebounce";

const WalletManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("q") || "";
  const activeSubTab = searchParams.get("tab") || "user-wallets";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch Wallets
  const { data: walletsData, isLoading: isLoadingWallets } = useWallets({
    limit: pageSize,
    offset: activeSubTab === "user-wallets" ? (currentPage - 1) * pageSize : 0,
    search: debouncedSearch,
  });

  // Fetch Global Wallet Transactions
  const { data: globalWalletTxnsData, isLoading: isLoadingGlobalTxns } = useGlobalWalletTransactions({
    limit: pageSize,
    offset: activeSubTab === "wallet-transactions" ? (currentPage - 1) * pageSize : 0,
    search: debouncedSearch,
  });

  const wallets = walletsData?.data || [];
  const globalTransactions = globalWalletTxnsData?.data || [];

  const totalWalletsCount = walletsData?.total || 0;
  const totalTransactionsCount = globalWalletTxnsData?.total || 0;

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

  const handleTabChange = (tab: string) => {
    setSearchParams((prev) => {
      prev.set("tab", tab);
      prev.set("page", "1");
      return prev;
    });
  };

  const handleViewWallet = (walletId: string) => {
    navigate(`/payments/wallet-management/wallet/${walletId}`);
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

  const getTransactionTypeBadge = (type: string) => {
    const config = {
      CREDIT: { variant: "default" as const, icon: ArrowUpCircle, label: "Credit" },
      DEBIT: { variant: "destructive" as const, icon: ArrowDownCircle, label: "Debit" },
      REFUND: { variant: "secondary" as const, icon: RotateCcw, label: "Refund" },
      TOPUP: { variant: "default" as const, icon: ArrowUpCircle, label: "Top-up" },
    };

    const {
      variant,
      icon: Icon,
      label,
    } = config[type as keyof typeof config] || { variant: "outline" as const, icon: ArrowUpCircle, label: type };

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" /> {label}
      </Badge>
    );
  };

  const isLoading =
    (activeSubTab === "user-wallets" && isLoadingWallets) ||
    (activeSubTab === "wallet-transactions" && isLoadingGlobalTxns);

  if (isLoading) return <FullPageLoader show={true} label="Loading wallet data..." />;

  return (
    <TabsContent value="wallets" className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="user-wallets">User Wallets</TabsTrigger>
          <TabsTrigger value="wallet-transactions">Wallet Transactions</TabsTrigger>
        </TabsList>

        {/* User Wallets Tab */}
        <TabsContent value="user-wallets">
          <div className="dashboard-card p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">User Wallets</h3>
              <p className="text-sm text-muted-foreground">Manage user wallet balances and transactions</p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user name, email or mobile..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Wallets Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Wallet ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Mobile Number</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No wallets found
                      </td>
                    </tr>
                  ) : (
                    wallets.map((wallet) => (
                      <tr
                        key={wallet.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleViewWallet(wallet.id)}
                      >
                        <td className="py-3 px-4">
                          <span className="text-xs font-mono text-muted-foreground">{wallet.id.split("-")[0]}...</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={wallet.user.profileUrl || ""} />
                              <AvatarFallback className="bg-primary/5 text-primary text-xs">
                                {wallet.user.fullName
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{wallet.user.fullName}</p>
                              <p className="text-xs text-muted-foreground">{wallet.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{wallet.user.mobileNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold">{formatCurrency(wallet.balance)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={wallet.isActive ? "default" : "destructive"}>
                            {wallet.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">{formatDate(wallet.updatedAt)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              className="mt-4"
              currentPage={currentPage}
              totalCount={totalWalletsCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={(size) => {
                setPageSize(size);
                handlePageChange(1);
              }}
            />
          </div>
        </TabsContent>

        {/* Wallet Transactions Tab */}
        <TabsContent value="wallet-transactions">
          <div className="dashboard-card p-5">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Wallet Transaction History</h3>
              <p className="text-sm text-muted-foreground">All wallet credit, debit, and refund transactions</p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user name, email, or reference ID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Transaction ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {globalTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    globalTransactions.map((txn) => (
                      <tr key={txn.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-primary">{txn.id.split("-")[0]}...</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={txn.wallet?.user.profileUrl || ""} />
                              <AvatarFallback className="bg-primary/5 text-primary text-xs">
                                {txn.wallet?.user.fullName
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase() || "UN"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <p className="text-sm font-medium">{txn.wallet?.user.fullName || "Unknown"}</p>
                              <p className="text-[10px] text-muted-foreground">{txn.wallet?.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getTransactionTypeBadge(txn.type)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-sm font-semibold ${txn.type === "CREDIT" || txn.type === "REFUND" ? "text-success" : "text-destructive"}`}
                          >
                            {txn.type === "CREDIT" || txn.type === "REFUND" ? "+" : "-"}
                            {formatCurrency(txn.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                            {txn.description}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {txn.referenceId && (
                            <span
                              className="text-xs text-primary hover:underline cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                const desc = txn.description.toLowerCase();
                                if (desc.includes("booking") || desc.includes("ticket")) {
                                  navigate(`/bookings/${txn.referenceId}`);
                                } else {
                                  navigate(`/payments/${txn.referenceId}`);
                                }
                              }}
                            >
                              {txn.referenceId.split("-")[0]}...
                            </span>
                          )}
                          {!txn.referenceId && <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">{formatDate(txn.createdAt)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              className="mt-4"
              currentPage={currentPage}
              totalCount={totalTransactionsCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={(size) => {
                setPageSize(size);
                handlePageChange(1);
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
};

export default WalletManagement;
