import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "@/features/auth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, KeyRound, ShieldCheck, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ROUTES } from "@/constants/routes";
import { AuthLayout } from "@/layouts/AuthLayout";

type Step = "mobile" | "otp" | "newPassword" | "success";

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>("mobile");
  const [isLoading, setIsLoading] = useState(false);

  // Step 1
  const [mobile, setMobile] = useState("");

  // Step 2
  const [otp, setOtp] = useState("");
  const [ttl, setTtl] = useState(300);
  const [verificationId, setVerificationId] = useState("");

  // Step 3
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSendOtp = async () => {
    if (!/^(\+91)?[0-9]{10}$/.test(mobile)) {
      toast({ title: "Invalid mobile number", description: "Enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(mobile);
      setTtl(res.ttl);
      setStep("otp");
      toast({ title: "OTP Sent", description: `An OTP has been sent to +91 ${mobile}. Valid for ${res.ttl / 60} minutes.` });
    } catch (err: any) {
      toast({
        title: "Failed to send OTP",
        description: err?.response?.data?.message || "Admin with the provided number not found.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({ title: "Enter the 6-digit OTP", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await authService.verifyForgotPasswordOtp(mobile, otp);
      setVerificationId(res.verificationId);
      setStep("newPassword");
    } catch (err: any) {
      toast({
        title: "Invalid OTP",
        description: err?.response?.data?.message || "The OTP is incorrect or has expired.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetForgotPassword(verificationId, newPassword);
      setStep("success");
    } catch (err: any) {
      toast({
        title: "Reset failed",
        description: err?.response?.data?.message || "Verification ID expired. Please restart the flow.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stepMeta: Record<Step, { icon: React.ReactNode; title: string; description: string }> = {
    mobile: {
      icon: <Phone className="h-5 w-5 text-primary" />,
      title: "Forgot Password",
      description: "Enter your registered mobile number to receive an OTP.",
    },
    otp: {
      icon: <ShieldCheck className="h-5 w-5 text-primary" />,
      title: "Verify OTP",
      description: `Enter the 6-digit OTP sent to +91 ${mobile}.`,
    },
    newPassword: {
      icon: <KeyRound className="h-5 w-5 text-primary" />,
      title: "Set New Password",
      description: "Choose a strong password with at least 8 characters.",
    },
    success: {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      title: "Password Reset",
      description: "Your password has been updated successfully.",
    },
  };

  const meta = stepMeta[step];

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
            {meta.icon}
            <h2 className="text-2xl font-bold text-foreground">{meta.title}</h2>
          </div>
          <p className="text-muted-foreground">{meta.description}</p>
        </div>

        {/* Step indicator */}
        {step !== "success" && (
          <div className="flex gap-1.5 mb-6">
            {(["mobile", "otp", "newPassword"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  ["mobile", "otp", "newPassword"].indexOf(step) >= i
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        )}

        {step === "mobile" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fp-mobile">Mobile Number</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
                <Input
                  id="fp-mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className="pl-12 h-11"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                />
              </div>
            </div>
            <Button className="w-full h-11" onClick={handleSendOtp} disabled={isLoading || mobile.length !== 10}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...</> : "Send OTP"}
            </Button>
            
            <div className="text-center">
              <Link to={ROUTES.LOGIN} className="text-sm flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
              </Link>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-center block">Enter OTP</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                OTP expires in {Math.floor(ttl / 60)} minutes
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-11" onClick={() => setStep("mobile")} disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button className="flex-1 h-11" onClick={handleVerifyOtp} disabled={isLoading || otp.length !== 6}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify OTP"}
              </Button>
            </div>
            <div className="text-center">
              <Button
                variant="link"
                className="text-xs text-muted-foreground hover:text-primary p-0"
                onClick={() => { setOtp(""); handleSendOtp(); }}
                disabled={isLoading}
              >
                Resend OTP
              </Button>
            </div>
          </div>
        )}

        {step === "newPassword" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fp-new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="fp-new-password"
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className="h-11"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button" variant="ghost" size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fp-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="fp-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  className="h-11"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                />
                <Button
                  type="button" variant="ghost" size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
            <Button
              className="w-full h-11 mt-4"
              onClick={handleResetPassword}
              disabled={isLoading || newPassword.length < 8 || newPassword !== confirmPassword}
            >
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</> : "Reset Password"}
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-6 text-center py-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <p className="text-muted-foreground">
              Your password has been reset successfully. All existing sessions have been invalidated. Please log in with your new password.
            </p>
            <Link to={ROUTES.LOGIN} className="block mt-4">
              <Button className="w-full h-11">
                Back to Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
