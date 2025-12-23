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
import { Loader2, Shield, Plane, CheckCircle, Activity, ChevronDown, Luggage, Calendar, Users, Check, AlertTriangle, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnhancedFlightWithPaymentPlan } from "@shared/schema";
import { BookingWizard } from "@/components/booking-wizard";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formattedPrice, formatTime, formatDuration, formatDate, toTitleCase, stopoverDuration } from "@/utils/formatters";
import { motion, AnimatePresence } from "framer-motion";

type ProtectionSelection = 
  | { type: "none"; price?: number }
  | { type: "all"; price?: number; count?: number } // Price and count added when saving
  | { type: "specific"; passengers: number[]; price?: number; count?: number }; // Price and count added when saving

interface SeatSelection {
  [passengerIndex: number]: "window" | "aisle" | "next_to_passenger" | "random" | undefined;
}

interface SeatSelectionWithPricing {
  [passengerIndex: number]: {
    type: "window" | "aisle" | "next_to_passenger" | "random" | undefined;
    price?: number; // Price is only set for non-random selections
  };
}

interface ExtrasSelections {
  additionalBaggage: ProtectionSelection | null;
  travelInsurance: ProtectionSelection | null;
  flexibleTicket: ProtectionSelection | null;
  seatSelection: SeatSelection | SeatSelectionWithPricing; // Support both formats for backward compatibility
  airlineInsolvency: ProtectionSelection | null;
  pricing?: {
    // Store pricing breakdown for reference
    [key: string]: { count: number; total: number; perItem?: number };
  };
}

// Helper function to get seat type from either format
const getSeatType = (seatValue: string | { type: string; price?: number } | undefined | unknown): string | undefined => {
  if (!seatValue) return undefined;
  if (typeof seatValue === "string") return seatValue;
  if (typeof seatValue === "object" && seatValue !== null && "type" in seatValue) {
    const seatObj = seatValue as { type: string; price?: number };
    return seatObj.type || undefined;
  }
  return undefined;
};

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

