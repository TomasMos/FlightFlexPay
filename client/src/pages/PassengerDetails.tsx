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

// Common countries list
const countries = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo (Democratic Republic)" },
  { code: "CR", name: "Costa Rica" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "Korea (North)" },
  { code: "KR", name: "Korea (South)" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "MK", name: "North Macedonia" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PS", name: "Palestine" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VA", name: "Vatican City" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" }
];

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
  const [passengerCount, setPassengerCount] = useState(1);
  const [priceDetailsOpen, setPriceDetailsOpen] = useState(false);
  const [userCountry, setUserCountry] = useState("ZA"); // Default to South Africa

  // Create forms for each passenger (hooks must be called at top level)
  const passengerForm1 = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: "Mr",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportCountry: "",
    },
  });

  const passengerForm2 = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: "Mr",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportCountry: "",
    },
  });

  const passengerForm3 = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: "Mr",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportCountry: "",
    },
  });

  const passengerForm4 = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: "Mr",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportCountry: "",
    },
  });

  const passengerForm5 = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: "Mr",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportCountry: "",
    },
  });

  const passengerForm6 = useForm<PassengerForm>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      title: "Mr",
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
        const parsedFlight = JSON.parse(flightData);
        setFlight(parsedFlight);
        // Set passenger count from flight search (default to 1 if not found)
        const searchData = localStorage.getItem("lastFlightSearch");
        if (searchData) {
          const search = JSON.parse(searchData);
          setPassengerCount(search.passengers || 1);
        }
      }
    }
  }, [params?.flightId]);

  const handleContinue = () => {
    // Validate all passenger forms and contact form
    const allPassengerData = passengerForms.map(form => form.getValues());
    const contactData = contactForm.getValues();
    
    // Check if all forms are valid
    const allFormsValid = passengerForms.every(form => form.formState.isValid) && 
                          contactForm.formState.isValid;
    
    if (allFormsValid) {
      // Store form data and navigate to review page
      localStorage.setItem("passengerData", JSON.stringify({
        passengers: allPassengerData,
        contact: contactData,
        flightId: flight?.id,
        passengerCount,
      }));
      setLocation("/flight-booking/review");
    } else {
      // Trigger validation on all forms
      passengerForms.forEach(form => form.trigger());
      contactForm.trigger();
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
                        onValueChange={(value) => form.setValue("title", value as any)}
                      >
                        <SelectTrigger data-testid={`select-title-${index + 1}`}>
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
                    <div>
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
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input 
                        {...form.register("dateOfBirth")}
                        type="date"
                        data-testid={`input-date-of-birth-${index + 1}`}
                      />
                      {form.formState.errors.dateOfBirth && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.dateOfBirth.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="passportCountry">Passport Country</Label>
                    <Select 
                      value={form.watch("passportCountry")} 
                      onValueChange={(value) => form.setValue("passportCountry", value)}
                    >
                      <SelectTrigger data-testid={`select-passport-country-${index + 1}`}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.name}>
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
                </CardContent>
              </Card>
            ))}

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