import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Log } from "../types";

interface LogContextType {
  logs: Log[];
  addLog: (msg: string, type?: Log["type"]) => void;
  clearLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const LogProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<Log[]>([]);

  const addLog = useCallback((msg: string, type: Log["type"] = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, msg, type }, ...prev]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return <LogContext.Provider value={{ logs, addLog, clearLogs }}>{children}</LogContext.Provider>;
};

export const useLogs = () => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error("useLogs must be used within a LogProvider");
  }
  return context;
};