export const extrasOptions = [
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
  const [expandedDetails, setExpandedDetails] = useState<{
    [key: number]: boolean;
  }>({});

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
      
      // Restore extras selections from localStorage if they exist
      if (parsed.extrasSelections) {
        // Normalize seatSelection format if needed (convert from pricing format back to simple format for editing)
        const normalizedExtras: ExtrasSelections = { ...parsed.extrasSelections };
        if (normalizedExtras.seatSelection) {
          const normalizedSeatSelection: SeatSelection = {};
          Object.entries(normalizedExtras.seatSelection).forEach(([idx, seatValue]) => {
            const seatType = getSeatType(seatValue);
            if (seatType) {
              normalizedSeatSelection[parseInt(idx)] = seatType as "window" | "aisle" | "next_to_passenger" | "random";
            }
          });
          normalizedExtras.seatSelection = normalizedSeatSelection;
        }
        setExtras(normalizedExtras);
      } else {
        // Initialize seat selections (empty, not defaulted to random) if no previous selections
        const passengerCount = parsed.passengerCount || parsed.passengers?.length || 1;
        const initialSeatSelection: SeatSelection = {};
        setExtras((prev) => ({
          ...prev,
          seatSelection: initialSeatSelection,
        }));
      }
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

  const toggleDetails = (itineraryIndex: number) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [itineraryIndex]: !prev[itineraryIndex],
    }));
  };

  const getDisplayText = (selection: ProtectionSelection | null): string => {
    if (!selection) return "Select an option *";
    if (selection.type === "none") return "No thanks";
    if (selection.type === "all") {
      return passengerCount === 1 ? "Add to cart" : "All Passengers";
    }
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
    setExtras((prev) => {
      // Normalize seatSelection to simple format for editing
      const currentSeatSelection: SeatSelection = {};
      Object.entries(prev.seatSelection).forEach(([idx, seatValue]) => {
        const normalizedType = getSeatType(seatValue);
        if (normalizedType) {
          currentSeatSelection[parseInt(idx)] = normalizedType as "window" | "aisle" | "next_to_passenger" | "random";
        }
      });
      
      return {
        ...prev,
        seatSelection: {
          ...currentSeatSelection,
          [passengerIndex]: seatType,
        },
      };
    });
    
    // Clear validation error when seat selection is made
    if (validationErrors.seatSelection) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.seatSelection;
        return newErrors;
      });
    }
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
    Object.entries(extras.seatSelection).forEach(([passengerIdx, seatValue]) => {
      const seatType = getSeatType(seatValue);
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
    
    // Validate that all required extras have a selection (except travel insurance for domestic)
    const requiredOptions = extrasOptions.filter(
      (opt) => 
        !(opt.id === "travelInsurance" && !isInternational) &&
        opt.id !== "seatSelection" // Seat selection is validated separately
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

    // Validate seat selection - ensure all passengers have a seat selection
    const missingSeatSelections: number[] = [];
    for (let i = 0; i < passengerCount; i++) {
      const seatValue = extras.seatSelection[i];
      const seatType = getSeatType(seatValue);
      if (!seatType || seatType === undefined) {
        missingSeatSelections.push(i);
      }
    }
    
    if (missingSeatSelections.length > 0) {
      errors.seatSelection = `Please select a seat preference for all ${passengerCount === 1 ? 'passenger' : 'passengers'}`;
      hasErrors = true;
    }

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
      const seatValue = extras.seatSelection[i];
      const seatSelection = getSeatType(seatValue) || "random";
      passengerExtras[i] = {
        additionalBaggage: false,
        travelInsurance: false,
        flexibleTicket: false,
        seatSelection: seatSelection,
        airlineInsolvency: false,
      };
    }

    // Calculate pricing for each extra and enrich selections with pricing data
    const enrichedExtrasSelections: ExtrasSelections = { ...extras };
    
    extrasOptions.forEach((option) => {
      if (option.id === "travelInsurance" && !isInternational) return;
      if (option.id === "seatSelection") return; // Handled separately

      const selection = extras[option.id as keyof ExtrasSelections] as ProtectionSelection | null;
      if (!selection || selection.type === "none") {
        // Keep the selection as-is (with type: "none")
        return;
      }

      const basePrice = option.perPassenger ? perPassengerCost : flightTotal;
      const perItemPrice = basePrice * option.pricePercentage; // Price per passenger/item

      if (selection.type === "all") {
        const count = passengerCount;
        // Apply to all passengers
        for (let i = 0; i < passengerCount; i++) {
          passengerExtras[i][option.id] = true;
        }
        // Enrich selection with pricing (price is per item, count tells how many)
        (enrichedExtrasSelections[option.id as keyof ExtrasSelections] as ProtectionSelection) = {
          type: "all",
          price: perItemPrice, // Price per passenger/item
          count: count,
        };
      } else if (selection.type === "specific") {
        const count = selection.passengers.length;
        // Apply to selected passengers
        selection.passengers.forEach((idx) => {
          passengerExtras[idx][option.id] = true;
        });
        // Enrich selection with pricing (price is per item, count tells how many)
        (enrichedExtrasSelections[option.id as keyof ExtrasSelections] as ProtectionSelection) = {
          type: "specific",
          passengers: selection.passengers,
          price: perItemPrice, // Price per passenger/item
          count: count,
        };
      }
    });

    // Handle seat selection pricing
    const seatSelectionWithPricing: SeatSelectionWithPricing = {};
    Object.entries(extras.seatSelection).forEach(([passengerIdx, seatValue]) => {
      const idx = parseInt(passengerIdx);
      const seatType = getSeatType(seatValue);
      if (seatType && seatType !== "random" && seatType !== undefined) {
        const seatPrice = perPassengerCost * 0.05;
        seatSelectionWithPricing[idx] = {
          type: seatType as "window" | "aisle" | "next_to_passenger" | "random",
          price: seatPrice,
        };
      } else {
        seatSelectionWithPricing[idx] = {
          type: seatType as "window" | "aisle" | "next_to_passenger" | "random" | undefined,
          // No price for random seats
        };
      }
    });
    enrichedExtrasSelections.seatSelection = seatSelectionWithPricing;

    // Add pricing breakdown to extrasSelections
    enrichedExtrasSelections.pricing = totals.breakdown;

    // Save extras data to localStorage
    const updatedPassengerData = {
      ...passengerData,
      extras: passengerExtras,
      extrasSelections: enrichedExtrasSelections,
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
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
          {/* Left Section - Extras Options */}
          <div className="lg:col-span-3 space-y-6">
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
                    <Card key={option.id} id="extras-seatSelection" className="overflow-hidden">
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
                                  const seatValue = extras.seatSelection[idx];
                                  const currentSeat = getSeatType(seatValue);
                                  const seatOptions = passengerCount > 1
                                    ? ["window", "aisle", "next_to_passenger", "random"]
                                    : ["window", "aisle", "random"];
                                  const hasError = validationErrors.seatSelection && !currentSeat;

                                  return (
                                    <div key={idx} className={hasError ? "border border-red-500 rounded-lg p-4" : "border border-splickets-slate-200 rounded-lg p-4"}>
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
                                        <SelectTrigger className={hasError ? "w-full border-red-500" : "w-full"}>
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
                            {validationErrors.seatSelection && (
                              <p className="text-red-500 text-sm mt-2">
                                {validationErrors.seatSelection}
                              </p>
                            )}
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
                                      <span className="text-sm">
                                        {passengerCount === 1 ? "Add to cart" : "All Passengers"}
                                      </span>
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
          <div className="lg:col-span-2">
            <div className="sticky top-[98px] space-y-6">
              {/* Flight Summary Header */}
              <div className="bg-white rounded-lg shadow-sm border border-splickets-slate-200 p-6 mb-8">
                <h1
                  className="text-2xl font-bold text-splickets-slate-900 mb-4"
                  data-testid="title-flight-summary"
                >
                  Flight Summary
                </h1>
                {/* Render each itinerary */}
                {flight.itineraries.map((itinerary, itineraryIndex) => {
                  const isOutbound = itineraryIndex === 0;
                  const firstSegment = itinerary.segments[0];
                  const lastSegment =
                    itinerary.segments[itinerary.segments.length - 1];
                  const stops = itinerary.segments.length - 1;

                  return (
                    <div
                      key={itineraryIndex}
                      className="bg-splickets-slate-50 rounded-lg p-6 border border-splickets-slate-200 mb-4"
                      data-testid={`itinerary-section-${itineraryIndex}`}
                    >
                      {/* Route Overview */}
                      <div className="flex items-center justify-between mb-6">
                        {/* Origin */}
                        <div className="text-left">
                          <div className="text-xl font-bold text-splickets-slate-900">
                            {firstSegment.departure.iataCode}
                          </div>
                          <div className="text-sm text-splickets-slate-600">
                            {toTitleCase(firstSegment.departure.cityName)}
                            
                          </div>
                          <div className="text-sm font-medium text-splickets-slate-900 mt-1">
                            {formatTime(firstSegment.departure.at)}
                          </div>
                        </div>

                        {/* Flight info */}
                        <div className="flex-1 mx-8 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-2 h-2 bg-splickets-slate-300 rounded-full"></div>
                            <div className="flex-1 h-px bg-splickets-slate-300 mx-2"></div>
                            <Plane className="w-4 h-4 text-green-600" />
                            <div className="flex-1 h-px bg-splickets-slate-300 mx-2"></div>
                            <div className="w-2 h-2 bg-splickets-slate-300 rounded-full"></div>
                          </div>
                          <div className="text-sm text-splickets-slate-600 mb-1">
                            {stops === 0
                              ? "Nonstop"
                              : `${stops} stop${stops > 1 ? "s" : ""}`}
                          </div>
                          <div className="text-sm text-splickets-slate-500">
                            {formatDuration(itinerary.duration)}
                          </div>
                        </div>

                        {/* Destination */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-splickets-slate-900">
                            {lastSegment.arrival.iataCode}
                          </div>
                          <div className="text-sm text-splickets-slate-600">
                            {toTitleCase(lastSegment.arrival.cityName)}
                            {/* {lastSegment.arrival.cityName} */}
                          </div>
                          <div className="text-sm font-medium text-splickets-slate-900 mt-1">
                            {formatTime(lastSegment.arrival.at)}
                          </div>
                        </div>
                      </div>

                      {/* Flight Details Collapsible */}
                      <div className="border-t border-splickets-slate-200 pt-4">
                        <button
                          onClick={() => toggleDetails(itineraryIndex)}
                          className="flex items-center justify-between w-full p-3 hover:bg-splickets-slate-100 rounded-lg"
                          data-testid={`button-toggle-details-${itineraryIndex}`}
                        >
                          <span className="text-sm font-medium text-splickets-slate-700">
                            Details
                          </span>
                          <motion.div
                            animate={{
                              rotate: expandedDetails[itineraryIndex] ? -180 : 0,
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            {expandedDetails[itineraryIndex] ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                          {expandedDetails[itineraryIndex] && (
                            <motion.div
                              key={`details-${itineraryIndex}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.5, ease: "easeInOut" }}
                              className="overflow-hidden"
                              data-testid={`details-content-${itineraryIndex}`}
                            >
                              {itinerary.segments.map((segment, segmentIndex) => (
                                <div key={segment.id} className="flex flex-col gap-4 mt-4">
                                  {/* Segment details */}
                                  <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-splickets-slate-200">
                                    <div className="flex-1">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Departure */}
                                        <div>
                                          <div className="flex items-center gap-2 mb-2">
                                            <div className=" font-medium text-splickets-slate-900">
                                              {formatTime(segment.departure.at)} -{" "}
                                                {formatDate(segment.departure.at)}
                                            </div>
                                          </div>
                                          <div className="text-sm text-splickets-slate-900">
                                            <p>
                                              {" "}
                                              {toTitleCase(segment.departure.airportName)} (
                                              {segment.departure.iataCode})
                                            </p>
                                            {segment.departure.terminal && (
                                              <p>
                                                Terminal{" "}
                                                {segment.departure.terminal}{" "}
                                              </p>
                                            )}
                                            <p>
                                              {" "}
                                              {toTitleCase(segment.airline)} -{" "}
                                              {segment.number}
                                            </p>
                                            <p>
                                              {formatDuration(segment.duration)}
                                            </p>
                                            <p>{toTitleCase(segment.cabin)}</p>
                                          </div>
                                        </div>

                                        {/* Arrival */}
                                        <div>
                                          <div className="flex items-center gap-2 mb-2">
                                            <div className=" font-medium text-splickets-slate-900">
                                              {formatTime(segment.arrival.at)} -{" "}
                                                {formatDate(segment.arrival.at)}
                                            </div>
                                          </div>
                                          <div className="text-sm text-splickets-slate-900">
                                            <p>
                                              {" "}
                                              {toTitleCase(segment.arrival.airportName)} (
                                              {segment.arrival.iataCode})
                                            </p>
                                            {segment.arrival.terminal && (
                                              <p>
                                                Terminal{" "}
                                                {segment.arrival.terminal}{" "}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                  </div>
                                  <div
                                    className="p-4 bg-white rounded-lg border border-splickets-slate-200"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Baggage */}
                                      <div>
                                        <h5 className="text-sm font-medium text-splickets-slate-900 mb-2">
                                          Baggage
                                        </h5>
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm text-splickets-slate-600">
                                              {segment.includedCabinBags
                                                ?.quantity &&
                                              segment.includedCabinBags?.weight &&
                                              segment.includedCabinBags
                                                ?.weightUnit ? (
                                                  <div className="flex flex-row gap-2">
                                                    <Check className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm text-splickets-slate-600">
                                                      {
                                                        segment.includedCabinBags
                                                          ?.weight
                                                      }{" "}
                                                      {segment.includedCabinBags?.weightUnit.toLowerCase()}{" "}
                                                      x{" "}
                                                      {
                                                        segment.includedCabinBags
                                                          ?.quantity
                                                      }{" "}
                                                      piece(s) carry-on
                                                    </span>
                                                  </div>
                                                ) : segment.includedCabinBags
                                                    ?.weightUnit &&
                                                  segment.includedCabinBags
                                                    ?.weight ? (
                                                  <div className="flex flex-row gap-2">
                                                    <Check className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm text-splickets-slate-600">
                                                      {
                                                        segment.includedCabinBags
                                                          ?.weight
                                                      }{" "}
                                                      {segment.includedCabinBags?.weightUnit.toLowerCase()}{" "}
                                                      carry-on
                                                    </span>
                                                  </div>
                                                ) : segment.includedCabinBags
                                                    ?.quantity ? (
                                                  <div className="flex flex-row gap-2">
                                                    <Check className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm text-splickets-slate-600">
                                                      {
                                                        segment.includedCabinBags
                                                          ?.quantity
                                                      }{" "}
                                                      piece(s) carry-on
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <></>
                                                )}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {segment.includedCheckedBags
                                              ?.quantity &&
                                            segment.includedCheckedBags?.weight &&
                                            segment.includedCheckedBags
                                              ?.weightUnit ? (
                                              <div className="flex flex-row gap-2">
                                                <Check className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-splickets-slate-600">
                                                  {
                                                    segment.includedCheckedBags
                                                      ?.weight
                                                  }{" "}
                                                  {segment.includedCheckedBags?.weightUnit.toLowerCase()}{" "}
                                                  x{" "}
                                                  {
                                                    segment.includedCheckedBags
                                                      ?.quantity
                                                  }{" "}
                                                  piece(s) checked
                                                </span>
                                              </div>
                                            ) : segment.includedCheckedBags
                                                ?.weightUnit &&
                                              segment.includedCheckedBags
                                                ?.weight ? (
                                              <div className="flex flex-row gap-2">
                                                <Check className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-splickets-slate-600">
                                                  {
                                                    segment.includedCheckedBags
                                                      ?.weight
                                                  }{" "}
                                                  {segment.includedCheckedBags?.weightUnit.toLowerCase()}{" "}
                                                  checked
                                                </span>
                                              </div>
                                            ) : segment.includedCheckedBags
                                                ?.quantity ? (
                                              <div className="flex flex-row gap-2">
                                                <Check className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-splickets-slate-600">
                                                  {
                                                    segment.includedCheckedBags
                                                      ?.quantity
                                                  }{" "}
                                                  piece(s) checked
                                                </span>
                                              </div>
                                            ) : (
                                              <></>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Flexibility */}
                                      <div>
                                        <h5 className="text-sm font-medium text-splickets-slate-900 mb-2">
                                          Flexibility
                                        </h5>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            {flight.pricingOptions
                                              ?.refundableFare ? (
                                              <>
                                                <Check className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-green-600">
                                                  Refundable
                                                </span>
                                              </>
                                            ) : (
                                              <>
                                                <X className="w-4 h-4 text-red-600" />
                                                <span className="text-sm text-red-600">
                                                  Non-refundable
                                                </span>
                                              </>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {flight.pricingOptions
                                              ?.noPenaltyFare ? (
                                              <>
                                                <Check className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-green-600">
                                                  Free changes
                                                </span>
                                              </>
                                            ) : (
                                              <>
                                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                                <span className="text-sm text-yellow-600">
                                                  Changes with a fee
                                                </span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Stopover indicator */}
                                  {segmentIndex < itinerary.segments.length - 1 && (
                                    <div className="flex items-center justify-center   ">
                                      <div className=" flex items-center gap-2 px-3 py-1 bg-splickets-slate-100 rounded-full">
                                        <Clock className="w-3 h-3 text-splickets-slate-500" />
                                        <span className="text-xs text-splickets-slate-600">
                                          {toTitleCase(itinerary.segments[segmentIndex + 1]
                                                       .departure.airportName)} (
                                          {
                                            itinerary.segments[segmentIndex + 1]
                                              .departure.iataCode
                                          }
                                          ) -{" "}
                                          {stopoverDuration(
                                            new Date(segment.arrival.at),
                                            new Date(
                                              itinerary.segments[
                                                segmentIndex + 1
                                              ].departure.at,
                                            ),
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                     
                      
                    </div>
                  );
                })}
              </div>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-splickets-slate-900 mb-4">
                    Price Details
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
