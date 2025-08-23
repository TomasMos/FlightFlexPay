import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode, determineUserCurrency, getCurrencySymbol } from '@/utils/currency';
import { useAuth } from './AuthContext';

interface CurrencyContextType {
  currency: CurrencyCode;
  currencySymbol: string;
  setCurrency: (currency: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextType>({} as CurrencyContextType);

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const { currentUser } = useAuth();

  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        // TODO: Fetch user's preferred currency from database when logged in
        const userCurrency = await determineUserCurrency(null);
        setCurrencyState(userCurrency);
      } catch (error) {
        console.error('Error initializing currency:', error);
        setCurrencyState('USD');
      }
    };

    initializeCurrency();
  }, [currentUser]);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency);
  };

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <CurrencyContext.Provider value={{ currency, currencySymbol, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}