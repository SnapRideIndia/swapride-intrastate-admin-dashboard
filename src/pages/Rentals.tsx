import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { ClipboardList, Search, RotateCcw } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRentals, RentalCard } from "@/features/rentals";
import { TablePagination } from "@/components/ui/table-pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Rentals() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const statusFilter = searchParams.get("status") || "all";
  const searchQuery = searchParams.get("q") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [pageSize, setPageSize] = useState(20);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: rentalsData, isLoading, refetch } = useRentals({
    status: statusFilter === "all" ? undefined : statusFilter,
    q: debouncedSearch,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  const rentals = rentalsData?.data || [];
  const totalCount = rentalsData?.total || 0;

  const setSearchQuery = (val: string) => {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Vehicle Rentals"
          subtitle="Manage private vehicle/bus rental inquiries and callback requests."
          actions={
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="rounded-full shadow-sm hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          }
        />

        <Card className="p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm border-border/60 rounded-xl bg-background/50 backdrop-blur-sm">
          <Tabs
            value={statusFilter}
            onValueChange={handleStatusChange}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all" className="text-xs font-bold uppercase tracking-tight">All</TabsTrigger>
              <TabsTrigger value="PENDING" className="text-xs font-bold uppercase tracking-tight">Pending</TabsTrigger>
              <TabsTrigger value="CALLED" className="text-xs font-bold uppercase tracking-tight">Called</TabsTrigger>
              <TabsTrigger value="QUOTED" className="text-xs font-bold uppercase tracking-tight">Quoted</TabsTrigger>
              <TabsTrigger value="CONFIRMED" className="text-xs font-bold uppercase tracking-tight">Done</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by location or user..."
              className="pl-10 h-10 bg-background/50 border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-slate-50 animate-pulse border border-slate-100" />
            ))
          ) : rentals.length === 0 ? (
            <div className="col-span-full py-20 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-center border-dashed border-2">
              <ClipboardList className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">No inquiries found</h3>
              <p className="text-slate-500 max-w-sm mb-4"> Try adjusting your filters or search keywords.</p>
              <Button variant="outline" onClick={() => { setSearchQuery(""); handleStatusChange("all"); }}>Clear Filters</Button>
            </div>
          ) : (
            rentals.map((rental) => (
              <RentalCard key={rental.id} rental={rental} />
            ))
          )}
        </div>

        {totalCount > 0 && !isLoading && (
          <TablePagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
