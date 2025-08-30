import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar, ChevronUp } from "lucide-react";
import type { EnhancedFlightWithPaymentPlan } from "@shared/schema";
import { countries, diallingCodes } from "@/utils/Lists";
import {
  formatTime,
  formatDuration,
  formatDate,
  formatDateShort,
  toTitleCase,
  formattedPrice,
  stopoverDuration,
} from "@/utils/formatters";
import { motion, AnimatePresence } from "framer-motion";

// Passenger form schema
const passengerSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .refine((val) => ["Mr", "Mrs", "Ms", "Miss", "Master"].includes(val), {
      message: "Please select a valid title",
    }),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  passportCountry: z.string().min(1, "Passport country is required"),
});

// Contact details schema
const contactSchema = z
  .object({
    email: z.string().email("Valid email is required"),
    confirmEmail: z.string().email("Valid email is required"),
    diallingCode: z.string().min(1, "Dialling code is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: "Emails must match",
    path: ["confirmEmail"],
  });

type PassengerForm = z.infer<typeof passengerSchema>;
type ContactForm = z.infer<typeof contactSchema>;

export default function PassengerDetails() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/flight-search/passenger-details/:flightId");
  const [flight, setFlight] = useState<EnhancedFlightWithPaymentPlan | null>(
    null,
  );
  const [passengerCount, setPassengerCount] = useState(1);
  const [searchId, setSearchId] = useState(0);
  const [priceDetailsOpen, setPriceDetailsOpen] = useState(false);
  const [userCountry, setUserCountry] = useState("ZA"); // Default to South Africa

  // Create forms for each passenger (hooks must be called at top level)
  const passengerForm1 = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportCountry: "",
    },
  });

  const passengerForm2 = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportCountry: "",
    },
  });

  const passengerForm3 = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportCountry: "",
    },
  });

  const passengerForm4 = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportCountry: "",
    },
  });

  const passengerForm5 = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportCountry: "",
    },
  });

  const passengerForm6 = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportCountry: "",
    },
  });

  // Create array of forms based on passenger count
  const passengerForms = [
    passengerForm1,
    passengerForm2,
    passengerForm3,
    passengerForm4,
    passengerForm5,
    passengerForm6,
  ].slice(0, passengerCount);

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
      .then((res) => res.json())
      .then((data) => {
        if (data.country_code) {
          setUserCountry(data.country_code);
          // Set dialling code based on country
          const diallingCodes: Record<string, string> = {
            US: "+1",
            GB: "+44",
            ZA: "+27",
            AU: "+61",
            CA: "+1",
            DE: "+49",
            FR: "+33",
            IT: "+39",
            ES: "+34",
            NL: "+31",
            BE: "+32",
            CH: "+41",
            AT: "+43",
            SE: "+46",
            NO: "+47",
            DK: "+45",
            FI: "+358",
            IE: "+353",
            PT: "+351",
            GR: "+30",
            PL: "+48",
            CZ: "+420",
            HU: "+36",
            SK: "+421",
            SI: "+386",
            HR: "+385",
            BG: "+359",
            RO: "+40",
            LT: "+370",
            LV: "+371",
            EE: "+372",
            IS: "+354",
            MT: "+356",
            CY: "+357",
            LU: "+352",
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
    window.scrollTo(0, 0)

    const searchIdLS = localStorage.getItem("searchId")
    if (searchIdLS) {
      setSearchId(Number(searchIdLS))
    }
    
    if (params?.flightId) {
      // Load flight data
      const flightData = localStorage.getItem("selectedFlight");
      if (flightData) {
        const parsedFlight = JSON.parse(flightData);
        setFlight(parsedFlight);
      }

      // Set passenger count from search data first
      const searchData = localStorage.getItem("lastFlightSearch");
      if (searchData) {
        const search = JSON.parse(searchData);
        setPassengerCount(search.passengers || 1);
      }

      // Load and populate passenger data
      const storedPassengerData = localStorage.getItem("passengerData");
      if (storedPassengerData) {
        const { passengers: storedPassengers, contactDetails: storedContact } =
          JSON.parse(storedPassengerData);

        // Populate contact form
        if (storedContact) {
          contactForm.reset(storedContact);
        }

        // Populate passenger forms based on passengerCount
        const formsToPopulate = Math.min(
          passengerCount,
          storedPassengers.length,
        );

        
        
        for (let i = 0; i < formsToPopulate; i++) {
          passengerForms[i].reset(storedPassengers[i]);
        }
      }
    }
  }, [params?.flightId, passengerCount]); // Add passengerCount as a dependency

  const handleContinue = async () => {
    // Trigger validation on all forms
    const passengerValidations = await Promise.all(
      passengerForms.map((form) => form.trigger()),
    );
    const contactValid = await contactForm.trigger();

    const allFormsValid =
      passengerValidations.every((isValid) => isValid) && contactValid;

    if (allFormsValid) {
      const allPassengerData = passengerForms.map((form) => form.getValues());
      const contactData = contactForm.getValues();

      try {
        // Save to database as lead
        const response = await fetch("/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactDetails: contactData,
            passengers: allPassengerData,
            searchId: searchId // Will be linked later when search history is implemented
          }),
        });

        // console.log(`passengerdetails - 288`, response)

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || "Failed to save passenger details");
        }

        // Save passenger data and lead ID to localStorage
        localStorage.setItem(
          "passengerData",
          JSON.stringify({
            passengers: allPassengerData,
            contactDetails: contactData,
            flightId: flight?.id,
            passengerCount,
          }),
        );
        localStorage.setItem("leadId", result.leadId.toString());

        setLocation("/flight-search/book");
      } catch (error) {
        console.error("Error saving passenger details:", error);
        alert("Failed to save passenger details. Please try again.");
      }
    }
  };

  const handleConfirmEmailPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
  };

  if (!flight) {
    return (
      <div className="min-h-screen bg-splickets-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-splickets-slate-900 mb-2">
            Loading flight details...
          </h2>
          <p className="text-splickets-slate-600">
            Please wait while we load your flight information.
          </p>
        </div>
      </div>
    );
  }

  const getFlightSummary = () => {
    const lastItineraryIndex = flight.itineraries.length - 1;
    const lastSegmentInLastItinerary =
      flight.itineraries[lastItineraryIndex].segments.length - 1;
    const firstSegment = flight.itineraries[0].segments[0];
    const lastSegment =
      flight.itineraries[lastItineraryIndex].segments[
        lastSegmentInLastItinerary
      ];

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
  const flightTaxes =
    parseFloat(flight.price.total) - parseFloat(flight.price.base);
  const totalPrice = parseFloat(flight.price.total);

  return (
    <div className="min-h-screen bg-splickets-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Passenger and Contact Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details Form */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="title-contact-details">
                  Contact Details
                </CardTitle>
                <p className="text-sm text-splickets-slate-600">
                  Confirmation and account details
                </p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="diallingCode">Dialling Code</Label>
                    <Select
                      value={contactForm.watch("diallingCode")}
                      onValueChange={(value) =>
                        contactForm.setValue("diallingCode", value)
                      }
                    >
                      <SelectTrigger data-testid="select-dialling-code">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {diallingCodes.map((code) => (
                          <SelectItem key={code.key} value={code.value}>
                            {code.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1">
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
            {/* Passenger Forms */}
            {passengerForms.map((form, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle data-testid={`title-passenger-${index + 1}`}>
                    Passenger {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Select
                        value={form.watch("title")}
                        onValueChange={(value) =>
                          form.setValue("title", value as any)
                        }
                      >
                        <SelectTrigger
                          data-testid={`select-title-${index + 1}`}
                        >
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
                      {form.formState.errors.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        {...form.register("firstName")}
                        data-testid={`input-first-name-${index + 1}`}
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        {...form.register("lastName")}
                        data-testid={`input-last-name-${index + 1}`}
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col justify-between  gap-1 pt-1">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <div className="relative flex">
                        <Input
                          {...form.register("dateOfBirth")}
                          type="date"
                          className="hide-date-icon pl-10 w-full pr-4 py-3  focus:ring-2 focus:ring-splickets-primary focus:border-splickets-primary bg-white cursor-pointer"
                          data-testid={`input-date-of-birth-${index + 1}`}
                          onClick={(e) =>
                            (e.target as HTMLInputElement).showPicker()
                          }
                        />
                        <Calendar
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-splickets-slate-600 pointer-events-none"
                          // Crucial: Add 'pointer-events-none' so clicks go *through* the icon to the input
                        />
                      </div>
                      {form.formState.errors.dateOfBirth && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.dateOfBirth.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="passportCountry">Passport Country</Label>
                      <Select
                        value={form.watch("passportCountry")}
                        onValueChange={(value) =>
                          form.setValue("passportCountry", value)
                        }
                      >
                        <SelectTrigger
                          data-testid={`select-passport-country-${index + 1}`}
                        >
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.passportCountry && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.passportCountry.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Section - Price Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-[98px] space-y-6">
              {/* Flight Summary Header */}
              <div className=" bg-white rounded-lg shadow-sm border border-splickets-slate-200 p-6 mb-8">
                <h1
                  className="text-2xl font-bold text-splickets-slate-900 mb-4"
                  data-testid="title-passenger-details"
                >
                  Flight Summary
                </h1>
                {flight.itineraries.map((itinerary, itineraryIndex) => {
                  const firstSegment = itinerary.segments[0];
                  const lastSegment =
                    itinerary.segments[itinerary.segments.length - 1];
                  const stops = itinerary.segments.length - 1;

                  return (
                    <div
                      key={itineraryIndex}
                      data-testid={`itinerary-section-${itineraryIndex}`}
                      className="text-splickets-slate-900 text-sm grid grid-cols-3 mb-8"
                    >
                      {/* Origin */}
                      <div className="text-left col-span-1">
                        <div>
                          {toTitleCase(firstSegment.departure.cityName)}
                        </div>
                        <div className="  mt-1">
                          {formatTime(firstSegment.departure.at)}
                        </div>
                        <div className="  mt-1">
                          {formatDateShort(firstSegment.departure.at)}
                        </div>
                      </div>

                      {/* Flight info */}
                      <div className=" text-center flex flex-col justify-center col-span-1 ">
                        <div className="   mb-1">
                          {stops === 0
                            ? "Nonstop"
                            : `${stops} stop${stops > 1 ? "s" : ""}`}
                        </div>
                        <div className=" ">
                          {formatDuration(itinerary.duration)}
                        </div>
                      </div>

                      {/* Destination */}
                      <div className="text-right col-span-1">
                        <div className="">
                          {toTitleCase(lastSegment.arrival.cityName)}
                          {/* {lastSegment.arrival.cityName} */}
                        </div>
                        <div className=" mt-1">
                          {formatTime(lastSegment.arrival.at)}
                        </div>
                        <div className="mt-1">
                          {formatDateShort(lastSegment.arrival.at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="">
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="title-price-details">
                      Price Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Collapsible
                        open={priceDetailsOpen}
                        onOpenChange={setPriceDetailsOpen}
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-0 hover:bg-transparent">
                          <div className="flex items-center justify-between w-full">
                            <span
                              className="text-splickets-slate-900"
                              data-testid="text-adult-count"
                            >
                              Adult ({passengerCount})
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className="font-semibold"
                                data-testid="text-total-price"
                              >
                                {flight.price.currency}{" "}
                                {formattedPrice(totalPrice)}
                              </span>
                              <motion.div
                                animate={{
                                  rotate: priceDetailsOpen ? 180 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                {priceDetailsOpen ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronUp className="h-4 w-4" />
                                )}
                              </motion.div>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <AnimatePresence initial={false}>
                          {priceDetailsOpen && (
                            <motion.div
                              key="price-details"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden  pl-4 border-l-2 border-splickets-slate-100"
                            >
                              <div className="space-y-2 mt-4">
                                <div className="flex justify-between text-sm mr-6">
                                  <span
                                    className="text-splickets-slate-600"
                                    data-testid="text-flight-fare-label"
                                  >
                                    Flight fare
                                  </span>
                                  <span data-testid="text-flight-fare">
                                    {flight.price.currency}{" "}
                                    {formattedPrice(flightFare)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm mr-6">
                                  <span
                                    className="text-splickets-slate-600"
                                    data-testid="text-airline-taxes-label"
                                  >
                                    Airline taxes and fees
                                  </span>
                                  <span data-testid="text-airline-taxes">
                                    {flight.price.currency}{" "}
                                    {formattedPrice(flightTaxes)}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Collapsible>
                    </div>

                    <div className="border-t border-splickets-slate-200 pt-4">
                      <div className="flex justify-between items-center mr-6">
                        <span
                          className="text-lg font-bold text-splickets-slate-900"
                          data-testid="text-total-label"
                        >
                          Total
                        </span>
                        <span
                          className="text-lg font-bold text-splickets-slate-900"
                          data-testid="text-final-total"
                        >
                          {/* formattedPrice(totalPrice) */}
                          {flight.price.currency} {formattedPrice(totalPrice)}
                        </span>
                      </div>
                      <p className="text-sm text-splickets-slate-600 mt-1">
                        Includes taxes and fees
                      </p>
                    </div>
                  </CardContent>
                </Card>
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
        </div>
      </div>

    </div>
  );
}
