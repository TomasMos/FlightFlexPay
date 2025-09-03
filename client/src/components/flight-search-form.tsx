import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { flightSearchSchema, type FlightSearchRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AirportAutocomplete } from "./airport-autocomplete.tsx";
import { Calendar, User, Search, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_CURRENCIES, determineUserCurrency, saveCurrencyToStorage, type CurrencyCode } from "@/utils/currency";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { trackFlightSearch } from "@/lib/metaPixel";
import plane from '../assets/plane.jpg'

interface FlightSearchFormProps {
  onSearch: (searchParams: FlightSearchRequest & { currency: CurrencyCode }) => void;
  isLoading?: boolean;
}

export function FlightSearchForm({
  onSearch,
  isLoading,
}: FlightSearchFormProps) {
  const [tripType, setTripType] = useState<
    "return" | "one_way" | "multicity"
  >("return");
  const [originIata, setOriginIata] = useState("");
  const [destinationIata, setDestinationIata] = useState("");
  const { setCurrency, currency: selectedCurrency } = useCurrency();
  const { currentUser } = useAuth();

  const form = useForm<FlightSearchRequest>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      origin: "",
      destination: "",
      departureDate: "",
      returnDate: "",
      passengers: 1,
      tripType: "return",
    },
  });

  // Initialize currency and load previous search from localStorage on component mount
  useEffect(() => {
    
    const savedSearch = localStorage.getItem("lastFlightSearch");
    if (savedSearch) {
      try {
        const searchData = JSON.parse(savedSearch);
        // Restore form values
        form.reset({
          origin: searchData.originFull || "",
          destination: searchData.destinationFull || "",
          departureDate: searchData.departureDate || "",
          returnDate: searchData.returnDate || "",
          passengers: searchData.passengers || 1,
          tripType: searchData.tripType || "return",
        });
        setTripType(searchData.tripType || "return");
        setOriginIata(searchData.origin || "");
        setDestinationIata(searchData.destination || "");
      } catch (error) {
        console.error("Error loading saved search:", error);
      }
    }
  }, [form, currentUser]);

  const onSubmit = (data: FlightSearchRequest) => {
    // Use IATA codes if available, otherwise fall back to entered text
    const searchData = {
      ...data,
      tripType,
      origin: originIata,
      destination: destinationIata,
      currency: selectedCurrency,
    };
    
    // Track flight search in Meta Pixel
    trackFlightSearch(originIata || data.origin, destinationIata || data.destination, data.passengers);
    
    // Save currency to localStorage
    saveCurrencyToStorage(selectedCurrency);
    
    // Save search to localStorage for future use
    const searchToSave = {
      ...searchData,
      originFull: data.origin,
      destinationFull: data.destination,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("lastFlightSearch", JSON.stringify(searchToSave));
    
    onSearch(searchData);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="bg-cover bg-no-repeat bg-center border-b border-splickets-slate-200 min-h-dvh flex flex-col gap-20 py-20 lg:py-0"
      style={{ backgroundImage: `url(${plane})` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col justify-center gap-20 ">
          <div
            className="rounded-2xl backdrop-blur-md bg-white/30 p-20 shadow-lg"
            data-testid="glass-container"
          >
            <div className="text-center">
              <h1
                className="text-5xl md:text-6xl font-bold text-splickets-slate-900 mb-8"
                data-testid="title-main"
              >
                Book Now, Pay Later
              </h1>
              <p
                className="text-xl md:text-2xl text-gray-900 leading-relaxed"
                data-testid="text-subtitle"
              >
                Lock in early prices with a 20% deposit and spread the rest over flexible installments
              </p>
            </div>
          </div>
  
          <div className=" bg-splickets-slate-50 rounded-2xl p-10 shadow-sm border border-splickets-slate-200 ">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            data-testid="form-flight-search"
          >
            <div className="flex flex-wrap justify-between items-center mb-6">
              <RadioGroup
                value={tripType}
                onValueChange={(value) => setTripType(value as typeof tripType)}
                className="flex flex-wrap gap-4"
                data-testid="radiogroup-trip-type"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="return"
                    id="return"
                    data-testid="radio-return"
                  />
                  <Label htmlFor="return" className="text-splickets-slate-700">
                    Return
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="one_way"
                    id="one_way"
                    data-testid="radio-one_way"
                  />
                  <Label htmlFor="one_way" className="text-splickets-slate-700">
                    One way
                  </Label>
                </div>
              </RadioGroup>
              
              {/* Currency Dropdown */}
              <div className="flex items-center space-x-2">
                <div className="relative  w-24">
                  <Select
                    value={selectedCurrency}
                    onValueChange={(value) => setCurrency(value as CurrencyCode)}
                  >
                    <SelectTrigger
                      className=" pl-4 pr-4 py-2 border-splickets-slate-300 focus:ring-2 focus:ring-splickets-primary focus:border-splickets-primary bg-white"
                      data-testid="select-currency"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="min-w-[var(--radix-select-trigger-width)] w-auto">
                      {SUPPORTED_CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Origin */}
              <AirportAutocomplete
                label="From"
                placeholder="City or airport"
                value={form.watch("origin")}
                onChange={(displayValue, iataCode) => {
                  form.setValue("origin", displayValue);
                  setOriginIata(iataCode);
                }}
                icon="departure"
                error={form.formState.errors.origin?.message}
                testId="input-origin"
              />

              {/* Destination */}
              <AirportAutocomplete
                label="To"
                placeholder="City or airport"
                value={form.watch("destination")}
                onChange={(displayValue, iataCode) => {
                  form.setValue("destination", displayValue);
                  setDestinationIata(iataCode);
                }}
                icon="arrival"
                error={form.formState.errors.destination?.message}
                testId="input-destination"
              />

              {/* Departure Date */}
              <div className="relative">
                <Label className="block text-sm font-medium text-splickets-slate-700 mb-1">
                  Departure
                </Label>
                <div className="relative flex">
                  <Input
                    {...form.register("departureDate")}
                    type="date"
                    min={today}
                  className="hide-date-icon pl-10 pr-4 py-3 border-splickets-slate-300 focus:ring-2 focus:ring-splickets-primary focus:border-splickets-primary cursor-pointer"
                    data-testid="input-departure-date"
                    // CORRECTED: Use e.target to access the input element
                    onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  />
                  <Calendar
                    // Crucial: Add 'pointer-events-none' so clicks go *through* the icon to the input
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-splickets-slate-600 pointer-events-none"
                  />
                </div>
                {form.formState.errors.departureDate && (
                  <p
                    className="text-sm text-red-600 mt-1"
                    data-testid="error-departure-date"
                  >
                    {form.formState.errors.departureDate.message}
                  </p>
                )}
              </div>

              {/* Return Date */}
              <div className="relative">
                <Label
                  className={cn(
                    "block text-sm font-medium mb-1",
                    tripType === "one_way"
                      ? "text-splickets-slate-400"
                      : "text-splickets-slate-700",
                  )}
                >
                  Return
                </Label>
                <div className="relative flex">
                  <Input
                    {...form.register("returnDate")}
                    type="date"
                    min={form.watch("departureDate") || today}
                    disabled={tripType === "one_way"}
                  className="hide-date-icon pl-10 w-full pr-4 py-3 border-splickets-slate-300 focus:ring-2 focus:ring-splickets-primary focus:border-splickets-primary bg-white cursor-pointer"
                    data-testid="input-return-date"
                    // CORRECTED: Use e.target to access the input element
                    onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  />
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-splickets-slate-600 pointer-events-none" 
                    // Crucial: Add 'pointer-events-none' so clicks go *through* the icon to the input
                  />
                  
                </div>
              </div>

              {/* Passengers */}
              <div className="relative">
                <Label className="block text-sm font-medium text-splickets-slate-700 mb-1">
                  Passengers
                </Label>
                <div className="relative">
                  <Select
                    value={form.watch("passengers")?.toString()}
                    onValueChange={(value) =>
                      form.setValue("passengers", parseInt(value))
                    }
                  >
                    <SelectTrigger
                      className="pl-10 pr-4 py-3 border-splickets-slate-300 focus:ring-2 focus:ring-splickets-primary focus:border-splickets-primary bg-white"
                      data-testid="select-passengers"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Adult</SelectItem>
                      <SelectItem value="2">2 Adults</SelectItem>
                      <SelectItem value="3">3 Adults</SelectItem>
                      <SelectItem value="4">4 Adults</SelectItem>
                      <SelectItem value="5">5 Adults</SelectItem>
                      <SelectItem value="6">6 Adults</SelectItem>
                    </SelectContent>
                  </Select>
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-splickets-slate-600 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-splickets-accent hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
                data-testid="button-search-flights"
              >
                <Search className="h-4 w-4" />
                {isLoading ? "Searching..." : "Search Flights"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
