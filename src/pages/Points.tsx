import { useState } from "react";
import { Search, MapPin, MoreVertical, Edit, Trash2, Map, Navigation, Eye } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { PointDialog } from "@/features/points/components/PointDialog";
import { PointDetailsDialog } from "@/features/points/components/PointDetailsDialog";
import { usePoints, useDeletePoint } from "@/features/routes/hooks/useRouteQueries";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { toast } from "@/hooks/use-toast";

const Points = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // View Details state
  const [detailsPoint, setDetailsPoint] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: points = [], isLoading } = usePoints();
  const deletePointMutation = useDeletePoint();

  const handleEdit = (point: any) => {
    setSelectedPoint(point);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deletePointMutation.mutateAsync(id);
        toast({
          title: "Point Deleted",
          description: "Location has been removed successfully.",
        });
      } catch (error: any) {
        toast({
          title: "Delete Failed",
          description: error.message || "Failed to delete location",
          variant: "destructive",
        });
      }
    }
  };

  const filteredPoints = (points || []).filter(
    (point: any) =>
      point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      point.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      point.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Loading Points..." />
      <FullPageLoader show={deletePointMutation.isPending} label="Deleting point..." />
      <PageHeader
        title="Points & Locations"
        subtitle={`Manage ${points.length} pickup and drop locations across the network`}
        actions={<PointDialog onSuccess={() => {}} />}
      />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search points by name, city or address..."
            className="pl-9 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Loading state handled by FullPageLoader */}
      {!isLoading && filteredPoints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPoints.map((point: any) => (
            <div
              key={point.id}
              className="group dashboard-card overflow-hidden border border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => {
                setDetailsPoint(point);
                setIsDetailsOpen(true);
              }}
            >
              {/* Image Header */}
              <div className="relative h-48 bg-muted">
                {point.images && point.images.length > 0 ? (
                  <img
                    src={point.images.find((img: any) => img.isPrimary)?.imageUrl || point.images[0].imageUrl}
                    alt={point.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 bg-gradient-to-br from-muted to-muted/50">
                    <MapPin className="h-12 w-12 mb-2" />
                    <span className="text-xs font-medium uppercase tracking-widest">No Image Available</span>
                  </div>
                )}

                <div className="absolute top-3 right-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border-none hover:bg-white text-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => {
                          setDetailsPoint(point);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(point)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Point
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(point.id, point.name)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Point
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <Badge className="bg-white/90 backdrop-blur-sm text-primary hover:bg-white/90 border-none shadow-sm font-medium">
                    {point.city}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 px-3 rounded-full bg-primary text-white hover:bg-primary/90 border-none shadow-md backdrop-blur-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`,
                        "_blank",
                      );
                    }}
                  >
                    <Map className="h-3.5 w-3.5 mr-1.5" />
                    View Map
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {point.name}
                  </h3>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">{point.address}</p>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                      <Navigation className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Lat/Long
                      </p>
                      <p className="text-xs font-medium">
                        {Number(point.latitude).toFixed(4)}, {Number(point.longitude).toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-orange-500/5 flex items-center justify-center text-orange-500">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Pincode
                      </p>
                      <p className="text-xs font-medium">{point.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="dashboard-card py-20 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
            <MapPin className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No points found</h3>
          <p className="text-muted-foreground max-w-sm">
            We couldn't find any points matching your search. Try a different term or add a new point.
          </p>
          <PointDialog onSuccess={() => {}} />
        </div>
      )}
      <PointDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedPoint}
        onSuccess={() => setSelectedPoint(null)}
      />

      <PointDetailsDialog point={detailsPoint} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
    </DashboardLayout>
  );
};

export default Points;
