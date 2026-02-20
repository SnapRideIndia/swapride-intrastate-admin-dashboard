import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TablePaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className,
}: TablePaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startRange = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalCount);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-100",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div className="text-xs font-medium text-muted-foreground italic min-w-fit">
          Showing <span className="text-foreground font-bold">{startRange}</span> to{" "}
          <span className="text-foreground font-bold">{endRange}</span> of{" "}
          <span className="text-foreground font-bold">{totalCount}</span> records
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <Select value={pageSize.toString()} onValueChange={(val) => onPageSizeChange(parseInt(val))}>
            <SelectTrigger className="h-8 w-[65px] text-xs border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:ring-0 rounded-md mr-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-gray-200 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-30"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-gray-200 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-30"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center justify-center px-4 font-bold text-xs bg-muted/30 h-8 rounded-md border border-border/40 min-w-[80px]">
            Page {currentPage} <span className="mx-1 font-normal text-muted-foreground">/</span> {totalPages}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-gray-200 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-30"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-gray-200 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-30"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
