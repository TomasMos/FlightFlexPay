import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  toTitleCase,
} from "@/utils/formatters";

interface Airport {
  code: string;
  name: string;
  city: string;
}

interface AirportAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string, iataCode: string) => void;
  icon?: "departure" | "arrival";
  error?: string;
  testId?: string;
}

export function AirportAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  icon = "departure",
  error,
  testId,
}: AirportAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { data: airports = [] } = useQuery<Airport[]>({
    queryKey: ["/api/airports/search", inputValue],
    queryFn: async () => {
      if (inputValue.length < 2) return [];

      const response = await fetch(
        `/api/airports/search?q=${encodeURIComponent(inputValue)}`,
      );
      if (!response.ok) return [];

      const data = await response.json();
      return data.airports || [];
    },
    enabled: inputValue.length >= 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const isSelectedValue = airports.some(
    (airport) => `${toTitleCase(airport.city)} (${airport.code})` === inputValue
  );

  useEffect(() => {
    if (airports.length > 0 && inputValue.length >= 2 && !isSelectedValue) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [airports, inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // If user clears the input, also clear the parent value
    if (newValue === "") {
      onChange("", "");
    }
  };

  const handleSelectAirport = (airport: Airport) => {
    const displayValue = `${toTitleCase(airport.city)} (${airport.code})`;
    setInputValue(displayValue);
    onChange(displayValue, airport.code);
    setIsOpen(false);
    setSelectedIndex(-1);
    // Don't blur here to avoid the focus issue
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < airports.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && airports[selectedIndex]) {
          handleSelectAirport(airports[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        listRef.current &&
        !listRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const IconComponent =
    icon === "departure" ? (
      <Plane className="absolute left-3 top-3.5 h-4 w-4 text-flightpay-slate-600 rotate-45" />
    ) : (
      <Plane className="absolute left-3 top-3.5 h-4 w-4 text-flightpay-slate-600 -rotate-45" />
    );

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  return (
    <div className="relative ">
      <Label className="block text-sm font-medium text-flightpay-slate-700 mb-1">
        {label}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          onFocus={handleFocus} 
          className="pl-10 pr-4 py-3 border-flightpay-slate-300 focus:ring-2 focus:ring-flightpay-primary focus:border-flightpay-primary bg-white w-full min-w-[140px] cursor-pointer"
          data-testid={testId}
          autoComplete="off"
        />
        {IconComponent}

        {isOpen && airports.length > 0 && (
          <ul
            ref={listRef}
            className="absolute z-50 w-full min-w-[320px] mt-1 bg-white border border-flightpay-slate-300 rounded-md shadow-lg max-h-60 overflow-auto"
            data-testid={`${testId}-suggestions`}
          >
            {airports.map((airport, index) => (
              <li
                key={`${airport.code}-${index}`}
                className={cn(
                  "px-4 py-3 cursor-pointer border-b border-flightpay-slate-100 last:border-b-0 hover:bg-flightpay-slate-50",
                  selectedIndex === index && "bg-flightpay-primary/10",
                )}
                onClick={() => handleSelectAirport(airport)}
                data-testid={`${testId}-option-${airport.code}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-flightpay-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-flightpay-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-flightpay-slate-900 truncate">
                      {toTitleCase(airport.city)}
                    </div>
                    <div className="text-sm text-flightpay-slate-500 truncate">
                      {toTitleCase(airport.name)}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-flightpay-slate-100 text-flightpay-slate-800">
                      {airport.code}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p
          className="text-sm text-red-600 mt-1"
          data-testid={`${testId}-error`}
        >
          {error}
        </p>
      )}
    </div>
  );
}
