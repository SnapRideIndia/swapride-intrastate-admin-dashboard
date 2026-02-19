import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { socketService } from "@/lib/socket-service";

interface SocketContextType {
  isConnected: boolean;
  socketService: typeof socketService;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
      if (token) {
        socketService.connect(token);
      }
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  const value = {
    isConnected: socketService.isConnected,
    socketService,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
