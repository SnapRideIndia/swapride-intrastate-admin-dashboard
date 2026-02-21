import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Smartphone,
  Users as UsersIcon,
  UserCheck,
  Bell,
  Info,
  AlertTriangle,
  Tag,
  CheckCircle2,
  XCircle,
  Megaphone,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { useCreateNotification } from "@/features/notifications/hooks/useNotifications";

type NotificationType = string;
type TargetGroup = "ALL" | "USERS" | "DRIVERS" | "ADMINS";

export default function CreateNotification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("SYSTEM_ALERT");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [targetType, setTargetType] = useState<"BROADCAST" | "INDIVIDUAL">("BROADCAST");
  const [targetGroup, setTargetGroup] = useState<TargetGroup>("USERS");

  const createMutation = useCreateNotification();

  const handleSend = () => {
    if (!title || !content) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate(
      {
        title,
        content,
        type,
        priority: priority as "LOW" | "MEDIUM" | "HIGH",
        targetGroup: targetType === "BROADCAST" ? "ALL_USERS" : "INDIVIDUAL", // Simplified for now
        // relatedId and relatedType handling could be added here
      },
      {
        onSuccess: () => {
          toast.success("Notification broadcasted successfully!");
          navigate(ROUTES.NOTIFICATIONS);
        },
        onError: () => {
          toast.error("Failed to send notification");
        },
      },
    );
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Broadcast Notification"
        subtitle="Reach your users and drivers instantly via push alerts."
        backUrl={ROUTES.NOTIFICATIONS}
        actions={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(ROUTES.NOTIFICATIONS)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
              onClick={handleSend}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Broadcast Now
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Main Form Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden ring-1 ring-gray-100">
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <NotificationTypeIcon type={type} />
                Message Details
              </CardTitle>
              <CardDescription>Compose the content of your notification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">
                  Notification Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Traffic Alert: Major delay in Sector 5"
                  className="h-11 rounded-xl"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-[10px] text-gray-400">
                  Keep it under 50 characters for best display on mobile locks-creens.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-semibold">
                  Message Body
                </Label>
                <Textarea
                  id="content"
                  placeholder="Enter the full message details here..."
                  className="min-h-[120px] rounded-xl resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Category Type</Label>
                  <CreatableSelect
                    options={[
                      { value: "SYSTEM_ALERT", label: "System Alert" },
                      { value: "TRIP_UPDATE", label: "Trip Update" },
                      { value: "PROMOTIONAL", label: "Promotion / Marketing" },
                      { value: "PAYMENT_SUCCESS", label: "Payment & Ledger" },
                    ]}
                    value={type}
                    onChange={setType}
                    onCreate={(val) => setType(val)}
                    placeholder="Select or type custom..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Priority Level</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low (Silent)</SelectItem>
                      <SelectItem value="MEDIUM">Medium (Default)</SelectItem>
                      <SelectItem value="HIGH">High (Urgent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden ring-1 ring-gray-100">
            <CardHeader className="bg-gray-50/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-gray-500" />
                Target Audience
              </CardTitle>
              <CardDescription>Who should receive this message?</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                <Button
                  variant={targetType === "BROADCAST" ? "default" : "ghost"}
                  className={`h-9 px-6 rounded-lg text-sm transition-all ${targetType === "BROADCAST" ? "shadow-sm" : "text-gray-500"}`}
                  onClick={() => setTargetType("BROADCAST")}
                >
                  Broadcast
                </Button>
                <Button
                  variant={targetType === "INDIVIDUAL" ? "default" : "ghost"}
                  className={`h-9 px-6 rounded-lg text-sm transition-all ${targetType === "INDIVIDUAL" ? "shadow-sm" : "text-gray-500"}`}
                  onClick={() => setTargetType("INDIVIDUAL")}
                >
                  Direct Message
                </Button>
              </div>

              {targetType === "BROADCAST" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(["USERS", "DRIVERS", "ADMINS", "ALL"] as TargetGroup[]).map((group) => (
                      <button
                        key={group}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2
                            ${
                              targetGroup === group
                                ? "border-blue-500 bg-blue-50/50 text-blue-700"
                                : "border-gray-100 hover:border-gray-200 text-gray-500"
                            }`}
                        onClick={() => setTargetGroup(group)}
                      >
                        <GroupIcon group={group} active={targetGroup === group} />
                        <span className="text-xs font-bold uppercase tracking-wider">{group}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 italic">
                    This message will be sent to every registered device in the {targetGroup.toLowerCase()} segment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 bg-orange-50/30 border border-orange-100/50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 text-orange-800">
                    <AlertTriangle className="h-5 w-5" />
                    <p className="text-sm font-medium italic">
                      Individual targeting feature coming in next sprint. Please use broadcasts for now.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-gray-950 p-4 sticky top-6 ring-8 ring-gray-900 overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-full z-10" />

            <div className="bg-gray-100 rounded-[2rem] aspect-[9/19] relative overflow-hidden flex flex-col pt-12 p-3">
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-blue-200/50 to-transparent pointer-events-none" />

              {/* Notification Banner Mock */}
              <div className="mt-4 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg ring-1 ring-black/5 animate-in slide-in-from-top duration-500">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center">
                      <img src="/logo-icon.png" alt="Logo" className="h-4 w-4 brightness-0 invert" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">SwapRide</span>
                  </div>
                  <span className="text-[10px] text-gray-400">now</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-900 line-clamp-1">{title || "Notification Title"}</p>
                  <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                    {content || "Your message content will appear here as the user sees it on their device."}
                  </p>
                </div>
              </div>

              <div className="flex-1" />

              {/* Bottom Bar Mock */}
              <div className="h-1 w-24 bg-gray-300 rounded-full mx-auto mb-2" />
            </div>
          </Card>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
            <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Preview Mode
            </h4>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              This preview shows a standard iOS/Android push notification widget. Actual appearance varies slightly by
              device OS version.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function NotificationTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "SYSTEM_ALERT":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "TRIP_UPDATE":
      return <Info className="h-5 w-5 text-blue-500" />;
    case "PROMOTIONAL":
      return <Tag className="h-5 w-5 text-orange-500" />;
    case "PAYMENT_SUCCESS":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
}

function GroupIcon({ group, active }: { group: TargetGroup; active: boolean }) {
  const cn = `h-6 w-6 ${active ? "text-blue-600" : "text-gray-400"}`;
  switch (group) {
    case "USERS":
      return <UsersIcon className={cn} />;
    case "DRIVERS":
      return <Smartphone className={cn} />;
    case "ADMINS":
      return <UserCheck className={cn} />;
    default:
      return <Bell className={cn} />;
  }
}
