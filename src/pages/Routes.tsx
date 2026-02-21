import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, MoreVertical, Edit, Trash2, Eye, MapPin, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddRouteDialog, useRoutes, useDeleteRoute, useReorderStops, useDeleteStop, useRoute } from "@/features/routes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "@/hooks/use-toast";
import { Route } from "@/types";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { TablePagination } from "@/components/ui/table-pagination";

const Routes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    data: routesData,
    isLoading,
    refetch,
  } = useRoutes({
    search: debouncedSearch,
    status: statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
  });

  const routes = routesData?.data || [];
  const totalCount = routesData?.total || 0;

  const deleteRouteMutation = useDeleteRoute();
  const deleteStopMutation = useDeleteStop();
  const reorderStopsMutation = useReorderStops();

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [routeToEdit, setRouteToEdit] = useState<Route | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Sync search and status changes to page 1
  useEffect(() => {
    if (currentPage !== 1 && (debouncedSearch || statusFilter !== "all")) {
      handlePageChange(1);
    }
  }, [debouncedSearch, statusFilter]);

  const handleSearchChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set("q", val);
    else newParams.delete("q");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleStatusChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val !== "all") newParams.set("status", val);
    else newParams.delete("status");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  const isPageLoading = deleteRouteMutation.isPending || deleteStopMutation.isPending || reorderStopsMutation.isPending;

  const { data: routeDetails, isLoading: isDetailsLoading } = useRoute(selectedRoute?.id || "");

  const viewRouteDetails = (route: Route) => {
    setSelectedRoute(route);
    setDetailsOpen(true);
  };

  const handleEditRoute = (route: Route) => {
    setRouteToEdit(route);
    setEditOpen(true);
  };

  const handleDeleteRoute = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      try {
        await deleteRouteMutation.mutateAsync(id);
        toast({ title: "Route Deleted", description: "Route has been removed successfully." });
      } catch (error: any) {
        toast({
          title: "Deletion Failed",
          description: error.message || "Failed to delete route.",
          variant: "destructive",
        });
      }
    }
  };

  const handleReorderStops = async (routeId: string, orderedStopIds: string[]) => {
    try {
      await reorderStopsMutation.mutateAsync({ routeId, orderedStopIds });
      toast({ title: "Stop Reordered", description: "Stop order has been updated." });
    } catch (error: any) {
      toast({
        title: "Reorder Failed",
        description: error.message || "Failed to reorder stops.",
        variant: "destructive",
      });
    }
  };

  const moveStop = async (routeId: string, stopId: string, direction: "up" | "down") => {
    const route = routeDetails;
    if (!route || route.id !== routeId) return;

    const stops = [...route.stops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    const index = stops.findIndex((s) => s.id === stopId);

    if (direction === "up" && index > 0) {
      [stops[index - 1], stops[index]] = [stops[index], stops[index - 1]];
    } else if (direction === "down" && index < stops.length - 1) {
      [stops[index], stops[index + 1]] = [stops[index + 1], stops[index]];
    }

    const orderedStopIds = stops.map((s) => s.id);
    await handleReorderStops(routeId, orderedStopIds);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !routeDetails) return;
    if (result.destination.index === result.source.index) return;

    const items = [...routeDetails.stops].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const orderedStopIds = items.map((s) => s.id);
    await handleReorderStops(routeDetails.id, orderedStopIds);
  };

  const handleDeleteStop = async (routeId: string, stopId: string) => {
    try {
      await deleteStopMutation.mutateAsync({ stopId });
      toast({ title: "Stop Removed", description: "Stop has been removed from the route." });
    } catch {
      toast({ title: "Error", description: "Failed to remove stop.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Loading Routes..." />
      <FullPageLoader
        show={isPageLoading}
        label={
          deleteRouteMutation.isPending
            ? "Deleting route..."
            : deleteStopMutation.isPending
              ? "Removing stop..."
              : "Updating order..."
        }
      />
      <PageHeader
        title="Route Management"
        subtitle={`Manage ${totalCount} routes and their stops`}
        actions={<AddRouteDialog onRouteAdded={() => refetch()} />}
      />

      {/* Filters */}
      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by route name or ID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {/* Loading state handled by FullPageLoader */}
      {!isLoading && routes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed">
          <div className="p-4 rounded-full bg-primary/5 mb-4">
            <MapPin className="h-10 w-10 text-primary opacity-40" />
          </div>
          <h3 className="text-lg font-semibold">No routes found</h3>
          <p className="text-muted-foreground">Try adjusting your search query</p>
        </div>
      ) : (
        /* Route Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((route) => (
            <div key={route.id} className="dashboard-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="badge-info text-2xs uppercase font-mono">{route.routeId}</span>
                  <h3 className="text-sm font-semibold text-foreground mt-1">{route.routeName}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => viewRouteDetails(route)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details & Stops
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditRoute(route)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Route
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteRoute(route.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Route Path */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="text-sm font-medium truncate">{route.from}</p>
                </div>
                <div className="flex flex-col items-center px-4 relative min-w-[100px]">
                  <div className="h-0.5 w-full bg-border absolute top-1/2 -translate-y-1/2" />
                  <Badge
                    variant="secondary"
                    className="relative z-10 text-[10px] py-0 px-2 h-5 bg-background border shadow-sm"
                  >
                    {route.stopsCount} stops
                  </Badge>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-xs text-muted-foreground">To</p>
                  <p className="text-sm font-medium truncate">{route.to}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Distance</p>
                    <p className="text-sm font-medium">{route.totalDistance} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium">{route.totalDuration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Buses</p>
                    <p className="text-sm font-medium">{route.busesCount || 0}</p>
                  </div>
                </div>
                <Badge
                  className={
                    route.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20"
                      : route.status === "DRAFT"
                        ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20"
                        : "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/20"
                  }
                  variant="outline"
                >
                  {route.status}
                </Badge>
              </div>

              {/* Quick View Stops Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 font-medium text-primary hover:text-primary hover:bg-primary/5"
                onClick={() => viewRouteDetails(route)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                View {route.stops?.length || 0} Stops
              </Button>
            </div>
          ))}
        </div>
      )}

      {totalCount > 0 && (
        <div className="mt-6">
          <TablePagination
            currentPage={currentPage}
            onPageChange={handlePageChange}
            totalCount={totalCount}
            pageSize={pageSize}
          />
        </div>
      )}

      {/* Route Details Dialog with Stops */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRoute?.routeName}</DialogTitle>
            <DialogDescription>Route details and stop management</DialogDescription>
          </DialogHeader>

          {isDetailsLoading ? (
            <FullPageLoader show={true} label="Loading route details..." />
          ) : routeDetails ? (
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Route Details</TabsTrigger>
                <TabsTrigger value="stops">Stops ({routeDetails.stops?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Start Location
                      </p>
                      <p className="text-sm font-medium">{routeDetails.from}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        End Location
                      </p>
                      <p className="text-sm font-medium">{routeDetails.to}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Total Distance
                      </p>
                      <p className="text-sm font-medium">{routeDetails.totalDistance} km</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Est. Duration
                      </p>
                      <p className="text-sm font-medium">{routeDetails.totalDuration}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                      Base Fare
                    </p>
                    <p className="text-sm font-medium">₹{routeDetails.baseFare}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 overflow-hidden border border-transparent hover:border-border transition-colors">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">
                      Assigned Buses
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {routeDetails.assignedBuses && routeDetails.assignedBuses.length > 0 ? (
                        routeDetails.assignedBuses.map((busNum: string) => (
                          <Badge
                            key={busNum}
                            variant="secondary"
                            className="px-3 py-1 font-mono text-xs bg-white/80 border shadow-sm"
                          >
                            {busNum}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No buses currently assigned to this route.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stops">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Manage stops along this route. Drag or use arrows to reorder.
                    </p>
                  </div>

                  {!routeDetails.stops || routeDetails.stops.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No stops added yet</p>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="stops-list">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {[...routeDetails.stops]
                              .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                              .map((stop, index) => (
                                <Draggable key={stop.id} draggableId={stop.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border bg-card transition-all",
                                        snapshot.isDragging
                                          ? "shadow-xl border-primary ring-1 ring-primary/20 bg-muted/50 scale-[1.02] z-50"
                                          : "hover:bg-muted/50",
                                      )}
                                    >
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="p-1 hover:bg-muted rounded transition-colors cursor-grab active:cursor-grabbing"
                                        >
                                          <GripVertical className="h-4 w-4" />
                                        </div>
                                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                                          {index + 1}
                                        </span>
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{stop.point?.name || stop.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {stop.point?.address || stop.address}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          disabled={index === 0}
                                          onClick={() => moveStop(routeDetails.id, stop.id, "up")}
                                        >
                                          <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          disabled={index === (routeDetails.stops?.length || 0) - 1}
                                          onClick={() => moveStop(routeDetails.id, stop.id, "down")}
                                        >
                                          <ArrowDown className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive"
                                          onClick={() => handleDeleteStop(routeDetails.id, stop.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">Failed to load route details.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Edit Route Dialog */}
      <AddRouteDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={routeToEdit}
        onRouteAdded={() => refetch()}
      />
    </DashboardLayout>
  );
};

export default Routes;
