import { useEffect, useState } from "react";
import { ServerOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function BackendOffline() {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState(10);

  // Auto-retry countdown
  useEffect(() => {
    if (autoRetryCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoRetryCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoRetryCountdown === 0) {
      handleRetry();
    }
  }, [autoRetryCountdown]);

  const handleRetry = async () => {
    setIsRetrying(true);

    try {
      // Try to ping the backend - any response means it's online
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/auth/me`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      // Any response (even 401, 404) means backend is online
      // Only network errors mean backend is offline
      const returnPath = sessionStorage.getItem("pre-network-error-path") || "/";
      sessionStorage.removeItem("pre-network-error-path");
      navigate(returnPath, { replace: true });
    } catch (error) {
      // Network error - backend still offline
      setIsRetrying(false);
      setAutoRetryCountdown(10);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Animated Server Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative bg-white/10 backdrop-blur-lg rounded-full p-8 border border-white/20">
            <ServerOff className="h-24 w-24 text-white animate-bounce" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Backend Server Offline</h1>
          <p className="text-lg text-white/80 max-w-sm mx-auto">
            The backend server is currently not responding. Please make sure the server is running.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-center gap-3 text-white/90">
            <div className="h-3 w-3 rounded-full bg-orange-400 animate-pulse" />
            <span className="font-medium">Server Not Responding</span>
          </div>
        </div>

        {/* Retry Button */}
        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            size="lg"
            className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Again
              </>
            )}
          </Button>

          {!isRetrying && autoRetryCountdown > 0 && (
            <p className="text-sm text-white/60">Auto-retry in {autoRetryCountdown} seconds...</p>
          )}
        </div>

        {/* User-friendly Message */}
        <div className="pt-4">
          <p className="text-sm text-white/50">
            Our server is taking a quick break. We'll keep trying to reconnect! ☕
          </p>
        </div>
      </div>
    </div>
  );
}
