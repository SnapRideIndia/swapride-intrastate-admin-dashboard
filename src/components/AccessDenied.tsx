import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="h-24 w-24 rounded-3xl bg-red-50 flex items-center justify-center relative z-10">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>
        <div className="absolute inset-0 bg-red-200 blur-2xl opacity-20 animate-pulse" />
      </div>

      <h2 className="text-3xl font-black text-foreground mb-3 tracking-tight">Access Denied</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
        You don't have the necessary permissions to access this section. Please contact your system administrator if you
        believe this is a mistake.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          className="h-12 px-8 rounded-xl font-bold border-border/50 hover:bg-muted/50"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <Button
          className="h-12 px-10 rounded-xl font-black shadow-lg shadow-primary/20"
          onClick={() => navigate(ROUTES.DASHBOARD)}
        >
          <Home className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
      </div>

      <div className="mt-12 p-4 rounded-2xl bg-muted/30 border border-dashed border-border flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
          System Guard: Restriction Active
        </p>
      </div>
    </div>
  );
}
