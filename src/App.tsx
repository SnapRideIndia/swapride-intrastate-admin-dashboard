import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/api/query-client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthContext";
import { SocketProvider } from "@/providers/SocketContext";
import { SidebarProvider } from "@/providers/SidebarContext";
import { ProtectedRoute } from "@/features/auth";
import { ROUTES } from "@/constants/routes";
import { publicRoutes, protectedRoutes } from "@/routes/route-config";
import { SessionExpiredDialog } from "./components/SessionExpiredDialog";
import { ErrorBoundary } from "./components/ErrorBoundary";
import NoNetwork from "./pages/NoNetwork";
import BackendOffline from "./pages/BackendOffline";
import PaymentOverview from "./pages/PaymentOverview";
import TransactionLedger from "./pages/TransactionLedger";
import WalletManagement from "./pages/WalletManagement";
import PaymentAnalytics from "./pages/PaymentAnalytics";
import UniversalTracker from "./pages/UniversalTracker";
import Payments from "./pages/Payments";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const App = () => {
  useEffect(() => {
    // Permission Denied Handler
    const handlePermissionDenied = (event: any) => {
      toast({
        title: "Insufficient Permissions",
        description: event.detail.message || "You do not have permission to perform this action.",
        variant: "destructive",
      });
    };

    // API Error Handler
    const handleApiError = (event: any) => {
      const { type, message } = event.detail;
      toast({
        title: type === "timeout" ? "Request Timeout" : type === "server" ? "Server Error" : "Error",
        description: message,
        variant: "destructive",
      });
    };

    // Network Restored Handler
    const handleOnline = () => {
      toast({
        title: "Connection Restored",
        description: "You're back online!",
        variant: "default",
      });
    };

    window.addEventListener("permission-denied", handlePermissionDenied);
    window.addEventListener("api-error", handleApiError);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("permission-denied", handlePermissionDenied);
      window.removeEventListener("api-error", handleApiError);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <SocketProvider>
                <SessionExpiredDialog />
                <SidebarProvider>
                  <Routes>
                    {/* Error Pages (Public) */}
                    <Route path={ROUTES.NO_NETWORK} element={<NoNetwork />} />
                    <Route path={ROUTES.BACKEND_OFFLINE} element={<BackendOffline />} />

                    {/* Public Routes */}
                    {publicRoutes.map((route) => (
                      <Route key={route.path} path={route.path} element={route.element} />
                    ))}

                    {/* Protected Routes */}
                    {protectedRoutes.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={<ProtectedRoute>{route.element}</ProtectedRoute>}
                      />
                    ))}

                    {/* Nested Payments Routes */}
                    <Route
                      path={ROUTES.PAYMENTS}
                      element={
                        <ProtectedRoute>
                          <Payments />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to={ROUTES.PAYMENT_OVERVIEW} replace />} />
                      <Route path={ROUTES.PAYMENT_OVERVIEW} element={<PaymentOverview />} />
                      <Route path={ROUTES.TRANSACTIONS} element={<TransactionLedger />} />
                      <Route path={ROUTES.WALLET_MANAGEMENT} element={<WalletManagement />} />
                      <Route path={ROUTES.PAYMENT_ANALYTICS} element={<PaymentAnalytics />} />
                      <Route path={ROUTES.UNIVERSAL_TRACKER} element={<UniversalTracker />} />
                    </Route>

                    <Route path={ROUTES.STOPS} element={<Navigate to={ROUTES.ROUTES} replace />} />
                    <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                  </Routes>
                </SidebarProvider>
              </SocketProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
