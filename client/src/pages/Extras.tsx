import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Shield, Plane, CheckCircle, Activity, ChevronDown, Luggage, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnhancedFlightWithPaymentPlan } from "@shared/schema";
import { BookingWizard } from "@/components/booking-wizard";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formattedPrice } from "@/utils/formatters";

type ProtectionSelection = 
  | { type: "none" }
  | { type: "all" }
  | { type: "specific"; passengers: number[] };

interface SeatSelection {
  [passengerIndex: number]: "window" | "aisle" | "next_to_passenger" | "random" | undefined;
}

interface ExtrasSelections {
  additionalBaggage: ProtectionSelection | null;
  travelInsurance: ProtectionSelection | null;
  flexibleTicket: ProtectionSelection | null;
  seatSelection: SeatSelection;
  airlineInsolvency: ProtectionSelection | null;
}

// South African airport IATA codes (from amadeus service)
const ZA_AIRPORTS = [
  "BFN", // Bloemfontein – Bram Fischer International
  "CPT", // Cape Town International
  "DUR", // Durban – King Shaka International
  "ELS", // East London Airport
  "GRJ", // George Airport
  "HDS", // Hoedspruit Airport
  "JNB", // Johannesburg – O. R. Tambo International
  "HLA", // Lanseria International (Johannesburg/Pretoria area)
  "KIM", // Kimberley Airport
  "MQP", // Nelspruit – Kruger Mpumalanga International
  "PLZ", // Gqeberha (Port Elizabeth) – Chief Dawid Stuurman International
  "PTG", // Polokwane International
  "RCB", // Richards Bay Airport
  "UTN", // Upington Airport
  "MBD", // Mafikeng – Mmabatho International
  "SZK", // Skukuza Airport
  "LAY", // Ladysmith Airport
  "MGH", // Margate Airport
  "FCB", // Ficksburg Airport
  "GIY", // Giyani Airport
  "HLW", // Hluhluwe Airport
  "KOF", // Komatipoort Airport
  "LCD", // Louis Trichardt Airport
  "LLE", // Malelane Airport
  "MEZ", // Musina Airport
  "NCS", // Newcastle Airport
  "LPZ", // Phalaborwa Airport
  "PBZ", // Plettenberg Bay Airport
  "PZB", // Pietermaritzburg Airport
  "UTT", // Mthatha Airport
  "ZAA", // Timbavati Private Nature Reserve Airport
];

const extrasOptions = [
  {
    id: "additionalBaggage" as const,
    title: "Additional Checked Baggage",
    description: "Add extra checked baggage allowance for your journey.",
    icon: Luggage,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    pricePercentage: 0.1, // 10% of per passenger flight cost
    perPassenger: true,
  },
  {
    id: "travelInsurance" as const,
    title: "Travel Insurance (Medical)",
    description: "Travel worry-free with coverage for emergency medical expenses.",
    icon: Activity,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
    coverage: [
      "Medical treatments",
      "Hospital visits",
      "Evacuation/repatriation",
      "Illness before departure",
      "...and more.",
    ],
    pricePercentage: 0.11, // 11% of flight cost
    perPassenger: false,
    internationalOnly: true,
  },
  {
    id: "flexibleTicket" as const,
    title: "Flexible Ticket",
    description: "Allows 1 date change until 24 hours before the flight.",
    icon: Calendar,
    iconColor: "text-green-500",
    iconBg: "bg-green-50",
    coverage: [
      "1 date change allowed",
      "Changes can be made until 24 hours before departure",
      "No change fees",
    ],
    pricePercentage: 0.15, // 15% of flight cost
    perPassenger: false,
  },
  {
    id: "airlineInsolvency" as const,
    title: "Airline Insolvency Protection",
    description: "Ensure you and your travel partners are protected if your airline declares bankruptcy and cancels your flight.",
    icon: Shield,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
    coverage: [
      "Your airfare for getting back home if your trip has already begun",
      "Your prepaid flight, if you haven't left yet",
    ],
    pricePercentage: 0.08, // 8% of flight cost
    perPassenger: false,
  },
  {
    id: "seatSelection" as const,
    title: "Seat Selection",
    description: "Choose your preferred seat for each passenger. Random seat selection is free.",
    icon: Users,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-50",
    pricePercentage: 0.05, // 5% of per passenger flight cost
    perPassenger: true,
  },
];

