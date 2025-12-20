import { useState, useRef, useEffect, useMemo } from "react";
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

// Popular South African airports - always available immediately
const POPULAR_SA_AIRPORTS: Airport[] = [
  { code: "JNB", name: "O.R. Tambo International Airport", city: "Johannesburg" },
  { code: "CPT", name: "Cape Town International Airport", city: "Cape Town" },
  { code: "DUR", name: "King Shaka International Airport", city: "Durban" },
  { code: "PLZ", name: "Port Elizabeth Airport", city: "Gqeberha" },
  { code: "BFN", name: "Bram Fischer International Airport", city: "Bloemfontein" },
  { code: "ELS", name: "East London Airport", city: "East London" },
  { code: "GRJ", name: "George Airport", city: "George" },
  { code: "UTN", name: "Upington Airport", city: "Upington" },
  { code: "KIM", name: "Kimberley Airport", city: "Kimberley" },
  { code: "MQP", name: "Kruger Mpumalanga International Airport", city: "Nelspruit" },
];

// Cache utilities
const CACHE_KEY_PREFIX = "airport_autocomplete_";
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedResult {
  airports: Airport[];
  timestamp: number;
}

const getCacheKey = (query: string): string => {
  return `${CACHE_KEY_PREFIX}${query.toLowerCase().trim()}`;
};

const getCachedResults = (query: string): Airport[] | null => {
  try {
    const cacheKey = getCacheKey(query);
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const parsed: CachedResult = JSON.parse(cached);
    const age = Date.now() - parsed.timestamp;

    if (age > CACHE_EXPIRY_MS) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return parsed.airports;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
};

const setCachedResults = (query: string, airports: Airport[]): void => {
  try {
    const cacheKey = getCacheKey(query);
    const cacheData: CachedResult = {
      airports,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error writing cache:", error);
    // If storage is full, try to clear old entries
    try {
      const keys = Object.keys(localStorage);
      const oldCacheKeys = keys.filter((k) => k.startsWith(CACHE_KEY_PREFIX));
      // Remove oldest 10 entries
      const entries = oldCacheKeys
        .map((k) => {
          const data = localStorage.getItem(k);
          if (!data) return null;
          try {
            const parsed: CachedResult = JSON.parse(data);
            return { key: k, timestamp: parsed.timestamp };
          } catch {
            return null;
          }
        })
        .filter((e): e is { key: string; timestamp: number } => e !== null)
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, 10);

      entries.forEach((e) => localStorage.removeItem(e.key));
      // Retry setting cache
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (retryError) {
      console.error("Error clearing old cache:", retryError);
    }
  }
};

// Filter airports by query (case-insensitive)
const filterAirports = (airports: Airport[], query: string): Airport[] => {
  const lowerQuery = query.toLowerCase().trim();
  return airports.filter(
    (airport) =>
      airport.code.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery) ||
      airport.name.toLowerCase().includes(lowerQuery)
  );
};

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

  // Get filtered SA airports immediately (no API call needed)
  const filteredSAAirports = useMemo(() => {
    if (inputValue.length < 2) return [];
    return filterAirports(POPULAR_SA_AIRPORTS, inputValue);
  }, [inputValue]);

  // Fetch from API (with localStorage caching)
  const { data: apiAirports = [] } = useQuery<Airport[]>({
    queryKey: ["/api/airports/search", inputValue],
    queryFn: async () => {
      if (inputValue.length < 2) return [];

      // Check localStorage cache first for instant results
      const cached = getCachedResults(inputValue);
      if (cached && cached.length > 0) {
        return cached;
      }

      // Fetch from API if not cached
      const response = await fetch(
        `/api/airports/search?q=${encodeURIComponent(inputValue)}`,
      );
      if (!response.ok) return [];

      const data = await response.json();
      const airports = data.airports || [];

      // Cache the results for future use
      if (airports.length > 0) {
        setCachedResults(inputValue, airports);
      }

      return airports;
    },
    enabled: inputValue.length >= 2,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days (same as localStorage cache)
    gcTime: 7 * 24 * 60 * 60 * 1000, // Keep in memory cache for 7 days
    // Return cached data immediately while refetching in background
    placeholderData: (previousData) => {
      // If we have previous data, show it while fetching
      if (previousData) return previousData;
      // Otherwise check localStorage for instant results
      if (inputValue.length >= 2) {
        return getCachedResults(inputValue) || undefined;
      }
      return undefined;
    },
  });

  // Merge results: SA airports first (most relevant), then API results (avoiding duplicates)
  const airports = useMemo(() => {
    const allAirports: Airport[] = [];
    const seenCodes = new Set<string>();

    // Add filtered SA airports first (they're most relevant and instant)
    filteredSAAirports.forEach((airport) => {
      if (!seenCodes.has(airport.code)) {
        allAirports.push(airport);
        seenCodes.add(airport.code);
      }
    });

    // Add API results (which may include cached data)
    apiAirports.forEach((airport) => {
      if (!seenCodes.has(airport.code)) {
        allAirports.push(airport);
        seenCodes.add(airport.code);
      }
    });

    return allAirports;
  }, [filteredSAAirports, apiAirports]);

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
  }, [airports, inputValue, isSelectedValue]);

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
      <Plane className="absolute left-3 top-3.5 h-4 w-4 text-splickets-slate-600 rotate-45" />
    ) : (
      <Plane className="absolute left-3 top-3.5 h-4 w-4 text-splickets-slate-600 -rotate-45" />
    );

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  return (
    <div className="relative ">
      <Label className="block text-sm font-medium text-splickets-slate-700 mb-1">
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
          className="pl-10 pr-4 py-3 border-splickets-slate-300 focus:ring-2 focus:ring-splickets-primary focus:border-splickets-primary bg-white w-full min-w-[140px] cursor-pointer"
          data-testid={testId}
          autoComplete="off"
        />
        {IconComponent}

        {isOpen && airports.length > 0 && (
          <ul
            ref={listRef}
            className="absolute z-50 w-full min-w-[320px] mt-1 bg-white border border-splickets-slate-300 rounded-md shadow-lg max-h-60 overflow-auto"
            data-testid={`${testId}-suggestions`}
          >
            {airports.map((airport, index) => (
              <li
                key={`${airport.code}-${index}`}
                className={cn(
                  "px-4 py-3 cursor-pointer border-b border-splickets-slate-100 last:border-b-0 hover:bg-splickets-slate-50",
                  selectedIndex === index && "bg-splickets-primary/10",
                )}
                onClick={() => handleSelectAirport(airport)}
                data-testid={`${testId}-option-${airport.code}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-splickets-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-splickets-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-splickets-slate-900 truncate">
                      {toTitleCase(airport.city)}
                    </div>
                    <div className="text-sm text-splickets-slate-500 truncate">
                      {toTitleCase(airport.name)}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-splickets-slate-100 text-splickets-slate-800">
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
