import { useState, useMemo } from "react";
import { MapPin, Route, Search, Filter, XCircle, Clock, User, Calendar, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuggestions, useUpdateSuggestion } from "@/features/suggestions/hooks/useSuggestionQueries";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { AccessDenied } from "@/components/AccessDenied";
import { useNavigate } from "react-router-dom";

const Suggestions = () => {
  const { data: suggestions = [], isLoading, isError, error } = useSuggestions();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("stops");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Filtered Logic
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => {
      const userName = s.user?.fullName || "";
      const matchesSearch =
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.dropoffAddress.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [suggestions, searchQuery, statusFilter]);

  const handleReview = (suggestionId: string) => {
    navigate(`/routes/suggestions/${suggestionId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-none">
            Pending
          </Badge>
        );
      case "REVIEWED":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none">
            Reviewed
          </Badge>
        );
      case "IMPLEMENTED":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-none">
            Implemented
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 border-none">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <FullPageLoader show={isLoading} label="Fetching Suggestions..." />

      <PageHeader title="Stop Suggestions" subtitle="Manage and review stop and route requests from users" />

      <div className="mt-6">
        <Tabs defaultValue="stops" className="w-full" onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger
                value="stops"
                className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Stops
              </TabsTrigger>
              <TabsTrigger
                value="routes"
                className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Route className="h-4 w-4 mr-2" />
                Routes
              </TabsTrigger>
            </TabsList>

            {activeTab === "stops" && (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user or address..."
                    className="pl-9 h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-10">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REVIEWED">Reviewed</SelectItem>
                    <SelectItem value="IMPLEMENTED">Implemented</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <TabsContent value="stops" className="mt-0">
            {isError ? (
              (error as any)?.response?.status === 403 ? (
                <AccessDenied />
              ) : (
                <div className="dashboard-card py-20 flex flex-col items-center justify-center text-center">
                  <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                    <XCircle className="h-10 w-10 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Failed to load suggestions</h3>
                  <p className="text-muted-foreground max-w-sm">
                    There was an error connecting to the server. Please check your connection and try again.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
                    Retry Connection
                  </Button>
                </div>
              )
            ) : filteredSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuggestions.map((suggestion) => (
                  <Card
                    key={suggestion.id}
                    className="dashboard-card group overflow-hidden border-transparent hover:border-primary/30 transition-all duration-300"
                  >
                    <CardHeader className="p-5 pb-0">
                      <div className="flex justify-between items-start mb-3">
                        {getStatusBadge(suggestion.status)}
                        <div className="flex items-center text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(suggestion.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                        {suggestion.pickupAddress.split(",")[0]} → {suggestion.dropoffAddress.split(",")[0]}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{suggestion.user?.fullName}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="space-y-5">
                        <div className="relative pl-6 space-y-4">
                          <div className="absolute left-1 top-1.5 bottom-1.5 w-[2px] bg-gradient-to-b from-primary via-border to-orange-500" />
                          <div className="absolute left-0 top-1 h-2 w-2 rounded-full bg-primary ring-4 ring-primary/10" />
                          <div className="absolute left-0 bottom-1 h-2 w-2 rounded-full bg-orange-500 ring-4 ring-orange-500/10" />

                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none mb-1">
                              Pickup
                            </p>
                            <p className="text-sm font-semibold line-clamp-1">{suggestion.pickupAddress}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none mb-1">
                              Dropoff
                            </p>
                            <p className="text-sm font-semibold line-clamp-1">{suggestion.dropoffAddress}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="px-2 py-1 rounded bg-primary/5 text-primary text-[10px] font-bold tracking-wider">
                              {suggestion.shift}
                            </div>
                            <div className="flex items-center text-xs font-medium text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 mr-1 text-primary/60" />
                              {suggestion.reachingTime}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
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
                <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No suggestions found</h3>
                <p className="text-muted-foreground max-w-sm">
                  We couldn't find any suggestions matching your search or filters.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="routes" className="mt-0">
            <div className="dashboard-card py-32 flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 animate-pulse">
                <Route className="h-10 w-10 text-primary/40" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Route Suggestions</h3>
              <p className="text-muted-foreground max-w-sm mb-8">
                The community-driven route planning feature is in development. Check back soon for updates!
              </p>
              <Badge
                variant="outline"
                className="px-5 py-1.5 text-xs font-bold border-primary/20 text-primary bg-primary/5 uppercase tracking-widest rounded-full"
              >
                Future Feature
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Suggestions;
