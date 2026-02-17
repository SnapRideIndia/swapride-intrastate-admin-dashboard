import { useState } from "react";
import { Driver } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Phone, Star, CreditCard, Bus, FileText } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface DriverDetailsDialogProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DriverDetailsDialog = ({ driver, open, onOpenChange }: DriverDetailsDialogProps) => {
  const [viewDocumentOpen, setViewDocumentOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  if (!driver) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/10">
              <AvatarImage src={driver.profileUrl || ""} alt={driver.name} />
              <AvatarFallback className="text-lg">{driver.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {driver.name}
                <Badge variant={driver.status === "AVAILABLE" ? "default" : "secondary"} className="ml-2">
                  {driver.status.replace("_", " ")}
                </Badge>
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {driver.mobileNumber ? `+91 ${driver.mobileNumber}` : "No Contact"}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-warning text-warning" /> {Number(driver.rating || 0).toFixed(1)}
                </span>
              </DialogDescription>
            </div>
          </div>
          <div className="mt-4 px-1">
            <p className="text-sm font-medium text-muted-foreground">Driver ID</p>
            <p className="font-mono text-sm">{driver.id}</p>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="space-y-6">
            {/* License & Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <h4 className="flex items-center gap-2 font-medium mb-3 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" /> License Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Number:</span>
                    <span className="font-medium text-sm">{driver.licenseNumber}</span>
                  </div>
                  {driver.licenseAttachment ? (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start mt-1 h-8"
                        onClick={() => {
                          setDocumentUrl(driver.licenseAttachment?.url || null);
                          setViewDocumentOpen(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" /> View License Document
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No document uploaded</span>
                  )}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="flex items-center gap-2 font-medium mb-3 text-sm text-muted-foreground">
                  <Bus className="h-4 w-4" /> Performance
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Trips:</span>
                    <span className="font-medium text-sm">{driver.totalTrips || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Joined:</span>
                    <span className="font-medium text-sm">
                      {driver.createdAt ? format(new Date(driver.createdAt), "PPP") : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity / Trips */}
            <div>
              <h3 className="font-semibold mb-3">Recent Trips</h3>
              <div className="space-y-3">
                {/* @ts-ignore */}
                {driver.trips && driver.trips.length > 0 ? (
                  // @ts-ignore
                  driver.trips.map((trip: any) => (
                    <div
                      key={trip.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{format(new Date(trip.tripDate), "PPP")}</p>
                          <p className="text-xs text-muted-foreground">Scheduled: {trip.scheduledStartTime}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{trip.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                    No trips recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Document Viewer Modal */}
        <Dialog open={viewDocumentOpen} onOpenChange={setViewDocumentOpen}>
          <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden bg-black/95 border-none flex flex-col items-center justify-center">
            <DialogHeader className="absolute top-4 right-4 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={() => setViewDocumentOpen(false)}
              >
                <span className="sr-only">Close</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </DialogHeader>
            {documentUrl && (
              <img src={documentUrl} alt="Document Preview" className="max-w-full max-h-full object-contain p-4" />
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};
