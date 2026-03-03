import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Send, CheckCircle2, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { TEST_USER_TOKEN_KEY, Log } from "./types";

// Shared Components
import { LoginModal } from "./shared/LoginModal";
import { useLogs } from "./shared/LogContext";

// Use the dynamic baseURL from apiClient if possible
const BACKEND_URL = (apiClient.defaults.baseURL as string) || "http://localhost:3000";

export default function RazorpayTester() {
  const [amount, setAmount] = useState("100");
  const [testToken, setTestToken] = useState<string | null>(localStorage.getItem(TEST_USER_TOKEN_KEY));
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"IDLE" | "PENDING" | "SUCCESS" | "FAILED">("IDLE");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const { addLog } = useLogs();

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

  const handleStartRazorpay = () => {
    if (!testToken) {
      addLog("Starting Razorpay test. Auth required.", "info");
      setIsLoginModalOpen(true);
    } else {
      addLog("Starting Razorpay test with existing session.", "success");
      setShowSimulator(true);
    }
  };

  const handleTestPayment = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!testToken) {
      addLog("Payment attempted without authentication. Opening login modal.", "error");
      setIsLoginModalOpen(true);
      return;
    }

    setLoading(true);
    setPaymentStatus("PENDING");
    addLog(`Initiating wallet top-up of ₹${amount}...`, "request");

    try {
      const sanitizedToken = testToken.trim().replace(/[^\x00-\x7F]/g, ""); // Remove non-ASCII/special chars
      addLog(`Calling POST /wallet/topup/initiate...`, "request");

      const response = await axios.post(
        `${BACKEND_URL}${API_ENDPOINTS.TEST.WALLET.TOPUP_INITIATE}`,
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

      addLog(`Order created: ${gatewayOrderId}`, "response");
      addLog("Opening Razorpay checkout modal...", "info");

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
            addLog("Payment modal closed by user", "error");
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
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLog={addLog}
        description="Sign in with your tester account to initiate payments"
        onSuccess={(tokens) => {
          setTestToken(tokens.accessToken);
          addLog("Authenticated. You can now proceed with the test payment.", "success");
        }}
      />

      <div className="flex-1 h-full flex flex-col min-w-0">
        {paymentStatus === "SUCCESS" && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-in zoom-in duration-300 shadow-sm border-dashed">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-bold">Payment Successful!</p>
              <p className="text-sm">Your wallet has been credited successfully.</p>
            </div>
          </div>
        )}

        <div className="flex-1 flex gap-8 min-h-0 overflow-hidden items-center justify-center">
          {/* Main Area */}
          <div className="flex-1 h-full flex flex-col min-w-0">
            {!showSimulator ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-[3rem] shadow-sm border-dashed">
                <div className="h-24 w-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-8 ring-8 ring-blue-500/5">
                  <CreditCard className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Razorpay UI Tester</h3>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed max-w-md">
                  Verify the payment gateway integration by simulating real-world wallet top-up scenarios with live
                  backend connectivity.
                </p>
                <Button
                  onClick={handleStartRazorpay}
                  className="px-10 h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-sm shadow-blue-500/10 transition-all active:scale-[0.95] flex items-center gap-3"
                >
                  Test Razor pay
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-8 h-full items-center justify-center">
                {/* Controls */}
                <div className="w-[380px] shrink-0 space-y-6">
                  <Card className="border-slate-200 shadow-sm bg-white rounded-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        Payment Config
                      </CardTitle>
                      <CardDescription>Initiate a top-up transaction</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="amount"
                          className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1"
                        >
                          Amount (INR)
                        </Label>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                          <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pl-8 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 font-bold"
                            placeholder="100"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleTestPayment}
                        disabled={loading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-sm shadow-blue-100 transition-all active:scale-[0.98] gap-2 mt-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Pay Now
                          </>
                        )}
                      </Button>

                      <div className="pt-4 border-t flex items-center justify-between">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</div>
                        {paymentStatus === "IDLE" && (
                          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px]">
                            Idle
                          </Badge>
                        )}
                        {paymentStatus === "PENDING" && (
                          <Badge className="bg-amber-100 text-amber-700 rounded-full px-3 py-1 text-[10px] border-none">
                            Active
                          </Badge>
                        )}
                        {paymentStatus === "SUCCESS" && (
                          <Badge className="bg-emerald-100 text-emerald-700 rounded-full px-3 py-1 text-[10px] border-none">
                            Success
                          </Badge>
                        )}
                        {paymentStatus === "FAILED" && (
                          <Badge className="bg-rose-100 text-rose-700 rounded-full px-3 py-1 text-[10px] border-none">
                            Failed
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-sm bg-blue-50/50 text-blue-900 rounded-2xl overflow-hidden">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-black uppercase tracking-widest">Testing Context</span>
                      </div>
                      <div className="text-[11px] font-bold leading-relaxed opacity-80">
                        Transaction uses backend credentials. Ensure{" "}
                        <Badge variant="outline" className="text-[9px] border-blue-200 py-0 px-1.5 h-auto">
                          rzp_test_...
                        </Badge>{" "}
                        keys are active.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
