import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { ArrowLeft, Save, RotateCcw, Eye, Wand2, Grid, ChevronDown, ChevronUp, Armchair } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BusLayout, LayoutSeat, LayoutType, SeatType, NumberingDirection } from "@/types";
import { busLayoutService, LAYOUT_TEMPLATES, useLayout, useCreateLayout, useUpdateLayout } from "@/features/buses";
import { LayoutPreviewGrid } from "@/features/buses/components/LayoutPreviewGrid";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FullPageLoader } from "@/components/ui/full-page-loader";

const BusLayoutBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id && id !== "new";

  // Layout state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [layoutType, setLayoutType] = useState<LayoutType>("2x2");
  const [totalRows, setTotalRows] = useState(10);
  const [totalColumns, setTotalColumns] = useState(5);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [seats, setSeats] = useState<LayoutSeat[]>([]);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [configOpen, setConfigOpen] = useState(true);
  const [seatConfigOpen, setSeatConfigOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  // Queries
  const { data: existingLayout, isLoading: isFetching } = useLayout(id || "");

  // Mutations
  const createMutation = useCreateLayout();
  const updateMutation = useUpdateLayout();

  const [activeBrush, setActiveBrush] = useState<SeatType | "CLEAR">("SEATER");
  const [numberingDirection, setNumberingDirection] = useState<NumberingDirection>("RTL");

  // Initialize new layout with default grid
  useEffect(() => {
    if (!isEditing && seats.length === 0) {
      const initialSeats = busLayoutService.generateGrid(10, 5, "2x2");
      setSeats(initialSeats);
    }
  }, [isEditing, seats.length]);

  // Load existing layout
  useEffect(() => {
    if (isEditing && existingLayout) {
      setName(existingLayout.name);
      setDescription(existingLayout.description || "");
      setLayoutType(existingLayout.layoutType);
      setTotalRows(existingLayout.totalRows);
      setTotalColumns(existingLayout.totalColumns);
      setStatus(existingLayout.status === "archived" ? "inactive" : (existingLayout.status as any));
      setNumberingDirection(existingLayout.numberingDirection || "RTL");
      setSeats(existingLayout.seats);
    }
  }, [existingLayout, isEditing]);

  // Auto-regenerate grid when layout type changes for new layouts
  useEffect(() => {
    if (!isEditing && seats.length > 0) {
      // Update dimensions based on layout type
      let newRows = totalRows;
      let newCols = totalColumns;

      switch (layoutType) {
        case "2x2":
          newRows = 10;
          newCols = 5; // Use 5 columns for 2x2 to support back row and middle slot
          break;
        case "2x3":
          newRows = 10;
          newCols = 6; // 2 seats + 1 aisle + 3 seats = 6 slots
          break;
        case "3x2":
          newRows = 12;
          newCols = 6; // 3 seats + 1 aisle + 2 seats = 6 slots
          break;
        // custom - keep current dimensions
      }

      // Only regenerate if dimensions changed
      if (newRows !== totalRows || newCols !== totalColumns) {
        setTotalRows(newRows);
        setTotalColumns(newCols);
        const newSeats = busLayoutService.generateGrid(newRows, newCols, layoutType, numberingDirection);
        setSeats(newSeats);

        setSelectedSeats([]);
      }
    }
  }, [layoutType, isEditing]);

  // Generate grid when dimensions change
  const handleGenerateGrid = () => {
    const newSeats = busLayoutService.generateGrid(totalRows, totalColumns, layoutType, numberingDirection);

    setSeats(newSeats);
    setSelectedSeats([]);
    toast({
      title: "Grid Generated",
      description: `Created ${totalRows}×${totalColumns} grid with ${numberingDirection} numbering`,
    });
  };

  // Auto-renumber when direction changes
  useEffect(() => {
    if (seats.length > 0) {
      const numbered = busLayoutService.autoNumberSeats(seats, numberingDirection);
      setSeats(numbered);
    }
  }, [numberingDirection]);

  // Apply template
  const handleApplyTemplate = (templateKey: keyof typeof LAYOUT_TEMPLATES) => {
    const template = busLayoutService.applyTemplate(templateKey);
    if (template.name) setName(template.name);
    if (template.description) setDescription(template.description);
    if (template.layoutType) setLayoutType(template.layoutType);
    if (template.totalRows) setTotalRows(template.totalRows);
    if (template.totalColumns) setTotalColumns(template.totalColumns);
    if (template.numberingDirection) setNumberingDirection(template.numberingDirection);
    if (template.seats) setSeats(template.seats);
    setSelectedSeats([]);
    toast({ title: "Template Applied", description: `Loaded "${template.name}" template` });
  };

  // Handle seat selection or brush application
  const handleSeatClick = (seat: LayoutSeat) => {
    // LOCK: Middle column (aisle) except for the last row
    const aisleCol = totalColumns === 5 ? 2 : totalColumns === 6 ? 3 : Math.floor(totalColumns / 2);
    const isAisle = seat.colPosition === aisleCol;
    const isLastRow = seat.rowPosition === totalRows - 1;

    if (isAisle && !isLastRow) {
      toast({
        title: "Aisle Locked",
        description: "The middle aisle cannot be modified except for the back row.",
        variant: "default",
      });
      return;
    }

    if (activeBrush === "CLEAR" || activeBrush === "EMPTY") {
      updateSeat(seat.id, { seatType: "EMPTY", seatNumber: "", isActive: false });
      return;
    }

    if (activeBrush === "SEATER" && seat.seatType === "EMPTY") {
      updateSeat(seat.id, {
        seatType: "SEATER",
        isActive: true,
      });
      return;
    }

    setSelectedSeats((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((id) => id !== seat.id);
      }
      return [...prev, seat.id];
    });
  };

  // Get selected seat data
  const selectedSeatData = useMemo(() => {
    if (selectedSeats.length === 0) return null;
    if (selectedSeats.length === 1) {
      return seats.find((s) => s.id === selectedSeats[0]);
    }
    return null; // Multiple selected - show bulk options
  }, [selectedSeats, seats]);

  // Update single seat
  const updateSeat = (seatId: string, updates: Partial<LayoutSeat>) => {
    setSeats((prev) => {
      const newSeats = prev.map((seat) => (seat.id === seatId ? { ...seat, ...updates } : seat));
      // Re-number if seat type was changed
      if (updates.seatType !== undefined) {
        return busLayoutService.autoNumberSeats(newSeats, numberingDirection);
      }
      return newSeats;
    });
  };

  // Bulk update seats
  const bulkUpdateSeats = (updates: Partial<LayoutSeat>) => {
    setSeats((prev) => {
      const newSeats = prev.map((seat) => (selectedSeats.includes(seat.id) ? { ...seat, ...updates } : seat));
      // Re-number if seat type was changed
      if (updates.seatType !== undefined) {
        return busLayoutService.autoNumberSeats(newSeats, numberingDirection);
      }
      return newSeats;
    });
  };

  // Auto-number seats
  const handleAutoNumber = () => {
    const numbered = busLayoutService.autoNumberSeats(seats, numberingDirection);
    setSeats(numbered);
    toast({ title: "Seats Numbered", description: `Applied ${numberingDirection} numbering` });
  };

  // Calculate total seats (Physical Capacity: Active + Inactive SEATERs)
  const totalSeats = useMemo(() => seats.filter((s) => s.seatType === "SEATER").length, [seats]);
  const activeSeatsCount = useMemo(() => seats.filter((s) => s.isActive && s.seatType === "SEATER").length, [seats]);

  // Save layout
  const handleSave = async () => {
    const validation = busLayoutService.validateLayout({
      name,
      totalRows,
      totalColumns,
      seats,
    });

    if (!validation.valid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach((err) => {
        if (err.includes("name")) newErrors.name = err;
        if (err.includes("rows")) newErrors.totalRows = err;
        if (err.includes("columns")) newErrors.totalColumns = err;
      });
      setErrors(newErrors);

      toast({
        title: "Validation Error",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    const layoutData = {
      name,
      description,
      layoutType,
      totalRows,
      totalColumns,
      totalSeats,
      status,
      seats,
      numberingDirection,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: id!, data: layoutData },
        {
          onSuccess: () => navigate(ROUTES.BUS_LAYOUTS),
        },
      );
    } else {
      createMutation.mutate(
        { ...layoutData, createdBy: "admin_001" },
        {
          onSuccess: () => navigate(ROUTES.BUS_LAYOUTS),
        },
      );
    }
  };

  // Build preview layout object
  const previewLayout: BusLayout = {
    id: id || "preview",
    name,
    description,
    layoutType,
    totalRows,
    totalColumns,
    totalSeats,
    status,
    seats,
    numberingDirection,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin_001", //change to dynamic later
    busesUsing: 0,
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.BUS_LAYOUTS)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEditing ? "Edit Layout" : "Create New Layout"}</h1>
            <p className="text-sm text-muted-foreground">
              {isEditing ? `Editing: ${name}` : "Design your bus seating configuration"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : isEditing
                ? "Update Layout"
                : "Create Layout"}
          </Button>
        </div>
      </div>

      <FullPageLoader show={isFetching} label="Loading layout data..." />
      <FullPageLoader
        show={createMutation.isPending || updateMutation.isPending}
        label={isEditing ? "Updating Layout..." : "Creating Layout..."}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Configuration */}
        <div className="space-y-4">
          {/* Basic Info */}
          <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
            <div className="dashboard-card">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4">
                <h3 className="font-medium">Layout Configuration</h3>
                {configOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className={cn(errors.name && "text-destructive")}>
                    Layout Name *
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    placeholder="e.g., Luxury 2x2 AC"
                    className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this layout..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as "active" | "inactive")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Layout Type</Label>
                  <Select value={layoutType} onValueChange={(v) => setLayoutType(v as LayoutType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2x2">2x2 Standard</SelectItem>
                      <SelectItem value="2x3">2x3 Standard</SelectItem>
                      <SelectItem value="3x2">3x2 Standard</SelectItem>
                      <SelectItem value="custom">Fully Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Seat Numbering Direction</Label>
                  <Select
                    value={numberingDirection}
                    onValueChange={(v) => setNumberingDirection(v as NumberingDirection)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LTR">Left to Right</SelectItem>
                      <SelectItem value="RTL">Right to Left (Standard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 border-t">
                  <Label className="text-xs text-muted-foreground mb-2 block">Customization Brush</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={activeBrush === "SEATER" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveBrush("SEATER")}
                      className="h-8 text-[10px]"
                    >
                      <Armchair className="h-3 w-3 mr-1" />
                      Seat
                    </Button>
                    <Button
                      variant={activeBrush === "EMPTY" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveBrush("EMPTY")}
                      className="h-8 text-[10px]"
                    >
                      ⬛ Space
                    </Button>
                    <Button
                      variant={activeBrush === "CLEAR" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveBrush("CLEAR")}
                      className="h-8 text-[10px] text-destructive"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                  {activeBrush === "SEATER" && (
                    <p className="text-[10px] mt-2 text-primary font-medium">Click on grid cells to place seats</p>
                  )}
                  {activeBrush === "EMPTY" && (
                    <p className="text-[10px] mt-2 text-warning font-medium">Click on grid cells to place spaces</p>
                  )}
                  {activeBrush === "CLEAR" && (
                    <p className="text-[10px] mt-2 text-destructive font-medium">Click to remove elements</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className={cn(errors.totalRows && "text-destructive")}>Rows (1-20)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={totalRows}
                      onChange={(e) => {
                        setTotalRows(Number(e.target.value));
                        if (errors.totalRows) setErrors((prev) => ({ ...prev, totalRows: "" }));
                      }}
                      className={cn(errors.totalRows && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.totalRows && <p className="text-xs text-destructive">{errors.totalRows}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className={cn(errors.totalColumns && "text-destructive")}>Seat Columns (2-10)</Label>
                    <Input
                      type="number"
                      min={2}
                      max={10}
                      value={totalColumns}
                      onChange={(e) => {
                        setTotalColumns(Number(e.target.value));
                        if (errors.totalColumns) setErrors((prev) => ({ ...prev, totalColumns: "" }));
                      }}
                      className={cn(errors.totalColumns && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.totalColumns && <p className="text-xs text-destructive">{errors.totalColumns}</p>}
                  </div>
                </div>

                <Button onClick={handleGenerateGrid} className="w-full">
                  <Grid className="h-4 w-4 mr-2" />
                  Generate Grid
                </Button>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Quick Templates</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleApplyTemplate("standard_2x2_40")}>
                      2x2 (40 seats)
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleApplyTemplate("standard_2x3_50")}>
                      2x3 (50 seats)
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleApplyTemplate("standard_3x2_60")}>
                      3x2 (60 seats)
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Seat Configuration */}
          <Collapsible open={seatConfigOpen} onOpenChange={setSeatConfigOpen}>
            <div className="dashboard-card">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4">
                <h3 className="font-medium">
                  Seat Configuration
                  {selectedSeats.length > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">({selectedSeats.length} selected)</span>
                  )}
                </h3>
                {seatConfigOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-4">
                {selectedSeats.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Click on seats in the grid to select and configure them
                  </p>
                ) : selectedSeatData ? (
                  // Single seat editing
                  <div className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium">Seat {selectedSeatData.seatNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        Row {selectedSeatData.rowPosition + 1}, Col {selectedSeatData.colPosition + 1}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Seat Number</Label>
                      <Input
                        value={selectedSeatData.seatNumber}
                        onChange={(e) => updateSeat(selectedSeatData.id, { seatNumber: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Element Type</Label>
                      <Select
                        value={selectedSeatData.seatType || "SEATER"}
                        onValueChange={(v) => updateSeat(selectedSeatData.id, { seatType: v as SeatType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SEATER">
                            <div className="flex items-center gap-2">
                              <Armchair className="h-4 w-4" />
                              Seater
                            </div>
                          </SelectItem>
                          <SelectItem value="EMPTY">⬛ Space / Aisle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedSeatData.seatType === "SEATER" && (
                      <div className="space-y-2">
                        <Label>Seat Number</Label>
                        <Input
                          value={selectedSeatData.seatNumber}
                          onChange={(e) => updateSeat(selectedSeatData.id, { seatNumber: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label>Seat Active</Label>
                      <Switch
                        checked={selectedSeatData.isActive}
                        onCheckedChange={(checked) => updateSeat(selectedSeatData.id, { isActive: checked })}
                      />
                    </div>
                  </div>
                ) : (
                  // Multiple seats selected - bulk actions
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {selectedSeats.length} seats selected - Apply bulk changes:
                    </p>

                    <div className="space-y-2">
                      <Label>Set Seat Type</Label>
                      <Select onValueChange={(v) => bulkUpdateSeats({ seatType: v as SeatType })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SEATER">Seater</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Mark Selected Active</Label>
                      <Switch onCheckedChange={(checked) => bulkUpdateSeats({ isActive: checked })} />
                    </div>

                    <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedSeats([])}>
                      Clear Selection
                    </Button>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleAutoNumber}
                    disabled={seats.length === 0}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Auto-Number Seats
                  </Button>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Stats */}
          <div className="dashboard-card p-4">
            <h3 className="font-medium mb-3">Layout Summary</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground text-xs">Active Seats</span>
                <span className="font-medium">
                  {activeSeatsCount} / {totalSeats}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground text-xs">Dimensions</span>
                <span className="font-medium">
                  {totalRows} R × {totalColumns} C
                </span>
              </div>
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground text-xs">Layout Type</span>
                <span className="font-medium uppercase">{layoutType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Panel - Visual Grid Builder */}
        <div className="lg:col-span-2">
          <div className="dashboard-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Seat Layout Grid</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedSeats([])}>
                  Clear Selection
                </Button>
                <Button variant="ghost" size="sm" onClick={handleGenerateGrid}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {seats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Grid className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  No seats configured yet. Generate a grid or apply a template to start.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleGenerateGrid}>
                    <Grid className="h-4 w-4 mr-2" />
                    Generate Grid
                  </Button>
                  <Button variant="outline" onClick={() => handleApplyTemplate("standard_2x2_40")}>
                    Apply Template
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-auto">
                <LayoutPreviewGrid layout={previewLayout} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center mt-4">
              Click on seats to select them. Hold Ctrl/Cmd to select multiple seats.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Layout Preview</DialogTitle>
            <DialogDescription>
              {name || "Untitled Layout"} - {totalSeats} seats
            </DialogDescription>
          </DialogHeader>
          <LayoutPreviewGrid layout={previewLayout} />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BusLayoutBuilder;
