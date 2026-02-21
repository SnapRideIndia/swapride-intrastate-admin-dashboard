import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Send, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";
import { apiClient } from "@/api/api-client";

// Use the dynamic baseURL from apiClient if possible
const BACKEND_URL = (apiClient.defaults.baseURL as string) || "http://localhost:3000";

export default function RazorpayTester() {
  const [amount, setAmount] = useState("100");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"IDLE" | "PENDING" | "SUCCESS" | "FAILED">("IDLE");
  const [logs, setLogs] = useState<{ time: string; msg: string; type: "info" | "success" | "error" }[]>([]);

  useEffect(() => {
    // Dynamically load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const addLog = (msg: string, type: "info" | "success" | "error" = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, msg, type }, ...prev]);
  };

  const handleTestPayment = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!token) {
      toast.error("User Token is required to call Wallet API");
      addLog("Error: Missing User Token", "error");
      return;
    }

    setLoading(true);
    setPaymentStatus("PENDING");
    addLog(`Initiating wallet top-up of ₹${amount}...`, "info");

    try {
      const sanitizedToken = token.trim().replace(/[^\x00-\x7F]/g, ""); // Remove non-ASCII/special chars
      addLog(`Calling ${BACKEND_URL}/wallet/topup/initiate...`, "info");

      const response = await axios.post(
        `${BACKEND_URL}/wallet/topup/initiate`,
        { amount: Number(amount) },
        {
          headers: {
            Authorization: `Bearer ${sanitizedToken}`,
          },
        },
      );

      // Wallet API returns { topUpId, amount, gatewayData: { gatewayOrderId, razorpayKeyId } }
      const { gatewayData } = response.data;
      const { gatewayOrderId, razorpayKeyId } = gatewayData;

      addLog(`Order created: ${gatewayOrderId}`, "success");

      const options = {
        key: razorpayKeyId,
        amount: Number(amount) * 100,
        currency: "INR",
        name: "SwapRide Wallet",
        description: "Wallet Top-up Test",
        order_id: gatewayOrderId,
        handler: function (response: any) {
          addLog(`Payment Successful: ${response.razorpay_payment_id}`, "success");
          setPaymentStatus("SUCCESS");
          toast.success("Wallet top-up successful");
        },
        modal: {
          ondismiss: function () {
            addLog("Payment modal closed", "error");
            setPaymentStatus("FAILED");
            setLoading(false);
          },
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to initiate";
      addLog(`Error: ${errorMsg}`, "error");
      setPaymentStatus("FAILED");
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <PageHeader title="Razorpay UI Tester" subtitle="we test razor pay with user wallet topup" />

        {paymentStatus === "SUCCESS" && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center gap-3 animate-in zoom-in duration-300 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-bold">Payment Successful!</p>
              <p className="text-sm">Your wallet has been credited successfully.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <Card className="md:col-span-1 border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Payment Trigger
              </CardTitle>
              <CardDescription>Configure and start a test transaction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Test Amount (INR)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7 focus-visible:ring-blue-500"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">User Bearer Token</Label>
                <Input
                  id="token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="focus-visible:ring-blue-500"
                  placeholder="Paste user JWT here..."
                />
              </div>

              <Button
                onClick={handleTestPayment}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Pay Now
                  </>
                )}
              </Button>

              <div className="pt-4 border-t">
                <div className="text-sm font-medium text-slate-500 mb-2">Checkout Status</div>
                {paymentStatus === "IDLE" && <Badge variant="secondary">Waiting for input</Badge>}
                {paymentStatus === "PENDING" && <Badge className="bg-amber-100 text-amber-700">In Progress</Badge>}
                {paymentStatus === "SUCCESS" && <Badge className="bg-emerald-100 text-emerald-700">Completed</Badge>}
                {paymentStatus === "FAILED" && <Badge className="bg-rose-100 text-rose-700">Cancelled/Failed</Badge>}
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          <Card className="md:col-span-2 border-slate-200 shadow-sm bg-slate-950 text-slate-200 overflow-hidden font-mono flex flex-col h-[400px]">
            <CardHeader className="border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-400" />
                  Integration Logs
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogs([])}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Clear Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                  No logs generated yet. Trigger a payment to see technical flow.
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {logs.map((log, i) => (
                    <div
                      key={i}
                      className="text-[11px] leading-relaxed animate-in fade-in slide-in-from-left-2 transition-all"
                    >
                      <span className="text-slate-500">[{log.time}]</span>{" "}
                      <span
                        className={cn(
                          log.type === "success"
                            ? "text-emerald-400"
                            : log.type === "error"
                              ? "text-rose-400"
                              : "text-blue-300",
                        )}
                      >
                        {log.msg}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-slate-200 shadow-sm bg-blue-50/50 text-blue-900">
          <CardContent className="p-4 flex items-start gap-4">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Testing Note</p>
              <div className="opacity-80 text-sm">
                This page uses the credentials configured in your backend .env file. Ensure you have{" "}
                <Badge variant="outline" className="text-[10px] border-blue-200 bg-blue-100/50">
                  rzp_test_...
                </Badge>{" "}
                keys for risk-free testing. Checkouts will trigger the standard Razorpay modal.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