export default function Extras() {
  const [, setLocation] = useLocation();
  const { currencySymbol, currency } = useCurrency();
  const [flight, setFlight] = useState<EnhancedFlightWithPaymentPlan | null>(
    null,
  );
  const [passengerData, setPassengerData] = useState<any>(null);
  const [extras, setExtras] = useState<ExtrasSelections>({
    additionalBaggage: null,
    travelInsurance: null,
    flexibleTicket: null,
    seatSelection: {},
    airlineInsolvency: null,
  });
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load flight and passenger data from localStorage
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const flightData = localStorage.getItem("selectedFlight");
    const passengerInfo = localStorage.getItem("passengerData");

    if (flightData) {
      setFlight(JSON.parse(flightData));
    }

    if (passengerInfo) {
      const parsed = JSON.parse(passengerInfo);
      setPassengerData(parsed);
      
      // Initialize seat selections (empty, not defaulted to random)
      const passengerCount = parsed.passengerCount || parsed.passengers?.length || 1;
      const initialSeatSelection: SeatSelection = {};
      // Don't set default values - leave empty
      setExtras((prev) => ({
        ...prev,
        seatSelection: initialSeatSelection,
      }));
    }
  }, []);

  if (!flight || !passengerData) {
    return (
      <div className="min-h-screen bg-splickets-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-splickets-slate-900 mb-2">
            Loading...
          </h2>
          <p className="text-splickets-slate-600">
            Please wait while we load your flight details.
          </p>
        </div>
      </div>
    );
  }

  const passengerCount = passengerData.passengerCount || passengerData.passengers?.length || 1;
  const flightTotal = parseFloat(flight.price.total);
  const perPassengerCost = flightTotal / passengerCount;
  const passengers = passengerData.passengers || [];

  // Check if flight is international
  const isInternational = (() => {
    // Try to get IATA codes from segments first
    if (flight.itineraries && flight.itineraries.length > 0) {
      const firstSegment = flight.itineraries[0].segments[0];

      
      const originIata = firstSegment?.departure?.iataCode;
      const destIata = firstSegment?.arrival?.iataCode;
      
      // If both origin and destination are ZA airports, it's domestic
      if (originIata && destIata) {
        const isOriginZA = ZA_AIRPORTS.includes(originIata.toUpperCase());
        const isDestZA = ZA_AIRPORTS.includes(destIata.toUpperCase());
        // If both are ZA airports, it's domestic (return false)
        // Otherwise it's international (return true)
        return !(isOriginZA && isDestZA);
      }
    }
    
    // Fallback: if we can't determine from segments, assume international
    // This is safer as travel insurance is more important for international flights
    return true;
  })();
  
  console.log(isInternational);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getDisplayText = (selection: ProtectionSelection | null): string => {
    if (!selection) return "Select an option *";
    if (selection.type === "none") return "No thanks";
    if (selection.type === "all") return "All Passengers";
    if (selection.type === "specific") {
      if (selection.passengers.length === 0) return "Select an option *";
      if (selection.passengers.length === 1) {
        const passenger = passengers[selection.passengers[0]];
        return `${passenger.title} ${passenger.firstName} ${passenger.lastName}`;
      }
      return `${selection.passengers.length} passengers selected`;
    }
    return "Select an option *";
  };

  const handleSelectionChange = (
    optionId: keyof ExtrasSelections,
    selection: ProtectionSelection
  ) => {
    setExtras((prev) => {
      const newExtras = { ...prev };
      
      // If selecting "none" or "all", clear other options for this extra
      if (selection.type === "none" || selection.type === "all") {
        (newExtras[optionId] as ProtectionSelection) = selection;
      } else {
        // For specific passengers, update the selection
        (newExtras[optionId] as ProtectionSelection) = selection;
      }
      
      return newExtras;
    });
    
    // Clear validation error when selection is made
    if (validationErrors[optionId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[optionId];
        return newErrors;
      });
    }
  };

  const handlePassengerToggle = (
    optionId: keyof ExtrasSelections,
    passengerIndex: number
  ) => {
    const currentSelection = extras[optionId] as ProtectionSelection | null;
    
    if (!currentSelection || currentSelection.type !== "specific") {
      // Initialize with this passenger
      handleSelectionChange(optionId, {
        type: "specific",
        passengers: [passengerIndex],
      });
    } else {
      // Toggle passenger
      const passengerSet = new Set(currentSelection.passengers);
      if (passengerSet.has(passengerIndex)) {
        passengerSet.delete(passengerIndex);
      } else {
        passengerSet.add(passengerIndex);
      }
      
      if (passengerSet.size === 0) {
        handleSelectionChange(optionId, { type: "none" });
      } else {
        handleSelectionChange(optionId, {
          type: "specific",
          passengers: Array.from(passengerSet),
        });
      }
    }
    
    // Clear validation error when selection is made
    if (validationErrors[optionId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[optionId];
        return newErrors;
      });
    }
  };

  const handleSeatSelectionChange = (
    passengerIndex: number,
    seatType: "window" | "aisle" | "next_to_passenger" | "random"
  ) => {
    setExtras((prev) => ({
      ...prev,
      seatSelection: {
        ...prev.seatSelection,
        [passengerIndex]: seatType,
      },
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    let extrasTotal = 0;
    const breakdown: Record<string, { count: number; total: number }> = {};

    extrasOptions.forEach((option) => {
      // Skip travel insurance if domestic flight
      if (option.id === "travelInsurance" && !isInternational) {
        return;
      }

      const selection = extras[option.id as keyof ExtrasSelections] as ProtectionSelection | null;
      if (!selection || selection.type === "none") return;

      let count = 0;
      if (selection.type === "all") {
        count = passengerCount;
      } else if (selection.type === "specific") {
        count = selection.passengers.length;
      }

      if (count > 0) {
        const basePrice = option.perPassenger ? perPassengerCost : flightTotal;
        const optionTotal = basePrice * option.pricePercentage * count;
        extrasTotal += optionTotal;
        breakdown[option.id] = {
          count,
          total: optionTotal,
        };
      }
    });

    // Calculate seat selection costs (only for selected seats, not random or undefined)
    Object.entries(extras.seatSelection).forEach(([passengerIdx, seatType]) => {
      if (seatType && seatType !== "random" && seatType !== undefined) {
        const seatCost = perPassengerCost * 0.05;
        extrasTotal += seatCost;
        if (!breakdown.seatSelection) {
          breakdown.seatSelection = { count: 0, total: 0 };
        }
        breakdown.seatSelection.count += 1;
        breakdown.seatSelection.total += seatCost;
      }
    });

    return { extrasTotal, breakdown };
  };

  const totals = calculateTotals();
  const grandTotal = flightTotal + totals.extrasTotal;

  const handleContinue = () => {
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate that all required extras have a selection (except travel insurance for domestic and seatSelection which is always initialized)
    const requiredOptions = extrasOptions.filter(
      (opt) => 
        !(opt.id === "travelInsurance" && !isInternational) &&
        opt.id !== "seatSelection" // Seat selection is always initialized, skip validation
    );
    
    const errors: Record<string, string> = {};
    let hasErrors = false;
    
    requiredOptions.forEach((option) => {
      const selection = extras[option.id as keyof ExtrasSelections] as ProtectionSelection | null;
      if (selection === null) {
        errors[option.id] = "Please select an option";
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setValidationErrors(errors);
      // Scroll to first error
      const firstErrorId = Object.keys(errors)[0];
      const element = document.getElementById(`extras-${firstErrorId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Convert selections to per-passenger format for backward compatibility
    const passengerExtras: Record<number, any> = {};
    for (let i = 0; i < passengerCount; i++) {
      // Default to "random" if no selection was made (for backward compatibility)
      const seatSelection = extras.seatSelection[i] || "random";
      passengerExtras[i] = {
        additionalBaggage: false,
        travelInsurance: false,
        flexibleTicket: false,
        seatSelection: seatSelection,
        airlineInsolvency: false,
      };
    }

    extrasOptions.forEach((option) => {
      if (option.id === "travelInsurance" && !isInternational) return;
      if (option.id === "seatSelection") return; // Handled separately

      const selection = extras[option.id as keyof ExtrasSelections] as ProtectionSelection | null;
      if (!selection || selection.type === "none") return;

      if (selection.type === "all") {
        // Apply to all passengers
        for (let i = 0; i < passengerCount; i++) {
          passengerExtras[i][option.id] = true;
        }
      } else if (selection.type === "specific") {
        // Apply to selected passengers
        selection.passengers.forEach((idx) => {
          passengerExtras[idx][option.id] = true;
        });
      }
    });

    // Save extras data to localStorage
    const updatedPassengerData = {
      ...passengerData,
      extras: passengerExtras,
      extrasSelections: extras,
      extrasTotal: totals.extrasTotal,
      grandTotal,
    };
    localStorage.setItem("passengerData", JSON.stringify(updatedPassengerData));
    
    // Navigate to payment page
    setLocation("/flight-search/book");
  };

  return (
    <div className="min-h-screen bg-splickets-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BookingWizard currentStep="extras" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Section - Extras Options */}
          <div className="lg:col-span-2 space-y-6">
            {extrasOptions
              .filter((option) => {
                // Hide travel insurance for domestic flights
                if (option.id === "travelInsurance" && !isInternational) {
                  return false;
                }
                return true;
              })
              .map((option) => {
                const Icon = option.icon;
                const basePrice = option.perPassenger ? perPassengerCost : flightTotal;
                const price = basePrice * option.pricePercentage;
                const selection = extras[option.id as keyof ExtrasSelections] as ProtectionSelection | null;
                const isOpen = openPopovers[option.id] || false;

                // Special handling for seat selection
                if (option.id === "seatSelection") {
                  return (
                    <Card key={option.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          {/* Icon Section */}
                          <div className="flex-shrink-0">
                            <div className={`w-16 h-16 rounded-lg ${option.iconBg} flex items-center justify-center`}>
                              <Users className={`w-8 h-8 ${option.iconColor}`} />
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-splickets-slate-900 mb-2">
                              Seat Selection
                            </h3>
                            <p className="text-splickets-slate-600 mb-4">
                              Choose your preferred seat for each passenger. Random seat selection is free.
                            </p>

                            {/* Per-passenger seat selection */}
                            <div className="space-y-4">
                              {passengers.length > 0 ? (
                                passengers.map((passenger: any, idx: number) => {
                                  const currentSeat = extras.seatSelection[idx];
                                  const seatOptions = passengerCount > 1
                                    ? ["window", "aisle", "next_to_passenger", "random"]
                                    : ["window", "aisle", "random"];

                                  return (
                                    <div key={idx} className="border border-splickets-slate-200 rounded-lg p-4">
                                      <Label className="text-sm font-medium text-splickets-slate-700 mb-3 block">
                                        {passenger.title} {passenger.firstName} {passenger.lastName}
                                      </Label>
                                      <Select
                                        value={currentSeat || ""}
                                        onValueChange={(value) =>
                                          handleSeatSelectionChange(
                                            idx,
                                            value as "window" | "aisle" | "next_to_passenger" | "random"
                                          )
                                        }
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select seat preference" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {seatOptions.map((seat) => {
                                            const seatLabel =
                                              seat === "window"
                                                ? `Window (${formatCurrency(perPassengerCost * 0.05)})`
                                                : seat === "aisle"
                                                ? `Aisle (${formatCurrency(perPassengerCost * 0.05)})`
                                                : seat === "next_to_passenger"
                                                ? `Next to Other Passenger (${formatCurrency(perPassengerCost * 0.05)})`
                                                : "Random (Free)";
                                            return (
                                              <SelectItem key={seat} value={seat}>
                                                {seatLabel}
                                              </SelectItem>
                                            );
                                          })}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-sm text-splickets-slate-600">
                                  Loading passenger information...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card key={option.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Icon Section */}
                        <div className="flex-shrink-0">
                          <div className={`w-16 h-16 rounded-lg ${option.iconBg} flex items-center justify-center`}>
                            <Icon className={`w-8 h-8 ${option.iconColor}`} />
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-splickets-slate-900 mb-2">
                            {option.title}
                          </h3>
                          <p className="text-splickets-slate-600 mb-4">
                            {option.description}
                          </p>

                          {/* Coverage Details */}
                          {option.coverage && (
                            <div className="space-y-2 mb-4">
                              {option.coverage.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                  <span className="text-sm text-splickets-slate-700">
                                    {item}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Pricing and Selection */}
                          <div className="border-t border-splickets-slate-200 pt-4 mt-4">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-semibold text-splickets-slate-900">
                                {formatCurrency(price)} per passenger
                                {/* {option.perPassenger && " per passenger"} */}
                              </span>
                            </div>

                            <div>

                              <Popover
                                open={isOpen}
                                onOpenChange={(open) =>
                                  setOpenPopovers((prev) => ({
                                    ...prev,
                                    [option.id]: open,
                                  }))
                                }
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !selection && "text-muted-foreground"
                                    )}
                                  >
                                    {getDisplayText(selection)}
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="min-w-[200px] p-0" align="start" sideOffset={4}>
                                  <div className="p-2">
                                    {/* Single select options */}
                                    <div
                                      className="flex items-center space-x-2 p-2 rounded-sm hover:bg-accent cursor-pointer"
                                      onClick={() => {
                                        handleSelectionChange(option.id, {
                                          type: "none",
                                        });
                                        setOpenPopovers((prev) => ({
                                          ...prev,
                                          [option.id]: false,
                                        }));
                                      }}
                                    >
                                      <div
                                        className={cn(
                                          "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                          selection?.type === "none"
                                            ? "border-primary bg-primary"
                                            : "border-splickets-slate-300"
                                        )}
                                      >
                                        {selection?.type === "none" && (
                                          <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                      </div>
                                      <span className="text-sm">No thanks</span>
                                    </div>

                                    <div
                                      className="flex items-center space-x-2 p-2 rounded-sm hover:bg-accent cursor-pointer"
                                      onClick={() => {
                                        handleSelectionChange(option.id, {
                                          type: "all",
                                        });
                                        setOpenPopovers((prev) => ({
                                          ...prev,
                                          [option.id]: false,
                                        }));
                                      }}
                                    >
                                      <div
                                        className={cn(
                                          "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                          selection?.type === "all"
                                            ? "border-primary bg-primary"
                                            : "border-splickets-slate-300"
                                        )}
                                      >
                                        {selection?.type === "all" && (
                                          <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                      </div>
                                      <span className="text-sm">All Passengers</span>
                                    </div>

                                    {/* Multiselect for individual passengers */}
                                    {passengerCount > 1 && (
                                      <div className="border-t border-splickets-slate-200 mt-2 pt-2">
                                        <div className="px-2 py-1 text-xs font-medium text-splickets-slate-500 mb-1">
                                          Select specific passengers:
                                        </div>
                                        {passengers.map((passenger: any, idx: number) => {
                                          const isSelected =
                                            selection?.type === "specific" &&
                                            selection.passengers.includes(idx);
                                          return (
                                            <div
                                              key={idx}
                                              className="flex items-center space-x-2 p-2 rounded-sm hover:bg-accent cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handlePassengerToggle(option.id, idx);
                                              }}
                                            >
                                              <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => {
                                                  handlePassengerToggle(option.id, idx);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                              />
                                              <span className="text-sm">
                                                {passenger.title} {passenger.firstName}{" "}
                                                {passenger.lastName}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                              {validationErrors[option.id] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {validationErrors[option.id]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {/* Right Section - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-[98px] space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-splickets-slate-900 mb-4">
                    Summary
                  </h3>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-splickets-slate-700">Flight Total</span>
                    <span className="font-semibold text-splickets-slate-900">
                      {formatCurrency(flightTotal)}
                    </span>
                  </div>

                  {totals.extrasTotal > 0 && (
                    <>
                      {Object.entries(totals.breakdown).map(([key, value]) => {
                        const option = extrasOptions.find((o) => o.id === key);
                        if (!option || value.count === 0) {
                          if (key === "seatSelection") {
                            return (
                              <div
                                key={key}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="text-splickets-slate-600">
                                  Seat Selection ({value.count})
                                </span>
                                <span className="text-splickets-slate-900">
                                  {formatCurrency(value.total)}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        }
                        return (
                          <div
                            key={key}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-splickets-slate-600">
                              {option.title} ({value.count})
                            </span>
                            <span className="text-splickets-slate-900">
                              {formatCurrency(value.total)}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}

                  <div className="border-t border-splickets-slate-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-splickets-slate-900">
                        Total
                      </span>
                      <span className="text-lg font-bold text-splickets-slate-900">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleContinue}
                disabled={isLoading}
                size="lg"
                className="w-full px-8 py-3 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue to Payment"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
