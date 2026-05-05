import { ShieldAlert, Home, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface AccessDeniedProps {
  /** "page" = full-viewport hero (for top-level route blocks)
   *  "section" = compact inline card (for individual cards/tables) */
  variant?: "page" | "section";
  /** Optional label for what the user can't access */
  section?: string;
  className?: string;
}

export function AccessDenied({ variant = "page", section, className }: AccessDeniedProps) {
  const navigate = useNavigate();

  // ─── Section variant ────────────────────────────────────────────────────────
  if (variant === "section") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-lg",
          "border border-dashed border-destructive/20 bg-destructive/5 text-center",
          "animate-in fade-in zoom-in-95 duration-300",
          className,
        )}
      >
        <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
          <Lock className="h-4 w-4 text-destructive" />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-foreground">Access Restricted</p>
          <p className="text-[11px] text-muted-foreground max-w-[200px] leading-tight">
            {section
              ? `You don't have permission to view ${section}.`
              : "You don't have permission to view this section."}
          </p>
        </div>
      </div>
    );
  }

  // ─── Page variant ────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[50vh] p-6 text-center",
        "animate-in fade-in zoom-in duration-500",
        className,
      )}
    >
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center relative z-10">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <div className="absolute inset-0 bg-destructive/20 blur-2xl opacity-20 animate-pulse" />
      </div>

      <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Access Denied</h2>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
        {section
          ? `You don't have the necessary permissions to access ${section}.`
          : "You don't have the necessary permissions to access this page."}{" "}
        Contact your system administrator if you believe this is a mistake.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-6 rounded-lg font-bold"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <Button
          size="sm"
          className="h-10 px-8 rounded-lg font-black"
          onClick={() => navigate(ROUTES.DASHBOARD)}
        >
          <Home className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
      </div>

      <div className="mt-10 p-3 rounded-xl bg-muted/30 border border-dashed border-border flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
        <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">
          SYSTEM GUARD: RESTRICTION ACTIVE
        </p>
      </div>
    </div>
  );
}
