import { useState } from "react";
import { searchApi } from "../api/search";
import { SearchResult, SearchTripsParams } from "../types/search";
import { useLogs } from "@/pages/TestModules/shared/LogContext";
import { toast } from "@/hooks/use-toast";

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addLog } = useLogs();

  const searchTrips = async (params: SearchTripsParams) => {
    setIsLoading(true);
    addLog(`Searching trips for ${params.tripDate}...`, "request");

    try {
      const data = await searchApi.searchTrips(params);
      setResults(data);
      addLog(`Found ${data.length} route options.`, "success");
      return data;
    } catch (error: any) {
      addLog(`Search failed: ${error.message}`, "error");
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    isLoading,
    searchTrips,
    setResults,
  };
}
