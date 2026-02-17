import { useState } from "react";
import { MapPin, Navigation, X, Maximize2, Copy, Check, Info, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PointDetailsDialogProps {
  point: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PointDetailsDialog({ point, open, onOpenChange }: PointDetailsDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!point) return null;

  const primaryImage = point.images?.find((img: any) => img.isPrimary)?.imageUrl || point.images?.[0]?.imageUrl;
  const allImages = point.images || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Coordinates copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const openInMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-y-auto max-h-[90vh] border-none bg-background/95 backdrop-blur-xl shadow-2xl rounded-3xl scrollbar-thin">
        <div className="relative h-[300px] sm:h-[400px] w-full overflow-hidden group flex-shrink-0">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={point.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <MapPin className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="space-y-2">
              <Badge className="bg-primary/20 backdrop-blur-md text-primary-foreground border-primary/20 hover:bg-primary/30 transition-colors uppercase tracking-widest text-[10px] py-1 px-3">
                {point.city}, {point.state}
              </Badge>
              <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">{point.name}</h2>
            </div>

            <DialogClose asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:text-white border border-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Gallery Section */}
            <div className="md:col-span-12 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Maximize2 className="h-4 w-4" /> Gallery
                </h3>
                <span className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {allImages.length} Photos
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                {allImages.map((img: any, idx: number) => (
                  <div
                    key={img.id || idx}
                    className={cn(
                      "relative h-24 w-24 sm:h-32 sm:w-32 rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 transition-all duration-300 ring-offset-2 ring-primary/40 snap-start",
                      selectedImage === img.imageUrl ? "ring-2 scale-95" : "hover:scale-105",
                    )}
                    onClick={() => setSelectedImage(img.imageUrl)}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.caption || `Point ${idx}`}
                      className="h-full w-full object-cover"
                    />
                    {img.isPrimary && (
                      <div className="absolute top-1 right-1 bg-primary text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                        PRIMARY
                      </div>
                    )}
                  </div>
                ))}

                {allImages.length === 0 && (
                  <div className="h-24 sm:h-32 w-full bg-muted/50 rounded-2xl border border-dashed flex flex-col items-center justify-center text-muted-foreground/40 italic">
                    <Info className="h-5 w-5 mb-1" />
                    <span className="text-xs">No additional photos</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/50">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Address Details
                  </h3>
                  <p className="text-base text-foreground/80 leading-relaxed bg-muted/30 p-4 rounded-2xl border border-border/50 italic">
                    {point.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Pincode
                    </span>
                    <p className="text-sm font-medium">{point.pincode}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">State</span>
                    <p className="text-sm font-medium">{point.state}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Navigation className="h-4 w-4" /> Coordinates
                  </h3>
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Latitude</span>
                      <code className="bg-background px-2 py-0.5 rounded-md border text-primary font-mono">
                        {point.latitude}
                      </code>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium">Longitude</span>
                      <code className="bg-background px-2 py-0.5 rounded-md border text-primary font-mono">
                        {point.longitude}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 rounded-2xl h-11 bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all"
                    onClick={openInMaps}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Open in Maps
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-2xl h-11 border-primary/20 text-primary hover:bg-primary/5 active:scale-95 transition-all"
                    onClick={() => copyToClipboard(`${point.latitude},${point.longitude}`)}
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copied" : "Copy Shared"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Image Preview Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-500 animate-in zoom-in-95"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
