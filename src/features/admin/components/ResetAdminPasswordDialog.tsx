import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { adminService } from "../api/admin.service";
import { useToast } from "@/hooks/use-toast";
import { AdminUser } from "@/types";

interface ResetAdminPasswordDialogProps {
  admin: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetAdminPasswordDialog({ admin, open, onOpenChange }: ResetAdminPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    if (!admin) return;
    if (newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      await adminService.resetPassword(admin.id, newPassword);
      toast({ title: `Password reset for ${admin.name} successfully` });
      setNewPassword("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Enter a new password for <strong>{admin?.name}</strong> ({admin?.email}).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoFocus
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReset} disabled={isLoading || !newPassword}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
