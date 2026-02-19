import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Bell,
  Send,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Info,
  Zap,
  Globe,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/features/notifications/api/notification.service";

const TEMPLATES = [
  {
    id: "system-alert",
    name: "System Alert",
    title: "[TEST] Urgent: Maintenance Required",
    content: "This is a test notification to verify critical system alerts. Please ignore if you see this.",
    type: "SYSTEM_ALERT",
    priority: "HIGH",
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    id: "trip-update",
    name: "Trip Update",
    title: "[TEST] Trip #1092 Status Change",
    content: "Route assignment has been updated for Trip #1092. Driver check-in required.",
    type: "TRIP_UPDATE",
    priority: "MEDIUM",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    id: "promotional",
    name: "Promo Blast",
    title: "[TEST] New Seasonal Offer!",
    content: "Check out the new flat 50% discount on suburban routes starting this Monday.",
    type: "PROMOTIONAL",
    priority: "LOW",
    icon: Globe,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
];

export default function FcmTester() {
  const [token, setToken] = useState<string>("");
  const [permission, setPermission] = useState<string>("default");
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: TEMPLATES[0].title,
    content: TEMPLATES[0].content,
    type: TEMPLATES[0].type,
    priority: TEMPLATES[0].priority,
  });

  useEffect(() => {
    // Get stored token from persistence
    const storedToken = localStorage.getItem("fcm_token");
    if (storedToken) setToken(storedToken);

    // Initial permission state
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success("Token copied to clipboard!");
  };

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setFormData({
        title: template.title,
        content: template.content,
        type: template.type,
        priority: template.priority,
      });
      toast.info(`Applied ${template.name} template`);
    }
  };

  const handleDispatch = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Please fill in both title and content");
      return;
    }

    try {
      setLoading(true);
      await notificationService.create({
        ...formData,
        targetGroup: "ADMINS",
      });
      toast.success("Test broadcast dispatched to Admins!");
    } catch (error) {
      toast.error("Failed to dispatch test notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 p-6 animate-in fade-in duration-500">
        <PageHeader
          title="FCM Test Module"
          subtitle="Diagnostic tool for verifying push notification delivery and device registration."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Diagnostics & Templates */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border border-gray-100 bg-gray-50/30 shadow-none rounded-2xl overflow-hidden">
              <CardHeader className="p-4 bg-white border-b border-gray-100">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Device Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-0">
                <div className="flex items-center justify-between p-4 bg-white/50 border-b border-gray-50">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight">Status</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-bold border-none h-6",
                      permission === "granted" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
                    )}
                  >
                    {permission.toUpperCase()}
                  </Badge>
                </div>
                <div className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">FCM Token</span>
                    <button
                      onClick={copyToken}
                      className="text-[10px] font-bold text-primary hover:text-primary-600 flex items-center gap-1 transition-colors"
                    >
                      {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {isCopied ? "COPIED" : "COPY"}
                    </button>
                  </div>
                  <div className="bg-gray-50/50 p-4 rounded-xl font-mono text-[10px] break-all h-28 overflow-y-auto border border-gray-100 text-gray-500 leading-relaxed scrollbar-hide">
                    {token || "No token detected. Please refresh or check browser compatibility."}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-none rounded-2xl overflow-hidden">
              <CardHeader className="p-4 bg-white border-b border-gray-100">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Quick Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 bg-white">
                <div className="grid grid-cols-1 gap-1">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t.id)}
                      className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:bg-gray-50 transition-all text-left"
                    >
                      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", t.bg)}>
                        <t.icon className={cn("h-4 w-4", t.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-gray-900 uppercase tracking-tight">{t.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium">{t.priority} Priority</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Dispatcher */}
          <div className="lg:col-span-8 h-full">
            <Card className="border border-gray-100 shadow-none rounded-2xl overflow-hidden h-full flex flex-col bg-white">
              <CardHeader className="bg-gray-50/30 border-b border-gray-100 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 tracking-tight">Test Dispatcher</CardTitle>
                    <CardDescription className="text-xs font-medium">
                      Send a test notification to all Admin subscribers
                    </CardDescription>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6 flex-1">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Display Title
                    </Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="h-11 rounded-lg border-gray-100 bg-gray-50/30 focus:bg-white transition-all font-semibold text-sm focus-visible:ring-primary/20"
                      placeholder="e.g. [TEST] System Alert"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Message Content
                    </Label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full min-h-[100px] p-4 rounded-lg border border-gray-100 bg-gray-50/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-medium text-sm resize-none"
                      placeholder="Describe the test purpose..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</Label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-gray-100 bg-gray-50/30 focus:bg-white transition-all text-sm font-bold appearance-none bg-no-repeat bg-[right_1rem_center] focus:ring-1 focus:ring-primary/20 outline-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundSize: "1rem",
                        }}
                      >
                        <option value="SYSTEM_ALERT">System Alert</option>
                        <option value="TRIP_UPDATE">Trip Update</option>
                        <option value="PROMOTIONAL">Marketing</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Priority Level
                      </Label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-gray-100 bg-gray-50/30 focus:bg-white transition-all text-sm font-bold appearance-none bg-no-repeat bg-[right_1rem_center] focus:ring-1 focus:ring-primary/20 outline-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundSize: "1rem",
                        }}
                      >
                        <option value="HIGH">High (Immediate)</option>
                        <option value="MEDIUM">Medium (Balanced)</option>
                        <option value="LOW">Low (Background)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleDispatch}
                    disabled={loading}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-bold transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? "Dispatching..." : "Send Test Broadcast"}
                  </Button>
                </div>

                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    This dispatches a live FCM message to all administrators on the{" "}
                    <strong className="text-primary">admins</strong> topic. Please use responsibly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
