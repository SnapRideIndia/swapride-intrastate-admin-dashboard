import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
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
import { useLayouts, useLayoutStats, useDuplicateLayout, useDeleteLayout } from "@/features/buses";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { LayoutPreviewGrid } from "@/features/buses/components/LayoutPreviewGrid";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { TablePagination } from "@/components/ui/table-pagination";

const BusLayouts = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "all";
  const typeFilter = searchParams.get("type") || "all";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [pageSize, setPageSize] = useState(20);

  const setSearchQuery = (q: string) => {
    const params = new URLSearchParams(searchParams);
    if (q) params.set("q", q);
    else params.delete("q");
    params.set("page", "1");
    setSearchParams(params);
  };

  const setStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status && status !== "all") params.set("status", status);
    else params.delete("status");
    params.set("page", "1");
    setSearchParams(params);
  };

  const setTypeFilter = (type: string) => {
    const params = new URLSearchParams(searchParams);
    if (type && type !== "all") params.set("type", type);
    else params.delete("type");
    params.set("page", "1");
    setSearchParams(params);
  };

  const setCurrentPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Queries
  const {
    data: layoutsData,
    isLoading,
    refetch,
  } = useLayouts({
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
  });

  const layouts = layoutsData?.data || [];
  const totalCount = layoutsData?.total || 0;

  const { data: statsData } = useLayoutStats();

  // Mutations
  const duplicateMutation = useDuplicateLayout();
  const deleteMutation = useDeleteLayout();

  const stats = statsData || {
    totalLayouts: 0,
    activeLayouts: 0,
    totalBusesUsing: 0,
    mostUsedLayout: "N/A",
  };

  // Dialog states
  const [previewLayout, setPreviewLayout] = useState<BusLayout | null>(null);
  const [duplicateLayout, setDuplicateLayout] = useState<BusLayout | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [deleteLayout, setDeleteLayout] = useState<BusLayout | null>(null);

  const paginatedLayouts = layouts;

  const handleDuplicate = async () => {
    if (!duplicateLayout || !duplicateName.trim()) return;
    duplicateMutation.mutate(duplicateLayout.id, {
      onSuccess: () => {
        setDuplicateLayout(null);
        setDuplicateName("");
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteLayout) return;
    deleteMutation.mutate(deleteLayout.id, {
      onSuccess: () => {
        setDeleteLayout(null);
      },
    });
  };

  const canCreate = hasPermission("BUS_LAYOUT_CREATE");
  const canEdit = hasPermission("BUS_LAYOUT_EDIT");
  const canDelete = hasPermission("BUS_LAYOUT_DELETE");

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Loading Layouts..." />
      <FullPageLoader show={deleteMutation.isPending} label="Deleting Layout..." />
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
              placeholder="Search by name or description..."
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
            {paginatedLayouts.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No layout templates found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLayouts.map((layout) => (
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
                    <span
                      className={cn("font-medium", layout.busesUsing > 0 ? "text-primary" : "text-muted-foreground")}
                    >
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
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
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
