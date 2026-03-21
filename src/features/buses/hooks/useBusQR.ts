import { useState, useEffect } from "react";
import { busService } from "../api/bus.service";
import { toast } from "@/hooks/use-toast";

export function useBusQR(busId: string) {
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQRToken = async () => {
    setIsLoading(true);
    try {
      const result = await busService.getBusQR(busId);
      setQrToken(result.qrToken);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Could not fetch QR token",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (busId) fetchQRToken();
  }, [busId]);

  return { qrToken, isLoading, refetch: fetchQRToken };
}
