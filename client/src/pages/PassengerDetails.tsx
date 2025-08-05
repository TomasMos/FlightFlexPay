import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { EnhancedFlightWithPaymentPlan } from "@shared/schema";

// Passenger form schema
const passengerSchema = z.object({
  title: z.enum(["Mr", "Mrs", "Ms", "Miss", "Master"]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  passportCountry: z.string().min(1, "Passport country is required"),
});

// Contact details schema
const contactSchema = z.object({
  email: z.string().email("Valid email is required"),
  confirmEmail: z.string().email("Valid email is required"),
  diallingCode: z.string().min(1, "Dialling code is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Emails must match",
  path: ["confirmEmail"],
});

type PassengerForm = z.infer<typeof passengerSchema>;
type ContactForm = z.infer<typeof contactSchema>;

export default function PassengerDetails() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/flight-search/passenger-details/:flightId");
  const [flight, setFlight] = useState<EnhancedFlightWithPaymentPlan | null>(null);
  const [passengerCount] = useState(1); // For now, defaulting to 1 passenger
  const [priceDetailsOpen, setPriceDetailsOpen] = useState(false);
  const [userCountry, setUserCountry] = useState("ZA"); // Default to South Africa

  // Forms
  const passengerForm = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: "Mr",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportCountry: "",
    },
  });

  const contactForm = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: "",
      confirmEmail: "",
      diallingCode: "+27", // Default to South Africa
      phoneNumber: "",
    },
  });

  // Get user's country from IP (simplified version)
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data.country_code) {
          setUserCountry(data.country_code);
          // Set dialling code based on country
          const diallingCodes: Record<string, string> = {
            "US": "+1",
            "GB": "+44",
            "ZA": "+27",
            "AU": "+61",
            "CA": "+1",
            "DE": "+49",
            "FR": "+33",
            "IT": "+39",
            "ES": "+34",
            "NL": "+31",
            "BE": "+32",
            "CH": "+41",
            "AT": "+43",
            "SE": "+46",
            "NO": "+47",
            "DK": "+45",
            "FI": "+358",
            "IE": "+353",
            "PT": "+351",
            "GR": "+30",
            "PL": "+48",
            "CZ": "+420",
            "HU": "+36",
            "SK": "+421",
            "SI": "+386",
            "HR": "+385",
            "BG": "+359",
            "RO": "+40",
            "LT": "+370",
            "LV": "+371",
            "EE": "+372",
            "IS": "+354",
            "MT": "+356",
            "CY": "+357",
            "LU": "+352",
          };
          const diallingCode = diallingCodes[data.country_code] || "+27";
          contactForm.setValue("diallingCode", diallingCode);
        }
      })
      .catch(() => {
        // If IP detection fails, keep default values
      });
  }, [contactForm]);

  // Load flight data from localStorage or API
  useEffect(() => {
    if (params?.flightId) {
      // For now, we'll get flight data from localStorage
      // In a real app, you might fetch from API using the flight ID
      const flightData = localStorage.getItem("selectedFlight");
      if (flightData) {
        setFlight(JSON.parse(flightData));
      }
    }
  }, [params?.flightId]);

  const handleContinue = () => {
    const passengerData = passengerForm.getValues();
    const contactData = contactForm.getValues();
    
    if (passengerForm.formState.isValid && contactForm.formState.isValid) {
      // Store form data and navigate to review page
      localStorage.setItem("passengerData", JSON.stringify({
        passengers: [passengerData],
        contact: contactData,
      }));
      setLocation("/flight-booking/review");
    }
  };

  const handleConfirmEmailPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  if (!flight) {
    return (
      <div className="min-h-screen bg-flightpay-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-flightpay-slate-900 mb-2">Loading flight details...</h2>
          <p className="text-flightpay-slate-600">Please wait while we load your flight information.</p>
        </div>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const getFlightSummary = () => {
    const outbound = flight.itineraries[0];
    const firstSegment = outbound.segments[0];
    const lastSegment = outbound.segments[outbound.segments.length - 1];
    
    return {
      origin: firstSegment.departure.iataCode,
      destination: lastSegment.arrival.iataCode,
      departureTime: formatTime(firstSegment.departure.at),
      arrivalTime: formatTime(lastSegment.arrival.at),
      departureDate: formatDate(firstSegment.departure.at),
      arrivalDate: formatDate(lastSegment.arrival.at),
    };
  };

  const flightSummary = getFlightSummary();
  const flightFare = parseFloat(flight.price.base);
  const flightTaxes = parseFloat(flight.price.total) - parseFloat(flight.price.base);
  const totalPrice = parseFloat(flight.price.total);

  return (
    <div className="min-h-screen bg-flightpay-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Flight Summary Header */}
        <div className="bg-white rounded-lg shadow-sm border border-flightpay-slate-200 p-6 mb-8">
          <h1 className="text-2xl font-bold text-flightpay-slate-900 mb-4" data-testid="title-passenger-details">
            Passenger Details
          </h1>
          <div className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-flightpay-slate-900" data-testid="text-origin">
                {flightSummary.origin}
              </span>
              <span className="text-flightpay-slate-600" data-testid="text-departure-time">
                {flightSummary.departureTime}
              </span>
              <span className="text-flightpay-slate-400">→</span>
              <span className="font-semibold text-flightpay-slate-900" data-testid="text-destination">
                {flightSummary.destination}
              </span>
              <span className="text-flightpay-slate-600" data-testid="text-arrival-time">
                {flightSummary.arrivalTime}
              </span>
            </div>
            <div className="text-sm text-flightpay-slate-600">
              <span data-testid="text-departure-date">{flightSummary.departureDate}</span>
              {flightSummary.departureDate !== flightSummary.arrivalDate && (
                <>
                  <span className="mx-2">-</span>
                  <span data-testid="text-arrival-date">{flightSummary.arrivalDate}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Passenger and Contact Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Passenger 1 Form */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="title-passenger-1">Passenger 1</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Select 
                      value={passengerForm.watch("title")} 
                      onValueChange={(value) => passengerForm.setValue("title", value as any)}
                    >
                      <SelectTrigger data-testid="select-title">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                        <SelectItem value="Miss">Miss</SelectItem>
                        <SelectItem value="Master">Master</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      {...passengerForm.register("firstName")}
                      data-testid="input-first-name"
                    />
                    {passengerForm.formState.errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {passengerForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      {...passengerForm.register("lastName")}
                      data-testid="input-last-name"
                    />
                    {passengerForm.formState.errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {passengerForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input 
                      {...passengerForm.register("dateOfBirth")}
                      type="date"
                      data-testid="input-date-of-birth"
                    />
                    {passengerForm.formState.errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">
                        {passengerForm.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="passportCountry">Passport Country</Label>
                  <Input 
                    {...passengerForm.register("passportCountry")}
                    placeholder="e.g., South Africa"
                    data-testid="input-passport-country"
                  />
                  {passengerForm.formState.errors.passportCountry && (
                    <p className="text-red-500 text-sm mt-1">
                      {passengerForm.formState.errors.passportCountry.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Details Form */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="title-contact-details">Contact Details</CardTitle>
                <p className="text-sm text-flightpay-slate-600">Confirmation and account details</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      {...contactForm.register("email")}
                      type="email"
                      data-testid="input-email"
                    />
                    {contactForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {contactForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="confirmEmail">Confirm Email</Label>
                    <Input 
                      {...contactForm.register("confirmEmail")}
                      type="email"
                      onPaste={handleConfirmEmailPaste}
                      data-testid="input-confirm-email"
                    />
                    {contactForm.formState.errors.confirmEmail && (
                      <p className="text-red-500 text-sm mt-1">
                        {contactForm.formState.errors.confirmEmail.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="diallingCode">Dialling Code</Label>
                    <Select 
                      value={contactForm.watch("diallingCode")} 
                      onValueChange={(value) => contactForm.setValue("diallingCode", value)}
                    >
                      <SelectTrigger data-testid="select-dialling-code">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+1">+1 (US/CA)</SelectItem>
                        <SelectItem value="+44">+44 (UK)</SelectItem>
                        <SelectItem value="+27">+27 (ZA)</SelectItem>
                        <SelectItem value="+61">+61 (AU)</SelectItem>
                        <SelectItem value="+49">+49 (DE)</SelectItem>
                        <SelectItem value="+33">+33 (FR)</SelectItem>
                        <SelectItem value="+39">+39 (IT)</SelectItem>
                        <SelectItem value="+34">+34 (ES)</SelectItem>
                        <SelectItem value="+31">+31 (NL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input 
                      {...contactForm.register("phoneNumber")}
                      type="tel"
                      data-testid="input-phone-number"
                    />
                    {contactForm.formState.errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {contactForm.formState.errors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Price Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="title-price-details">Price details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Collapsible open={priceDetailsOpen} onOpenChange={setPriceDetailsOpen}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-0 hover:bg-transparent">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-flightpay-slate-900" data-testid="text-adult-count">
                            Adult ({passengerCount})
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold" data-testid="text-total-price">
                              {flight.price.currency} {totalPrice.toFixed(2)}
                            </span>
                            {priceDetailsOpen ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-3 pl-4 border-l-2 border-flightpay-slate-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-flightpay-slate-600" data-testid="text-flight-fare-label">Flight fare</span>
                          <span data-testid="text-flight-fare">
                            {flight.price.currency} {flightFare.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-flightpay-slate-600" data-testid="text-airline-taxes-label">Airline taxes and fees</span>
                          <span data-testid="text-airline-taxes">
                            {flight.price.currency} {flightTaxes.toFixed(2)}
                          </span>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  <div className="border-t border-flightpay-slate-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-flightpay-slate-900" data-testid="text-total-label">
                        Total
                      </span>
                      <span className="text-lg font-bold text-flightpay-slate-900" data-testid="text-final-total">
                        {flight.price.currency} {totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-flightpay-slate-600 mt-1">Includes taxes and fees</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-flightpay-primary">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span data-testid="text-no-hidden-fees">No hidden fees – track your price at every step</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={handleContinue}
            size="lg"
            className="px-12 py-3 text-lg"
            data-testid="button-continue"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}