import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FlightSearchRequest,
  EnhancedFlightWithPaymentPlan,
} from "@shared/schema";
import { Navbar } from "@/components/navbar";
import { Header } from "@/components/header";
import { FlightSearchForm } from "@/components/flight-search-form";
import { FlightResults } from "@/components/flight-results";
import { TrustSection } from "@/components/trust-section";
import { Footer } from "@/components/footer";

// New: Define the type for the API response
interface FlightSearchResponse {
  searchId: number; // The ID from the backend
  flights: EnhancedFlightWithPaymentPlan[];
}

export default function Home() {
  const [searchParams, setSearchParams] = useState<FlightSearchRequest | null>(null);

  const {
    data: flightData,
    isLoading,
    error,
  } = useQuery<FlightSearchResponse>({
    queryKey: ["/api/flights/search", searchParams],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;
      if (!params) return { flights: [] };

      const searchQuery = new URLSearchParams(params as Record<string, string>);
      const response = await fetch(`/api/flights/search?${searchQuery}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to search flights");
      }

      return response.json();
    },
    enabled: !!searchParams,
  });
  // console.log("Home.ts - 41 - Frontend Data:", JSON.stringify(flightData, null, 2));

  const handleSearch = (params: FlightSearchRequest & { currency: string }) => {
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-splickets-slate-50" data-testid="page-home">
      <Navbar />
      <Header />

      <FlightSearchForm onSearch={handleSearch} isLoading={isLoading} />

      {searchParams && (
        <FlightResults
          flights={flightData?.flights || []}
          searchId={flightData?.searchId || 0}
          isLoading={isLoading}
          error={error instanceof Error ? error.message : undefined}
        />
      )}

      <TrustSection />
      <Footer />
    </div>
  );
}
