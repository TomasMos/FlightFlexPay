import { Flight, FlightSearch } from "@shared/schema";

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
    locations: Record<string, {
      cityCode: string;
      countryCode: string;
    }>;
    aircraft: Record<string, string>;
    currencies: Record<string, string>;
    carriers: Record<string, string>;
  };
}

export class AmadeusService {
  private config: AmadeusConfig;
  private token: AmadeusToken | null = null;

  constructor() {
    this.config = {
      clientId: process.env.AMADEUS_CLIENT_ID || process.env.AMADEUS_API_KEY || "",
      clientSecret: process.env.AMADEUS_CLIENT_SECRET || process.env.AMADEUS_SECRET || "",
      baseUrl: process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com",
    };

    if (!this.config.clientId || !this.config.clientSecret) {
      console.warn("Amadeus API credentials not found. Flight search will return sample data.");
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && this.token.expires_at > Date.now()) {
      return this.token.access_token;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/security/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      this.token = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in * 1000) - 60000, // 1 minute buffer
      };

      return this.token.access_token;
    } catch (error) {
      console.error("Error getting Amadeus access token:", error);
      throw error;
    }
  }

  async searchFlights(searchParams: FlightSearch): Promise<Flight[]> {
    // If no API credentials, return empty array with informative error
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error("Amadeus API credentials not configured. Please set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET environment variables.");
    }

    try {
      const token = await this.getAccessToken();
      
      const queryParams = new URLSearchParams({
        originLocationCode: searchParams.origin,
        destinationLocationCode: searchParams.destination,
        departureDate: searchParams.departureDate,
        adults: searchParams.passengers.toString(),
        max: "10", // Limit results
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
        }
      );

      if (!response.ok) {
        throw new Error(`Amadeus API error: ${response.status} ${response.statusText}`);
      }

      const data: AmadeusFlightResponse = await response.json();
      return this.transformAmadeusResponse(data, searchParams);
    } catch (error) {
      console.error("Error searching flights:", error);
      throw error;
    }
  }

  private transformAmadeusResponse(response: AmadeusFlightResponse, searchParams: FlightSearch): Flight[] {
    return response.data.map((offer) => {
      const segment = offer.itineraries[0]?.segments[0];
      const lastSegment = offer.itineraries[0]?.segments[offer.itineraries[0].segments.length - 1];
      
      const carrierCode = segment?.carrierCode || "XX";
      const carrierName = response.dictionaries.carriers?.[carrierCode] || "Unknown Airline";

      return {
        id: offer.id,
        airline: carrierName,
        flightNumber: `${carrierCode} ${segment?.number || "000"}`,
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureTime: new Date(segment?.departure.at || new Date()),
        arrivalTime: new Date(lastSegment?.arrival.at || new Date()),
        duration: offer.itineraries[0]?.duration || "PT0H0M",
        stops: segment?.numberOfStops || 0,
        price: offer.price.total,
        currency: offer.price.currency,
        cabin: offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || "ECONOMY",
        availableSeats: offer.numberOfBookableSeats,
        amenities: {
          checkedBags: offer.travelerPricings[0]?.fareDetailsBySegment[0]?.includedCheckedBags?.quantity || 0,
          fareType: offer.pricingOptions.fareType,
        },
      };
    });
  }

  async getAirportSuggestions(query: string): Promise<Array<{ code: string; name: string; city: string }>> {
    if (!this.config.clientId || !this.config.clientSecret) {
      return [];
    }

    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${this.config.baseUrl}/v1/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(query)}&page%5Blimit%5D=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.data?.map((location: any) => ({
        code: location.iataCode,
        name: location.name,
        city: location.address?.cityName || "",
      })) || [];
    } catch (error) {
      console.error("Error getting airport suggestions:", error);
      return [];
    }
  }
}

export const amadeusService = new AmadeusService();
