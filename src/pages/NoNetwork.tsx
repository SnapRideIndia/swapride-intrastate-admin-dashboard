import { useEffect, useState, useRef } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function NoNetwork() {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const [isRetrying, setIsRetrying] = useState(false);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState(5);
  const hasMounted = useRef(false);

  // Auto-navigate back when network is restored
  useEffect(() => {
    // Don't navigate immediately on mount
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (isOnline) {
      const returnPath = sessionStorage.getItem("pre-network-error-path") || "/";
      sessionStorage.removeItem("pre-network-error-path");
      navigate(returnPath, { replace: true });
    }
  }, [isOnline, navigate]);

  // Auto-retry countdown
  useEffect(() => {
    if (!isOnline && autoRetryCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoRetryCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoRetryCountdown === 0) {
      handleRetry();
    }
  }, [autoRetryCountdown, isOnline]);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) {
        const returnPath = sessionStorage.getItem("pre-network-error-path") || "/";
        sessionStorage.removeItem("pre-network-error-path");
        navigate(returnPath, { replace: true });
      } else {
        setIsRetrying(false);
        setAutoRetryCountdown(5);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Animated WiFi Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative bg-white/10 backdrop-blur-lg rounded-full p-8 border border-white/20">
            <WifiOff className="h-24 w-24 text-white animate-bounce" strokeWidth={1.5} />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Oops! You're Offline</h1>
          <p className="text-lg text-white/80 max-w-sm mx-auto">
            Looks like you've lost your internet connection. Don't worry, we'll get you back online!
          </p>
        </div>

        {/* Status Indicator */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-center gap-3 text-white/90">
            <div className="h-3 w-3 rounded-full bg-red-400 animate-pulse" />
            <span className="font-medium">No Internet Connection</span>
          </div>
        </div>

        {/* Retry Button */}
        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            size="lg"
            className="bg-white text-purple-600 hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Retrying...
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

        {/* Fun Message */}
        <div className="pt-4">
          <p className="text-sm text-white/50 italic">
            "The internet is down. Time to go outside and see what the graphics are like out there!" 🌳
          </p>
        </div>
      </div>
    </div>
  );
}
