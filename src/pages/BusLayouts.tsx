import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, MoreVertical, Edit, Trash2, Eye, Copy, Grid, Layout as LayoutIcon } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatCard } from "@/features/analytics";
import { BusLayout } from "@/types";
import { busLayoutService } from "@/features/buses";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { LayoutPreviewGrid } from "@/features/buses";
import { FullPageLoader } from "@/components/ui/full-page-loader";

const BusLayouts = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [layouts, setLayouts] = useState<BusLayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState<any>({
    totalLayouts: 0,
    activeLayouts: 0,
    totalBusesUsing: 0,
    mostUsedLayout: "Loading...",
  });

  // Preview dialog
  const [previewLayout, setPreviewLayout] = useState<BusLayout | null>(null);

  // Duplicate dialog
  const [duplicateLayout, setDuplicateLayout] = useState<BusLayout | null>(null);
  const [duplicateName, setDuplicateName] = useState("");

  // Delete dialog
  const [deleteLayout, setDeleteLayout] = useState<BusLayout | null>(null);

  const fetchLayouts = async () => {
    setIsLoading(true);
    try {
      const [data, statsData] = await Promise.all([busLayoutService.getAll(), busLayoutService.getStats()]);
      setLayouts(data);
      setStats(statsData);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load bus layouts", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, []);

  const filteredLayouts = useMemo(() => {
    return layouts.filter((layout) => {
      const matchesSearch =
        layout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        layout.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || layout.status === statusFilter;
      const matchesType = typeFilter === "all" || layout.layoutType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [layouts, searchQuery, statusFilter, typeFilter]);

  const handleDuplicate = async () => {
    if (!duplicateLayout || !duplicateName.trim()) return;

    try {
      const newLayout = await busLayoutService.duplicate(duplicateLayout.id);
      if (newLayout) {
        fetchLayouts();
        toast({ title: "Layout Duplicated", description: `Created "${duplicateName}" successfully.` });
      }
    } catch {
      toast({ title: "Error", description: "Failed to duplicate layout", variant: "destructive" });
    }
    setDuplicateLayout(null);
    setDuplicateName("");
  };

  const handleDelete = async () => {
    if (!deleteLayout) return;

    setIsDeleting(true);
    try {
      const result = await busLayoutService.delete(deleteLayout.id);
      if (result.success) {
        fetchLayouts();
        toast({ title: "Layout Deleted", description: "Layout has been removed successfully." });
      } else {
        toast({ title: "Cannot Delete", description: result.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteLayout(null);
    }
  };

  const canCreate = hasPermission("BUS_LAYOUT_CREATE");
  const canEdit = hasPermission("BUS_LAYOUT_EDIT");
  const canDelete = hasPermission("BUS_LAYOUT_DELETE");

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Loading Layouts..." />
      <FullPageLoader show={isDeleting} label="Deleting Layout..." />
      <PageHeader
        title="Bus Layout Templates"
        subtitle="Manage reusable seating configurations"
        actions={
          canCreate && (
            <Button onClick={() => navigate("/bus-layouts/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Layout
            </Button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Layouts"
          value={stats.totalLayouts}
          icon={LayoutIcon}
          iconColor="text-primary"
          vibrant={true}
        />
        <StatCard
          title="Active Layouts"
          value={stats.activeLayouts}
          icon={Grid}
          iconColor="text-success"
          vibrant={true}
        />
        <StatCard title="Buses Using" value={stats.totalBusesUsing} icon={Grid} iconColor="text-info" vibrant={true} />
        <StatCard title="Most Used" value={stats.mostUsedLayout} icon={Grid} iconColor="text-warning" vibrant={true} />
      </div>

      {/* Filters */}
      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search layouts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Layout Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="2x2">2x2</SelectItem>
              <SelectItem value="2x3">2x3</SelectItem>
              <SelectItem value="3x2">3x2</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Layout Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead>Buses Using</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLayouts.map((layout) => (
              <TableRow key={layout.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{layout.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{layout.description}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="badge badge-info">{layout.layoutType}</span>
                </TableCell>
                <TableCell>{layout.totalSeats} seats</TableCell>
                <TableCell>
                  {layout.totalRows} × {layout.totalColumns}
                </TableCell>
                <TableCell>
                  <span className={cn("font-medium", layout.busesUsing > 0 ? "text-primary" : "text-muted-foreground")}>
                    {layout.busesUsing} buses
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "badge",
                      layout.status === "active" && "badge-success",
                      layout.status === "inactive" && "badge-warning",
                      layout.status === "archived" && "badge-error",
                    )}
                  >
                    {layout.status}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPreviewLayout(layout)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      {canEdit && (
                        <DropdownMenuItem onClick={() => navigate(`/bus-layouts/${layout.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canCreate && (
                        <DropdownMenuItem
                          onClick={() => {
                            setDuplicateLayout(layout);
                            setDuplicateName(`${layout.name} (Copy)`);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteLayout(layout)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewLayout} onOpenChange={() => setPreviewLayout(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{previewLayout?.name}</DialogTitle>
            <DialogDescription>{previewLayout?.description}</DialogDescription>
          </DialogHeader>
          {previewLayout && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">Layout Type</p>
                  <p className="font-medium">{previewLayout.layoutType}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">Total Seats</p>
                  <p className="font-medium">{previewLayout.totalSeats}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">Dimensions</p>
                  <p className="font-medium">
                    {previewLayout.totalRows}×{previewLayout.totalColumns}
                  </p>
                </div>
              </div>
              <LayoutPreviewGrid layout={previewLayout} />
            </div>
          )}
          <DialogFooter>
            {canEdit && previewLayout && (
              <Button
                onClick={() => {
                  setPreviewLayout(null);
                  navigate(`/bus-layouts/${previewLayout.id}`);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Layout
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={!!duplicateLayout} onOpenChange={() => setDuplicateLayout(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Duplicate Layout</DialogTitle>
            <DialogDescription>Create a copy of "{duplicateLayout?.name}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="duplicate-name">New Layout Name</Label>
              <Input
                id="duplicate-name"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                placeholder="Enter layout name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateLayout(null)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicate} disabled={!duplicateName.trim()}>
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteLayout} onOpenChange={() => setDeleteLayout(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Layout?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteLayout?.busesUsing && deleteLayout.busesUsing > 0 ? (
                <span className="text-destructive">
                  Cannot delete "{deleteLayout?.name}". {deleteLayout.busesUsing} buses are using this layout.
                </span>
              ) : (
                <>Are you sure you want to delete "{deleteLayout?.name}"? This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {(!deleteLayout?.busesUsing || deleteLayout.busesUsing === 0) && (
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default BusLayouts;
