import { ArrowUpCircle, ArrowDownCircle, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { financialsApi } from "@/api/financials";
import { useNavigate } from "react-router-dom";
import { FullPageLoader } from "@/components/ui/full-page-loader";

const TransactionLedger = () => {
  const navigate = useNavigate();

  // Fetch Global Wallet Transactions
  const { data: globalWalletTxnsData, isLoading: isLoadingGlobalTxns } = useQuery({
    queryKey: ["admin-global-wallet-transactions"],
    queryFn: () => financialsApi.getGlobalWalletTransactions({ limit: 20 }),
  });

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

  if (isLoadingGlobalTxns) return <FullPageLoader show={true} label="Fetching transaction ledger..." />;

  return (
    <TabsContent value="transactions" className="space-y-6">
      <div className="dashboard-card p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Transaction Ledger</h3>
          <p className="text-sm text-muted-foreground">Complete financial transaction history</p>
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
              {globalWalletTxnsData?.transactions.map((txn) => (
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
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "UN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{txn.wallet?.user.fullName || "Unknown"}</span>
                        <span className="text-[10px] text-muted-foreground">{txn.wallet?.user.email}</span>
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
                        onClick={() => navigate(`/payments/${txn.referenceId}`)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TabsContent>
  );
};

export default TransactionLedger;
