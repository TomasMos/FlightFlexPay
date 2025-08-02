import {
  Flight,
  FlightSearch,
  EnhancedFlight,
  FlightSegment,
  FlightItinerary,
} from "@shared/schema";

interface AmadeusConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

interface AmadeusToken {
  access_token: string;
  expires_at: number;
}

interface AmadeusFlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  paymentCardRequired: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      operating?: {
        carrierCode: string;
      };
      duration: string;
      id: string;
      numberOfStops: number;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
    fees: Array<{
      amount: string;
      type: string;
    }>;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      fareBasis: string;
      class: string;
      includedCheckedBags: {
        quantity: number;
      };
    }>;
  }>;
}

interface AmadeusFlightResponse {
  meta: {
    count: number;
    links?: {
      self: string;
    };
  };
  data: AmadeusFlightOffer[];
  dictionaries: {
    locations: Record<
      string,
      {
        cityCode: string;
        countryCode: string;
        // Added to match the actual Amadeus Locations API response for airports
        name?: string; // Airport name
        address?: {
          cityName?: string; // City name for airports
        };
      }
    >;
    aircraft: Record<string, string>;
    currencies: Record<string, string>;
    carriers: Record<string, string>;
  };
}

export class AmadeusService {
  private config: AmadeusConfig;
  private token: AmadeusToken | null = null;

