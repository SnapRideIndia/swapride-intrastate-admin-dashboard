import React from "react";
import { Terminal } from "lucide-react";
import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { LogProvider, useLogs } from "./LogContext";
import { IntegrationLogs } from "./IntegrationLogs";
import { UserProfileButton } from "./UserProfileButton";
import { cn } from "@/lib/utils";

const TestModuleContent = () => {
  const { logs, clearLogs } = useLogs();
  const [isMinimized, setIsMinimized] = React.useState(false);

  return (
    <DashboardLayout>
      <div className="max-w-[1700px] mx-auto px-2 pt-0 pb-2 h-[calc(100vh-64px)] flex flex-col">
        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden items-stretch justify-center transition-all duration-500 ease-in-out">
          {/* Module Content */}
          <div
            className={cn(
              "h-full flex flex-col min-w-0 transition-all duration-700 ease-in-out flex-1",
              "scale-100 opacity-100",
            )}
          >
            <Outlet />
          </div>

          {/* Persistent Logs Sidebar */}
          <div
            className={cn(
              "h-full shrink-0 flex flex-col transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)",
              isMinimized ? "w-0 opacity-0 pointer-events-none translate-x-20" : "w-[480px] opacity-100",
            )}
          >
            {!isMinimized && (
              <IntegrationLogs logs={logs} onClear={clearLogs} onMinimize={() => setIsMinimized(true)} />
            )}
          </div>
        </div>
      </div>

      {/* ── Floating Dock ─────────────────────────────────────── */}
      {/* Single fixed container housing both the terminal + profile buttons */}
      <div className="fixed bottom-10 right-10 z-[9999] flex flex-col items-center gap-3">
        {/* Terminal toggle — only when sidebar is collapsed */}
        {isMinimized && (
          <button
            onClick={() => setIsMinimized(false)}
            title="Show Technical Terminal"
            className="relative h-[50px] w-[50px] rounded-full bg-slate-900 border border-slate-700 shadow-xl flex items-center justify-center text-blue-400 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-slate-900/20 animate-in zoom-in slide-in-from-bottom-4"
          >
            <Terminal className="h-5 w-5" />
          </button>
        )}

        {/* User profile button */}
        <UserProfileButton />
      </div>
    </DashboardLayout>
  );
};

export const TestModuleLayout = () => {
  return (
    <LogProvider>
      <TestModuleContent />
    </LogProvider>
  );
};

export default TestModuleLayout;
