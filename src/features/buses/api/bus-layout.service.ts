import { BusLayout, LayoutSeat, SeatType, LayoutType } from "@/types";
import { storageService } from "@/utils/storage";
import { apiClient } from "@/api/api-client";
import { API_ENDPOINTS } from "@/api/endpoints";

const LAYOUTS_KEY = "shuttle_bus_layouts";

const createLayoutGrid = (rows: number, cols: number, _layoutType: LayoutType): LayoutSeat[] => {
  const seats: LayoutSeat[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const isLastRow = row === rows - 1;

      // Default seat type
      let seatType: SeatType = "SEATER";
      let isActive = true;

      const aisleCol = cols === 5 ? 2 : cols === 6 ? 3 : Math.floor(cols / 2);
      const isAisle = col === aisleCol;

      if (isAisle && !isLastRow) {
        seatType = "EMPTY";
        isActive = false;
      }

      seats.push({
        id: `seat_${row}_${col}`,
        seatNumber: "", // Will be auto-numbered
        rowPosition: row,
        colPosition: col,
        seatType: seatType,
        isActive: isActive,
      });
    }
  }

  return seats;
};

export const LAYOUT_TEMPLATES = {
  standard_2x2_40: {
    name: "Standard 2x2 AC",
    totalRows: 9,
    totalColumns: 5,
    layoutType: "2x2" as LayoutType,
    description: "Standard 40-seater AC layout with 2x2 configuration",
    status: "active" as const,
    numberingDirection: "LTR" as const,
  },
  standard_2x3_50: {
    name: "Standard 2x3 Non-AC",
    totalRows: 9,
    totalColumns: 6,
    layoutType: "2x3" as LayoutType,
    description: "Standard 50-seater Non-AC layout with 2x3 configuration",
    status: "active" as const,
    numberingDirection: "LTR" as const,
  },
  standard_3x2_60: {
    name: "Budget 3x2 Economy",
    totalRows: 11,
    totalColumns: 6,
    layoutType: "3x2" as LayoutType,
    description: "Budget 60-seater layout with 3x2 configuration",
    status: "active" as const,
    numberingDirection: "RTL" as const,
  },
  tsrtc_3x2_express: {
    name: "TSRTC Palle Velugu (3+2)",
    totalRows: 11,
    totalColumns: 6,
    layoutType: "custom" as LayoutType,
    description: "Standard TSRTC Express/Palle Velugu 3+2 layout with 6-seat back row",
    status: "active" as const,
    numberingDirection: "RTL" as const,
  },
  tsrtc_2x2_luxury: {
    name: "TSRTC Super Luxury (2+2)",
    totalRows: 10,
    totalColumns: 5,
    layoutType: "custom" as LayoutType,
    description: "Standard TSRTC Super Luxury 2+2 push-back layout",
    status: "active" as const,
    numberingDirection: "RTL" as const,
  },
};

const createMockLayouts = (): BusLayout[] => {
  const now = new Date().toISOString();

  return [
    {
      id: "layout_001",
      name: "Standard 2x2 AC",
      totalRows: 10,
      totalColumns: 5,
      description: "Standard 40-seater AC layout with 2x2 configuration.",
      layoutType: "2x2",
      totalSeats: 41, // 10 rows * 4 seats + 1 seat in back = 41
      status: "active",
      numberingDirection: "LTR",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: now,
      createdBy: "admin_001",
      busesUsing: 3,
      seats: createLayoutGrid(10, 5, "2x2"),
    },
    {
      id: "layout_002",
      name: "Standard 2x2 AC Eco",
      totalRows: 10,
      totalColumns: 5,
      description: "Standard 40-seat AC layout with 2x2 configuration.",
      layoutType: "2x2",
      totalSeats: 41,
      status: "active",
      numberingDirection: "LTR",
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: now,
      createdBy: "admin_001",
      busesUsing: 12,
      seats: createLayoutGrid(10, 5, "2x2"),
    },
    {
      id: "layout_003",
      name: "Standard 2x3 Non-AC",
      totalRows: 10,
      totalColumns: 6,
      description: "Standard 50-seater Non-AC layout with 2x3 configuration.",
      layoutType: "2x3",
      totalSeats: 51, // 10 rows * 5 seats + 1 seat in back = 51
      status: "active",
      numberingDirection: "LTR",
      createdAt: "2024-01-05T10:00:00Z",
      updatedAt: now,
      createdBy: "admin_001",
      busesUsing: 5,
      seats: createLayoutGrid(10, 6, "2x3"),
    },
    {
      id: "layout_006",
      name: "Budget 3x2 Economy",
      totalRows: 12,
      totalColumns: 6,
      description: "Budget 60-seat economy layout with 3x2 configuration.",
      layoutType: "3x2",
      totalSeats: 61, // 12 rows * 5 seats + 1 seat in back = 61
      status: "inactive",
      numberingDirection: "RTL",
      createdAt: "2023-12-15T10:00:00Z",
      updatedAt: now,
      createdBy: "admin_001",
      busesUsing: 0,
      seats: createLayoutGrid(12, 6, "3x2"),
    },
  ];
};