  constructor() {
    // Temporarily using production credentials for testing
    const useProd =
      process.env.AMADEUS_PROD_CLIENT_ID &&
      process.env.AMADEUS_PROD_CLIENT_SECRET;

    this.config = {
      clientId: useProd
        ? process.env.AMADEUS_PROD_CLIENT_ID || ""
        : process.env.AMADEUS_CLIENT_ID || process.env.AMADEUS_API_KEY || "",
      clientSecret: useProd
        ? process.env.AMADEUS_PROD_CLIENT_SECRET || ""
        : process.env.AMADEUS_CLIENT_SECRET || process.env.AMADEUS_SECRET || "",
      baseUrl: useProd
        ? "https://api.amadeus.com" // Production endpoint
        : "https://test.api.amadeus.com", // Test endpoint
    };

    if (!this.config.clientId || !this.config.clientSecret) {
      console.warn(
        "Amadeus API credentials not found. Flight search will return sample data.",
      );
    } else {
      console.log(
        `Amadeus API configured for ${useProd ? "PRODUCTION" : "TEST"} environment`,
      );
      console.log(`Base URL: ${this.config.baseUrl}`);
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && this.token.expires_at > Date.now()) {
      return this.token.access_token;
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}/v1/security/oauth2/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      this.token = {
        access_token: data.access_token,
        expires_at: Date.now() + data.expires_in * 1000 - 60000, // 1 minute buffer
      };

      return this.token.access_token;
    } catch (error) {
      console.error("Error getting Amadeus access token:", error);
      throw error;
    }
  }

  async searchFlights(searchParams: FlightSearch): Promise<EnhancedFlight[]> {
    // If no API credentials, return empty array with informative error
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error(
        "Amadeus API credentials not configured. Please set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET environment variables.",
      );
    }

    try {
      const token = await this.getAccessToken();

      const queryParams = new URLSearchParams({
        originLocationCode: searchParams.origin,
        destinationLocationCode: searchParams.destination,
        departureDate: searchParams.departureDate,
        adults: searchParams.passengers.toString(),
        max: "1", // Increased for better results
        currencyCode: "USD",
      });

      if (searchParams.returnDate && searchParams.tripType === "roundtrip") {
        queryParams.append("returnDate", searchParams.returnDate);
      }

      const response = await fetch(
        `${this.config.baseUrl}/v2/shopping/flight-offers?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error(
          `Amadeus API error: ${response.status} ${response.statusText}`,
        );
      }

      const data: AmadeusFlightResponse = await response.json();
      console.log(`Amadeus.ts - 215 - RAW:`, JSON.stringify(data, null, 2));
      const transformedData = this.transformEnhancedAmadeusResponse(
        data,
        searchParams,
      );
      console.log(
        `Amadeus.ts - 223 - Transformed:`,
        JSON.stringify(transformedData, null, 2),
      );
      return transformedData;
    } catch (error) {
      console.error("Error searching flights:", error);
      throw error;
    }
  }

  private transformEnhancedAmadeusResponse(
    response: AmadeusFlightResponse,
    searchParams: FlightSearch,
  ): EnhancedFlight[] {
    return response.data.map((offer) => {
      // Transform itineraries preserving Amadeus structure
      const itineraries: FlightItinerary[] = offer.itineraries.map(
        (itinerary) => ({
          duration: itinerary.duration,
          segments: itinerary.segments.map((segment) => {
            // Get airport/city names from dictionaries
            const departureLocation =
              response.dictionaries.locations?.[segment.departure.iataCode];
            const arrivalLocation =
              response.dictionaries.locations?.[segment.arrival.iataCode];

            return {
              departure: {
                ...segment.departure,
                airportName:
                  departureLocation?.name || segment.departure.iataCode, // Use name for airport, fallback to iataCode
                cityName:
                  departureLocation?.address?.cityName ||
                  departureLocation?.cityCode ||
                  segment.departure.iataCode, // Use city name from address, fallback to cityCode then iataCode
              },
              arrival: {
                ...segment.arrival,
                airportName: arrivalLocation?.name || segment.arrival.iataCode, // Use name for airport, fallback to iataCode
                cityName:
                  arrivalLocation?.address?.cityName ||
                  arrivalLocation?.cityCode ||
                  segment.arrival.iataCode, // Use city name from address, fallback to cityCode then iataCode
              },
              carrierCode: segment.carrierCode,
              airline: response.dictionaries.carriers?.[segment.operating?.carrierCode ?? segment.carrierCode],
              number: segment.number,
              aircraft: segment.aircraft,
              operating: segment.operating,
              duration: segment.duration,
              id: segment.id,
              numberOfStops: segment.numberOfStops,
            };
          }),
        }),
      );

      // Calculate computed display fields
      const firstItinerary = itineraries[0];
      const firstSegment = firstItinerary?.segments[0];
      const lastSegment =
        firstItinerary?.segments[firstItinerary.segments.length - 1];

      const airlineSet = new Set<string>();
      itineraries.forEach((itinerary) => {
        itinerary.segments.forEach((segment) => {
          airlineSet.add(segment.airline);
        });
      });

      const airlines = Array.from(airlineSet).join(', ')
      console.log(`printing airlines`, airlines);

      return {
        id: offer.id,
        source: offer.source,
        lastTicketingDate: offer.lastTicketingDate,
        numberOfBookableSeats: offer.numberOfBookableSeats,
        itineraries,
        price: {
          currency: offer.price.currency,
          total: offer.price.total,
          base: offer.price.base,
        },
        validatingAirlineCodes: offer.validatingAirlineCodes,

        // Computed display fields
        airlines: airlines,
        origin: firstSegment?.departure.cityName || searchParams.origin,
        destination: lastSegment?.arrival.cityName || searchParams.destination,
        departureTime: new Date(firstSegment?.departure.at || new Date()),
        arrivalTime: new Date(lastSegment?.arrival.at || new Date()),
        duration: firstItinerary?.duration || "PT0H0M",
        stops: Math.max(0, firstItinerary?.segments.length - 1 || 0), // segments.length - 1 = number of stops
        cabin:
          offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin ||
          "ECONOMY",
        availableSeats: offer.numberOfBookableSeats,
        numberOfPassengers: offer?.travelerPricings.length,
      };
    });
  }

  async getAirportSuggestions(
    query: string,
  ): Promise<Array<{ code: string; name: string; city: string }>> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `${this.config.baseUrl}/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${encodeURIComponent(query)}&page%5Blimit%5D=20&sort=analytics.travelers.score&view=FULL`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        console.error(
          `Airport search API error: ${response.status} ${response.statusText}`,
        );
        return [];
      }

      const data = await response.json();

      return (
        data.data
          ?.map((location: any) => {
            // Handle both airport and city results
            if (location.subType === "AIRPORT") {
              return {
                code: location.iataCode,
                name: location.name,
                city: location.address?.cityName || location.name,
              };
            } else if (location.subType === "CITY") {
              return {
                code: location.iataCode,
                name: `${location.name} - All Airports`,
                city: location.name,
              };
            }
            return null;
          })
          .filter(Boolean) || []
      );
    } catch (error) {
      console.error("Error getting airport suggestions:", error);
      return [];
    }
  }
}

export const amadeusService = new AmadeusService();
