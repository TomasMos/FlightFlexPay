// Supported currencies in the specified order
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

// Country to currency mapping for IP-based detection
const COUNTRY_CURRENCY_MAP: Record<string, CurrencyCode> = {
  'US': 'USD',
  'GB': 'GBP',
  // EU countries
  'AT': 'EUR', 'BE': 'EUR', 'BG': 'EUR', 'HR': 'EUR', 'CY': 'EUR', 'CZ': 'EUR',
  'DK': 'EUR', 'EE': 'EUR', 'FI': 'EUR', 'FR': 'EUR', 'DE': 'EUR', 'GR': 'EUR',
  'HU': 'EUR', 'IE': 'EUR', 'IT': 'EUR', 'LV': 'EUR', 'LT': 'EUR', 'LU': 'EUR',
  'MT': 'EUR', 'NL': 'EUR', 'PL': 'EUR', 'PT': 'EUR', 'RO': 'EUR', 'SK': 'EUR',
  'SI': 'EUR', 'ES': 'EUR', 'SE': 'EUR',
  // ZAR countries
  'ZA': 'ZAR', 'LS': 'ZAR', 'SZ': 'ZAR', 'NA': 'ZAR', 'ZW': 'ZAR', 'BW': 'ZAR', 'MZ': 'ZAR',
  'AU': 'AUD',
  'NZ': 'NZD',
  'CA': 'CAD',
  'AE': 'AED',
  'SG': 'SGD',
};

// Get currency from IP-based country detection
export async function getCurrencyFromIP(): Promise<CurrencyCode> {
  try {
    // Using a free IP geolocation service
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('IP detection failed');
    }
    
    const data = await response.json();
    const countryCode = data.country_code as string;
    
    return COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
  } catch (error) {
    console.warn('IP-based currency detection failed:', error);
    return 'USD';
  }
}

// Get currency symbol for display
export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}

// Get currency name for display
export function getCurrencyName(currencyCode: CurrencyCode): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.name || currencyCode;
}

// Get currency flag for display
export function getCurrencyFlag(currencyCode: CurrencyCode): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.flag || '';
}

// Currency selection logic according to spec
export async function determineUserCurrency(
  userPreferredCurrency?: string | null,
): Promise<CurrencyCode> {
  // 1. If logged in, use preferredCurrency from user's table
  if (userPreferredCurrency && SUPPORTED_CURRENCIES.some(c => c.code === userPreferredCurrency)) {
    return userPreferredCurrency as CurrencyCode;
  }
  
  // 2. Use localStorage
  const storedCurrency = localStorage.getItem('selectedCurrency');
  if (storedCurrency && SUPPORTED_CURRENCIES.some(c => c.code === storedCurrency)) {
    return storedCurrency as CurrencyCode;
  }
  
  // 3. Use IP-based detection
  try {
    const ipCurrency = await getCurrencyFromIP();
    // Save to localStorage for future use
    localStorage.setItem('selectedCurrency', ipCurrency);
    return ipCurrency;
  } catch (error) {
    console.warn('IP-based currency detection failed, using USD default');
  }
  
  // 4. Default to USD
  return 'USD';
}

// Save currency to localStorage
export function saveCurrencyToStorage(currency: CurrencyCode): void {
  localStorage.setItem('selectedCurrency', currency);
}