export const busLayoutService = {
  getAll: async (): Promise<BusLayout[]> => {
    const response = await apiClient.get(API_ENDPOINTS.FLEET.LAYOUTS.GET_ALL);
    return response.data;
  },

  getById: async (id: string): Promise<BusLayout | undefined> => {
    const response = await apiClient.get(API_ENDPOINTS.FLEET.LAYOUTS.GET_BY_ID(id));
    return response.data;
  },

  getActive: async (): Promise<BusLayout[]> => {
    const layouts = await busLayoutService.getAll();
    return layouts.filter((layout) => layout.status === "active");
  },

  create: async (layoutData: Omit<BusLayout, "id" | "createdAt" | "updatedAt" | "busesUsing">): Promise<BusLayout> => {
    const seats = layoutData.seats.map((seat) => ({
      seatNumber: seat.seatNumber,
      rowPosition: seat.rowPosition,
      colPosition: seat.colPosition,
      seatType: seat.seatType || "SEATER",
      isActive: seat.isActive !== undefined ? seat.isActive : true,
    }));

    const payload = {
      name: layoutData.name,
      description: layoutData.description,
      totalRows: layoutData.totalRows,
      totalColumns: layoutData.totalColumns,
      seats,
    };

    const response = await apiClient.post(API_ENDPOINTS.FLEET.LAYOUTS.CREATE, payload);
    return response.data;
  },

  update: async (id: string, layoutData: Partial<BusLayout>): Promise<BusLayout> => {
    const payload: any = { ...layoutData };

    if (layoutData.seats) {
      payload.seats = layoutData.seats.map((seat) => ({
        seatNumber: seat.seatNumber,
        rowPosition: seat.rowPosition,
        colPosition: seat.colPosition,
        seatType: seat.seatType || "SEATER",
        isActive: seat.isActive !== undefined ? seat.isActive : true,
      }));
    }

    const response = await apiClient.patch(API_ENDPOINTS.FLEET.LAYOUTS.UPDATE(id), payload);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiClient.delete(API_ENDPOINTS.FLEET.LAYOUTS.DELETE(id));
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting bus layout:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete layout",
      };
    }
  },

  duplicate: async (id: string): Promise<BusLayout | null> => {
    const response = await apiClient.post(API_ENDPOINTS.FLEET.LAYOUTS.DUPLICATE(id));
    return response.data;
  },

  // Template operations
  getTemplates: () => LAYOUT_TEMPLATES,

  applyTemplate: (templateKey: keyof typeof LAYOUT_TEMPLATES): Partial<BusLayout> => {
    const template = LAYOUT_TEMPLATES[templateKey];

    // Handle TSRTC Specific Layouts
    if (templateKey === "tsrtc_3x2_express") {
      const seats: LayoutSeat[] = [];
      const totalRows = template.totalRows;
      const totalCols = template.totalColumns;

      for (let row = 0; row < totalRows; row++) {
        for (let col = 0; col < totalCols; col++) {
          const isLastRow = row === totalRows - 1;
          const isAisle = col === 3;

          let seatType: SeatType = "SEATER";
          let isActive = true;

          if (isAisle && !isLastRow) {
            seatType = "EMPTY";
            isActive = false;
          }

          seats.push({
            id: `seat_${row}_${col}`,
            seatNumber: "",
            rowPosition: row,
            colPosition: col,
            seatType: seatType,
            isActive: isActive,
          });
        }
      }

      return {
        ...template,
        totalSeats: seats.filter((s) => s.seatType === "SEATER").length,
        seats: busLayoutService.autoNumberSeats(seats, template.numberingDirection),
      };
    }

    if (templateKey === "tsrtc_2x2_luxury") {
      const seats: LayoutSeat[] = [];
      const totalRows = template.totalRows;
      const totalCols = template.totalColumns;

      for (let row = 0; row < totalRows; row++) {
        for (let col = 0; col < totalCols; col++) {
          const isLastRow = row === totalRows - 1;
          const isAisle = col === 2;

          let seatType: SeatType = "SEATER";
          let isActive = true;

          if (isAisle && !isLastRow) {
            seatType = "EMPTY";
            isActive = false;
          }

          seats.push({
            id: `seat_${row}_${col}`,
            seatNumber: "",
            rowPosition: row,
            colPosition: col,
            seatType: seatType,
            isActive: isActive,
          });
        }
      }

      return {
        ...template,
        totalSeats: seats.filter((s) => s.seatType === "SEATER").length,
        seats: busLayoutService.autoNumberSeats(seats, template.numberingDirection),
      };
    }

    const seats = createLayoutGrid(template.totalRows, template.totalColumns, template.layoutType);

    return {
      name: template.name,
      totalRows: template.totalRows,
      totalColumns: template.totalColumns,
      layoutType: template.layoutType,
      description: template.description,
      status: template.status,
      numberingDirection: template.numberingDirection,
      totalSeats: seats.filter((s) => s.seatType === "SEATER").length,
      seats: busLayoutService.autoNumberSeats(seats, template.numberingDirection),
    };
  },

  updateSeat: async (layoutId: string, seatId: string, seatData: Partial<LayoutSeat>): Promise<BusLayout | null> => {
    const layout = await busLayoutService.getById(layoutId);
    if (!layout) return null;

    const seatIndex = layout.seats.findIndex((s) => s.id === seatId);
    if (seatIndex === -1) return null;

    layout.seats[seatIndex] = { ...layout.seats[seatIndex], ...seatData };
    return busLayoutService.update(layoutId, { seats: layout.seats });
  },

  bulkUpdateSeats: async (
    layoutId: string,
    seatIds: string[],
    updateData: Partial<LayoutSeat>,
  ): Promise<BusLayout | null> => {
    const layout = await busLayoutService.getById(layoutId);
    if (!layout) return null;

    layout.seats = layout.seats.map((seat) => {
      if (seatIds.includes(seat.id)) {
        return { ...seat, ...updateData };
      }
      return seat;
    });

    return busLayoutService.update(layoutId, { seats: layout.seats });
  },

  autoNumberSeats: (seats: LayoutSeat[], direction: "LTR" | "RTL" = "RTL"): LayoutSeat[] => {
    let globalCounter = 1;

    const maxCol = Math.max(...seats.map((s) => s.colPosition), 0);
    const totalCols = maxCol + 1;
    const aisleCol = totalCols === 5 ? 2 : totalCols === 6 ? 3 : Math.floor(totalCols / 2);

    [...seats].sort((a, b) => {
      if (a.rowPosition !== b.rowPosition) return a.rowPosition - b.rowPosition;
      return direction === "RTL" ? b.colPosition - a.colPosition : a.colPosition - b.colPosition;
    });

    const numberedSeatsMap: Record<string, string> = {};

    const rowBlocks: Record<number, { left: LayoutSeat[]; right: LayoutSeat[]; middle: LayoutSeat[] }> = {};

    seats.forEach((s) => {
      if (s.seatType !== "SEATER") return;
      if (!rowBlocks[s.rowPosition]) rowBlocks[s.rowPosition] = { left: [], right: [], middle: [] };
      if (s.colPosition < aisleCol) rowBlocks[s.rowPosition].left.push(s);
      else if (s.colPosition > aisleCol) rowBlocks[s.rowPosition].right.push(s);
      else rowBlocks[s.rowPosition].middle.push(s);
    });

    let maxLeft = 0;
    let maxRight = 0;
    let maxMiddle = 0;
    Object.values(rowBlocks).forEach((blocks) => {
      maxLeft = Math.max(maxLeft, blocks.left.length);
      maxRight = Math.max(maxRight, blocks.right.length);
      maxMiddle = Math.max(maxMiddle, blocks.middle.length);
    });

    const regularSeats: LayoutSeat[] = [];
    const specialSeats: LayoutSeat[] = [];

    Object.values(rowBlocks).forEach((blocks) => {
      if (blocks.left.length > 0) {
        if (blocks.left.length < maxLeft) specialSeats.push(...blocks.left);
        else regularSeats.push(...blocks.left);
      }
      if (blocks.right.length > 0) {
        if (blocks.right.length < maxRight) specialSeats.push(...blocks.right);
        else regularSeats.push(...blocks.right);
      }
      if (blocks.middle.length > 0) {
        if (blocks.middle.length < maxMiddle) specialSeats.push(...blocks.middle);
        else regularSeats.push(...blocks.middle);
      }
    });

    const sortFn = (a: LayoutSeat, b: LayoutSeat) => {
      if (a.rowPosition !== b.rowPosition) return a.rowPosition - b.rowPosition;
      return direction === "RTL" ? b.colPosition - a.colPosition : a.colPosition - b.colPosition;
    };

    regularSeats.sort(sortFn);
    specialSeats.sort(sortFn);

    regularSeats.forEach((seat) => {
      numberedSeatsMap[seat.id] = String(globalCounter++);
    });
    specialSeats.forEach((seat) => {
      numberedSeatsMap[seat.id] = String(globalCounter++);
    });

    return seats.map((seat) => ({
      ...seat,
      seatNumber: numberedSeatsMap[seat.id] || "",
    }));
  },

  generateGrid: (
    rows: number,
    cols: number,
    layoutType: LayoutType,
    direction: "LTR" | "RTL" = "RTL",
  ): LayoutSeat[] => {
    const seats = createLayoutGrid(rows, cols, layoutType);

    return busLayoutService.autoNumberSeats(seats, direction);
  },

  validateLayout: (layout: Partial<BusLayout>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!layout.name || layout.name.trim().length === 0) {
      errors.push("Layout name is required");
    }

    if (!layout.totalRows || layout.totalRows < 1 || layout.totalRows > 20) {
      errors.push("Total rows must be between 1 and 20");
    }

    if (!layout.totalColumns || layout.totalColumns < 2 || layout.totalColumns > 10) {
      errors.push("Total columns must be between 2 and 10");
    }

    if (layout.seats) {
      if (layout.seats.length === 0) {
        errors.push("Layout must have at least one seat");
      }

      // Check for duplicate seat numbers (ignore empty strings for aisles/spaces)
      const seaterNumbers = layout.seats
        .filter((s) => s.seatType === "SEATER" && s.seatNumber.trim() !== "")
        .map((s) => s.seatNumber);

      const duplicates = seaterNumbers.filter((num, index) => seaterNumbers.indexOf(num) !== index);
      if (duplicates.length > 0) {
        errors.push(`Duplicate seat numbers found: ${[...new Set(duplicates)].join(", ")}`);
      }
    }

    return { valid: errors.length === 0, errors };
  },

  canDelete: async (id: string): Promise<{ canDelete: boolean; reason?: string }> => {
    const layout = await busLayoutService.getById(id);
    if (!layout) {
      return { canDelete: false, reason: "Layout not found" };
    }
    if (layout.busesUsing > 0) {
      return { canDelete: false, reason: `${layout.busesUsing} buses are using this layout` };
    }
    return { canDelete: true };
  },

  getStats: async () => {
    const layouts = await busLayoutService.getAll();
    const activeLayouts = layouts.filter((l) => l.status === "active");
    const totalBusesUsing = layouts.reduce((sum, l) => sum + l.busesUsing, 0);
    const mostUsed = layouts.reduce((max, l) => (l.busesUsing > max.busesUsing ? l : max), layouts[0]);

    return {
      totalLayouts: layouts.length,
      activeLayouts: activeLayouts.length,
      totalBusesUsing,
      mostUsedLayout: mostUsed?.name || "N/A",
    };
  },
};
