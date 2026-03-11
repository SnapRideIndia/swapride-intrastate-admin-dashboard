import { useState, useRef } from "react";
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
  Loader2,
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  Sparkles,
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
import { useCreateNotification, useUploadNotificationMedia } from "@/features/notifications/hooks/useNotifications";
import { cn } from "@/lib/utils";

type TargetGroup = "ALL" | "USERS" | "DRIVERS" | "ADMINS";

interface NotificationImage {
  file?: File;
  url: string;
  isUploaded: boolean;
}

export default function CreateNotification() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("SYSTEM_ALERT");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [targetType, setTargetType] = useState<"BROADCAST" | "INDIVIDUAL">("BROADCAST");
  const [targetGroup, setTargetGroup] = useState<TargetGroup>("USERS");
  const [images, setImages] = useState<NotificationImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = useCreateNotification();
  const uploadMutation = useUploadNotificationMedia();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: NotificationImage[] = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isUploaded: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = [...prev];
      if (!updated[index].isUploaded) {
        URL.revokeObjectURL(updated[index].url);
      }
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSend = async () => {
    if (!title || !content) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrls: string[] = [];

      // Upload images that haven't been uploaded yet
      for (const img of images) {
        if (!img.isUploaded && img.file) {
          const result = await uploadMutation.mutateAsync(img.file);
          uploadedUrls.push(result.url);
        } else {
          uploadedUrls.push(img.url);
        }
      }

      createMutation.mutate(
        {
          title,
          content,
          type,
          priority: priority as "LOW" | "MEDIUM" | "HIGH",
          targetGroup: targetType === "BROADCAST" ? targetGroup : "INDIVIDUAL",
          metadata: {
            images: uploadedUrls,
          },
        },
        {
          onSuccess: () => {
            toast.success("Notification broadcasted successfully!");
            navigate(ROUTES.NOTIFICATIONS);
          },
        },
      );
    } catch (error) {
      console.error("Broadcast error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Broadcast Notification"
        subtitle="Reach your users and drivers instantly via push alerts."
        backUrl={ROUTES.NOTIFICATIONS}
        actions={
          <div className="flex justify-end gap-3">
            <Button variant="outline" className="rounded-xl border-gray-200" onClick={() => navigate(ROUTES.NOTIFICATIONS)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 min-w-[140px] rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
              onClick={handleSend}
              disabled={createMutation.isPending || isUploading}
            >
              {createMutation.isPending || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isUploading ? "Uploading..." : "Broadcasting..."}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 space-y-5">
          <Card className="border border-gray-200/60 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/30 pb-3 border-b border-gray-100/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <NotificationTypeIcon type={type} />
                Message Composition
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">Define the visual and textual content of your alert</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-bold text-gray-700 ml-1">
                  Notification Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. ✨ New Luxury Bus Added to Route 5"
                  className="h-12 rounded-2xl border-gray-100 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-[10px] text-gray-400 ml-1">
                  💡 Keep it punchy! Under 50 characters works best for mobile lockscreens.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-bold text-gray-700 ml-1">
                  Message Body
                </Label>
                <Textarea
                  id="content"
                  placeholder="Enter the full details of your announcement here..."
                  className="min-h-[140px] rounded-[1.5rem] border-gray-100 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none bg-white p-4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700 ml-1">Category Type</Label>
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
                  <Label className="text-sm font-bold text-gray-700 ml-1">Priority Level</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="h-12 rounded-2xl border-gray-100 bg-white">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      <SelectItem value="LOW" className="rounded-lg">Low (Silent)</SelectItem>
                      <SelectItem value="MEDIUM" className="rounded-lg">Medium (Default)</SelectItem>
                      <SelectItem value="HIGH" className="rounded-lg">High (Urgent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200/60 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-gray-50/50 pb-3 border-b border-gray-100/50 flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <ImageIcon className="h-5 w-5 text-purple-500" />
                  Rich Media (Optional)
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">Add impact with multiple images or posters</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-3 rounded-xl border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-4 w-4 mr-1 text-gray-400 group-hover:text-blue-500" /> 
                Add
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
              />

              {images.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden ring-1 ring-gray-200 bg-gray-50">
                      <img src={img.url} alt="upload" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => removeImage(idx)}
                          className="h-7 w-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {idx === 0 && (
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-blue-600/90 backdrop-blur-sm text-[8px] font-bold text-white uppercase tracking-wider">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-gray-400 hover:text-blue-500 group"
                  >
                    <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Add</span>
                  </button>
                </div>
              ) : (
                <div 
                  className="py-10 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 hover:bg-blue-50/30 hover:border-blue-200 cursor-pointer transition-all group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="h-7 w-7 text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-600">Drag & Drop or Selection</p>
                  <p className="text-[10px] mt-1">PNG, JPG or WebP (Max 5MB each)</p>
                </div>
              )}

              <div className="mt-6 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 flex items-start gap-4">
                <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-amber-900">✨ Pro Tip for Best Quality</h5>
                  <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
                    For faster delivery on mobile data, upload <strong>optimized images</strong> (under 500KB). 
                    Balanced compression ensures your users see crisp visuals without long loading times.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl overflow-hidden ring-1 ring-gray-100 bg-white/50 backdrop-blur-xl">
            <CardHeader className="bg-gray-50/30 pb-3 border-b border-gray-100/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <UsersIcon className="h-5 w-5 text-emerald-500" />
                Target Audience
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">Segment your message for better engagement</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex p-1.5 bg-gray-100/80 rounded-2xl w-fit backdrop-blur-sm">
                <Button
                  variant={targetType === "BROADCAST" ? "default" : "ghost"}
                  className={cn(
                    "h-10 px-8 rounded-xl text-sm font-bold transition-all",
                    targetType === "BROADCAST" ? "bg-white text-blue-600 shadow-sm hover:bg-white" : "text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => setTargetType("BROADCAST")}
                >
                  Global Broadcast
                </Button>
                <Button
                  variant={targetType === "INDIVIDUAL" ? "default" : "ghost"}
                  className={cn(
                    "h-10 px-8 rounded-xl text-sm font-bold transition-all",
                    targetType === "INDIVIDUAL" ? "bg-white text-blue-600 shadow-sm hover:bg-white" : "text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => setTargetType("INDIVIDUAL")}
                >
                  Targeted DM
                </Button>
              </div>

              {targetType === "BROADCAST" ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(["USERS", "DRIVERS", "ADMINS", "ALL"] as TargetGroup[]).map((group) => (
                      <button
                        key={group}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 relative overflow-hidden group",
                          targetGroup === group
                            ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-[0_4px_20px_rgba(59,130,246,0.08)]"
                            : "border-gray-50 bg-white hover:border-gray-200 text-gray-400"
                        )}
                        onClick={() => setTargetGroup(group)}
                      >
                        {targetGroup === group && (
                          <div className="absolute top-0 right-0 p-1 bg-blue-500 rounded-bl-lg text-white">
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                        )}
                        <GroupIcon group={group} active={targetGroup === group} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{group}</span>
                      </button>
                    ))}
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100/50 p-3 rounded-xl">
                    <p className="text-[10px] text-blue-600 font-medium text-center">
                      📣 This blast will reach <strong>every active device</strong> in the {targetGroup.toLowerCase()} segment.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 bg-purple-50/30 border border-purple-100/50 p-5 rounded-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-4 text-purple-800">
                    <div className="h-10 w-10 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Individual Targeting Restricted</p>
                      <p className="text-[11px] opacity-80 mt-1"> Direct messaging is currently under maintenance. Please use the segment broadcaster for now.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Sidebar */}
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-sm space-y-2 relative overflow-hidden group border border-blue-400/20">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
            <h4 className="text-xs font-black text-white flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Real-time Preview
            </h4>
            <p className="text-[10.5px] text-blue-50/80 leading-relaxed font-medium">
              Simulated high-resolution mobile notification widget. The first image serves as the push tray visual.
            </p>
          </div>

          <Card className="border border-gray-200/60 shadow-sm rounded-[2.5rem] bg-gray-950 p-4 sticky top-6 ring-[10px] ring-gray-900/40 overflow-hidden">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-full z-10 flex items-center justify-center">
              <div className="h-1 w-10 bg-white/10 rounded-full" />
            </div>

            <div className="bg-[#f2f2f7] rounded-[2rem] aspect-[9/18.5] relative overflow-hidden flex flex-col pt-12 p-3">
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
              
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-[10px] font-bold text-gray-900">9:41</span>
                <div className="flex gap-1">
                  <div className="w-3.5 h-2 rounded-sm border-[0.5px] border-gray-900" />
                </div>
              </div>

              <div className="bg-white/75 backdrop-blur-2xl rounded-2xl p-3.5 shadow-xl ring-1 ring-black/[0.05] animate-in slide-in-from-top-full duration-700 ease-out">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center p-1 shadow-md shadow-blue-200">
                      <img src="/logo-icon.png" alt="Logo" className="brightness-0 invert object-contain" />
                    </div>
                    <div className="flex flex-col -space-y-0.5">
                      <span className="text-[9px] font-black text-gray-900 uppercase tracking-tighter leading-none">SwapRide</span>
                      <span className="text-[7px] text-gray-400 font-bold uppercase tracking-tight leading-none">System</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 font-bold">now</span>
                </div>
                
                <div className="space-y-0.5">
                  <p className="text-[12px] font-black text-gray-900 leading-tight">{title || "Notification Title"}</p>
                  <p className="text-[10.5px] text-gray-600 line-clamp-2 leading-relaxed font-medium">
                    {content || "Your message will illuminate the user's screen here."}
                  </p>
                </div>

                {images.length > 0 && (
                  <div className="mt-2.5 aspect-video rounded-xl overflow-hidden ring-1 ring-black/5 shadow-inner">
                    <img src={images[0].url} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex-1" />

              <div className="h-1.5 w-32 bg-gray-300 rounded-full mx-auto mb-2 opacity-30" />
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function NotificationTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "SYSTEM_ALERT":
      return <AlertTriangle className="h-6 w-6 text-red-500" />;
    case "TRIP_UPDATE":
      return <Info className="h-6 w-6 text-blue-500" />;
    case "PROMOTIONAL":
      return <Tag className="h-6 w-6 text-orange-500" />;
    case "PAYMENT_SUCCESS":
      return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    default:
      return <Bell className="h-6 w-6 text-gray-500" />;
  }
}

function GroupIcon({ group, active }: { group: TargetGroup; active: boolean }) {
  const cnStr = cn("h-8 w-8 transition-all duration-500", active ? "scale-110" : "opacity-50");
  switch (group) {
    case "USERS":
      return <UsersIcon className={cn(cnStr, active ? "text-blue-600" : "text-gray-400")} />;
    case "DRIVERS":
      return <Smartphone className={cn(cnStr, active ? "text-indigo-600" : "text-gray-400")} />;
    case "ADMINS":
      return <UserCheck className={cn(cnStr, active ? "text-purple-600" : "text-gray-400")} />;
    default:
      return <Sparkles className={cn(cnStr, active ? "text-amber-500" : "text-gray-400")} />;
  }
}
