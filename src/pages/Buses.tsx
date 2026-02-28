import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddBusDialog, useBuses } from "@/features/buses";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Bus } from "@/types";
import { cn } from "@/lib/utils";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { TablePagination } from "@/components/ui/table-pagination";

const Buses = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "all";
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

  const setCurrentPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    data: busesData,
    isLoading,
    error,
    refetch,
  } = useBuses({
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
  });

  const buses = busesData?.data || [];
  const totalCount = busesData?.pagination?.total || 0;

  const viewBusDetails = (bus: Bus) => {
    navigate(`/buses/${bus.id}`);
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
          <AlertCircle className="h-12 w-12 mb-4" />
          <h2 className="text-xl font-semibold">Failed to load buses</h2>
          <p className="mt-1">{(error as any).message}</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Loading fleet data..." />

      <PageHeader
        title="Bus Management"
        subtitle={`Manage your fleet of ${totalCount} buses`}
        actions={<AddBusDialog onBusAdded={() => refetch()} />}
      />

      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by bus number, registration, or model..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bus Number</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Route</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading && buses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-muted rounded-full p-6 mb-4">
                      <Search className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No buses found</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                      We couldn't find any buses matching your current search or filters. Try adjusting your search term
                      or status selection.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear all filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              buses.map((bus) => (
                <TableRow key={bus.id} className="cursor-pointer hover:bg-muted/50" onClick={() => viewBusDetails(bus)}>
                  <TableCell className="font-medium">{bus.busNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{bus.model || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">{bus.manufactureYear || "N/A"}</p>
                    </div>
                  </TableCell>
                  <TableCell>{bus.registrationNumber || "N/A"}</TableCell>
                  <TableCell>{bus.seatCapacity || "N/A"} seats</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "badge",
                        bus.status === "ACTIVE" && "badge-success",
                        bus.status === "MAINTENANCE" && "badge-warning",
                        bus.status === "INACTIVE" && "badge-error",
                      )}
                    >
                      {bus.status}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">{bus.currentRoute || "Unassigned"}</TableCell>
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
    </DashboardLayout>
  );
};

export default Buses;
