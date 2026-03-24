import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { MapPin, Route, Search, XCircle, Clock, Calendar, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSuggestions } from "@/features/suggestions/hooks/useSuggestions";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { TablePagination } from "@/components/ui/table-pagination";
import { AccessDenied } from "@/components/AccessDenied";
import { ROUTES } from "@/constants/routes";

const Suggestions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("q") || "";
  const statusFilter = searchParams.get("status") || "PENDING";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const activeSection = searchParams.get("section") || "stops";
  const [pageSize] = useState(10);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    data: suggestionsData,
    isLoading,
    isError,
    error,
  } = useSuggestions({
    search: debouncedSearch,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
  });

  const suggestions = suggestionsData?.data || [];
  const totalCount = suggestionsData?.pagination?.total || 0;

  const setSearchQuery = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set("q", val);
    else newParams.delete("q");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleStatusChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val !== "ALL") newParams.set("status", val);
    else newParams.delete("status");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  const handleSectionChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("section", val);
    setSearchParams(newParams);
  };

  const handleReview = (suggestionId: string) => {
    navigate(ROUTES.SUGGESTION_DETAILS.replace(":id", suggestionId));
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
      REVIEWED: { label: "Reviewed", className: "bg-blue-100 text-blue-700" },
      IMPLEMENTED: { label: "Implemented", className: "bg-green-100 text-green-700" },
      REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
    };
    const config = configs[status] || { label: status, className: "bg-slate-100 text-slate-700" };
    return (
      <Badge variant="secondary" className={`${config.className} border-none`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Fetching Suggestions..." />
      <PageHeader title="Stop Suggestions" subtitle="Review and manage route suggestions from users" />

      <div className="mt-6">
        <Tabs value={activeSection} onValueChange={handleSectionChange} className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="stops" className="px-6 py-2">
                <MapPin className="h-4 w-4 mr-2" />
                Stops
              </TabsTrigger>
              <TabsTrigger value="routes" className="px-6 py-2">
                <Route className="h-4 w-4 mr-2" />
                Routes
              </TabsTrigger>
            </TabsList>

            {activeSection === "stops" && (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Tabs value={statusFilter} onValueChange={handleStatusChange} className="w-full sm:w-auto">
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="ALL" className="text-xs font-bold uppercase tracking-tight">All</TabsTrigger>
                        <TabsTrigger value="PENDING" className="text-xs font-bold uppercase tracking-tight">Pending</TabsTrigger>
                        <TabsTrigger value="REVIEWED" className="text-xs font-bold uppercase tracking-tight">Reviewed</TabsTrigger>
                        <TabsTrigger value="IMPLEMENTED" className="text-xs font-bold uppercase tracking-tight">Done</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search user or address..."
                    className="pl-10 h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <TabsContent value="stops" className="mt-0 outline-none">
            {isError ? (
              (error as any)?.response?.status === 403 ? (
                <AccessDenied />
              ) : (
                <div className="dashboard-card py-20 flex flex-col items-center justify-center text-center">
                  <XCircle className="h-12 w-12 text-red-500 mb-6" />
                  <h3 className="text-xl font-semibold mb-2">Failed to load suggestions</h3>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
                </div>
              )
            ) : suggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
                    <CardHeader className="p-5 pb-0">
                      <div className="flex justify-between items-start mb-3">
                        {getStatusBadge(suggestion.status)}
                        <div className="flex items-center text-[10px] text-muted-foreground font-bold uppercase">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(suggestion.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {suggestion.pickupAddress.split(",")[0]} → {suggestion.dropoffAddress.split(",")[0]}
                      </CardTitle>
                      
                      <div 
                        className="flex items-center gap-2 mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`${ROUTES.USERS}/${suggestion.user?.id || suggestion.userId}`);
                        }}
                      >
                         <Avatar className="h-6 w-6 border border-border">
                            <AvatarImage src={suggestion.user?.profileUrl || ""} />
                            <AvatarFallback className="bg-muted text-muted-foreground font-bold uppercase text-[9px]">
                              {suggestion.user?.fullName?.substring(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                         </Avatar>
                         <span className="text-xs font-semibold text-muted-foreground">
                            {suggestion.user?.fullName || "Guest User"}
                         </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        <div className="relative pl-6 space-y-4 py-1">
                          <div className="absolute left-1 top-2 bottom-2 w-[1px] bg-gradient-to-b from-blue-400 via-slate-200 to-indigo-400" />
                          <div className="absolute left-0 top-1 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-500/10" />
                          <div className="absolute left-0 bottom-1 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-indigo-500/10" />

                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter leading-none mb-1">Pickup</p>
                            <p className="text-sm font-semibold truncate text-slate-700">{suggestion.pickupAddress}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter leading-none mb-1">Dropoff</p>
                            <p className="text-sm font-semibold truncate text-slate-700">{suggestion.dropoffAddress}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-[10px] font-bold text-primary bg-primary/5 uppercase">
                              {suggestion.shift}
                            </Badge>
                            <div className="flex items-center text-xs font-bold text-slate-500">
                              <Clock className="h-3.5 w-3.5 mr-1 text-primary/60" />
                              {suggestion.reachingTime}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 hover:bg-primary hover:text-white transition-all rounded-xl border border-slate-100 shadow-none"
                            onClick={() => handleReview(suggestion.id)}
                          >
                            Review <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="dashboard-card py-20 flex flex-col items-center justify-center text-center">
                <Search className="h-10 w-10 text-muted-foreground/30 mb-6" />
                <h3 className="text-xl font-semibold mb-2 text-slate-700">No suggestions found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
                <Button variant="outline" onClick={() => { setSearchQuery(""); handleStatusChange("ALL"); }}>Clear Filters</Button>
              </div>
            )}

            {totalCount > 0 && !isLoading && (
              <TablePagination
                currentPage={currentPage}
                onPageChange={handlePageChange}
                totalCount={totalCount}
                pageSize={pageSize}
              />
            )}
          </TabsContent>

          <TabsContent value="routes" className="mt-0 outline-none">
            <div className="dashboard-card py-32 flex flex-col items-center justify-center text-center border-dashed border-2">
              <Route className="h-10 w-10 text-primary/30 mb-6 animate-pulse" />
              <h3 className="text-2xl font-bold mb-2">Route Suggestions</h3>
              <p className="text-muted-foreground mb-8">This module is under development.</p>
              <Badge variant="outline" className="rounded-full px-6 py-1 bg-primary/5 text-primary border-primary/20">COMING SOON</Badge>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Suggestions;
