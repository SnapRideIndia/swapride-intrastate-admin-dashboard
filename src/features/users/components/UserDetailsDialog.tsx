import { User } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Phone, Mail, Droplets, ShoppingBag, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsDialog = ({ user, open, onOpenChange }: UserDetailsDialogProps) => {
  if (!user) return null;

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case "ACTIVE":
        return "badge-success";
      case "BLOCKED":
        return "badge-error";
      case "SUSPENDED":
        return "badge-warning";
      default:
        return "badge-info";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/10">
              <AvatarImage src={user.profileUrl || ""} alt={user.fullName} />
              <AvatarFallback className="text-lg">{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {user.fullName}
                <span className={getStatusBadge(user.status)}>{user.status}</span>
              </DialogTitle>
              <DialogDescription className="mt-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" /> {user.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" /> {user.mobileNumber}
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="space-y-6">
            {/* Essential Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <h4 className="flex items-center gap-2 font-medium mb-3 text-sm text-muted-foreground">
                  <Droplets className="h-4 w-4 text-destructive" /> Personal Info
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Blood Group:</span>
                    <span className="font-medium text-sm">{user.bloodGroup || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Gender:</span>
                    <span className="font-medium text-sm">{(user as any).gender || "N/A"}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="flex items-center gap-2 font-medium mb-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" /> Account Dates
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Registered:</span>
                    <span className="font-medium text-sm">
                      {user.createdAt ? format(new Date(user.createdAt), "PPP") : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Login:</span>
                    <span className="font-medium text-sm">
                      {(user as any).lastLogin ? format(new Date((user as any).lastLogin), "PPP p") : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="rounded-lg border p-4">
              <h4 className="flex items-center gap-2 font-medium mb-4 text-sm text-muted-foreground">
                <ShoppingBag className="h-4 w-4" /> Usage Statistics
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Total Bookings</p>
                  <p className="text-xl font-bold mt-1">{user.totalBookings || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Total Spent</p>
                  <p className="text-xl font-bold mt-1">₹{(user.totalAmountSpent || 0).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Last Booking</p>
                  <p className="text-sm font-medium mt-1">
                    {user.lastBookingDate ? format(new Date(user.lastBookingDate), "MMM dd, yyyy") : "Never"}
                  </p>
                </div>
              </div>
            </div>

            {/* Address Info if available */}
            {user.address && (
              <div className="rounded-lg border p-4">
                <h4 className="flex items-center gap-2 font-medium mb-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> Primary Address
                </h4>
                <p className="text-sm">{user.address}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
