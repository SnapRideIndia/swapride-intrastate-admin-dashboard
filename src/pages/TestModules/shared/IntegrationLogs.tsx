import { Info, Terminal, Trash2, Minimize2, Maximize2, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Log } from "../types";

interface IntegrationLogsProps {
  logs: Log[];
  onClear: () => void;
  onMinimize: () => void;
}

export function IntegrationLogs({ logs, onClear, onMinimize }: IntegrationLogsProps) {
  return (
    <Card className="flex-1 border-slate-200 shadow-sm bg-slate-950 text-slate-200 overflow-hidden font-mono flex flex-col h-full min-h-[400px]">
      <CardHeader className="border-b border-slate-800 bg-slate-900/50 py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="h-4 w-4 text-blue-400" />
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Technical Terminal
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="h-8 w-8 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
              title="Clear Logs"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-slate-800 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={onMinimize}
              className="h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-800 transition-all active:scale-90"
              title="Minimize Terminal"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs italic gap-2 p-6 text-center">
            <Info className="h-8 w-8 opacity-20" />
            <p>No activity logged yet. Start a simulation to see technical data flow.</p>
          </div>
        ) : (
          <div className="p-4 space-y-1.5">
            {logs.map((log, i) => (
              <div
                key={i}
                className="text-[11px] leading-relaxed animate-in fade-in slide-in-from-left-1 duration-200 group"
              >
                <span className="text-slate-500 mr-2 tabular-nums">[{log.time}]</span>
                <span
                  className={cn(
                    "font-medium",
                    log.type === "success" && "text-emerald-400",
                    log.type === "error" && "text-rose-400 font-bold",
                    log.type === "request" && "text-blue-400",
                    log.type === "response" && "text-amber-400",
                    log.type === "info" && "text-blue-200",
                  )}
                >
                  {log.type === "request" && ">>> "}
                  {log.type === "response" && "<<< "}
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
