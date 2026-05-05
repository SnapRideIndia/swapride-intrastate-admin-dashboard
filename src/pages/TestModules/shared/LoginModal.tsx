import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { TEST_USER_TOKEN_KEY, TEST_USER_REFRESH_TOKEN_KEY } from "../types";
import { SimulatorLogger } from "../shared/SimulatorLogger";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tokens: { accessToken: string; refreshToken: string }) => void;
  logger: SimulatorLogger;
  description?: string;
}

export function LoginModal({ isOpen, onClose, onSuccess, logger, description }: LoginModalProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setIsLoading(true);
    setError(null);
    logger.admin(`Authenticating user session for: ${identifier}`);

    try {
      const response = await apiClient.post(API_ENDPOINTS.TEST.AUTH.LOGIN, {
        identifier,
        password,
      });

      // API structure check: backend says usersService.login(dto) returns tokens
      const { accessToken, refreshToken } = response.data;

      if (accessToken && refreshToken) {
        logger.success("Session verified. Access granted.");
        localStorage.setItem(TEST_USER_TOKEN_KEY, accessToken);
        localStorage.setItem(TEST_USER_REFRESH_TOKEN_KEY, refreshToken);
        window.dispatchEvent(new CustomEvent("test-user-logged-in", { detail: { accessToken } }));
        onSuccess({ accessToken, refreshToken });
        onClose();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Login failed";
      // API error already logged if using testApiClient, but Login uses base apiClient
      // so we log it manually or just let the error show in UI.
      // Base apiClient doesn't have the simulator logger hooked up usually.
      logger.error(`Authentication failed: ${errorMsg}`);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-primary/5 p-8 pb-6 text-center border-b border-primary/10">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-4 ring-primary/5">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black text-foreground tracking-tight">User Login</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium mt-1">
            {description || "Sign in to start the simulation"}
          </DialogDescription>
        </div>

        <form onSubmit={handleLogin} className="p-8 pt-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-200">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-xs font-bold leading-tight">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
                Email or Mobile
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  placeholder="name@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-11 h-12 bg-secondary/50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 font-bold text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
                Password
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 bg-secondary/50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 font-bold text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-[0.98] gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <DialogFooter className="p-8 pt-0 flex justify-center border-t border-border/50">
          <p className="text-[10px] text-muted-foreground font-bold tracking-tight">FOR TEST SIMULATION ONLY v1.0</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
