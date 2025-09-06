// Define dataLayer globally for GTM
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Initialize GTM dataLayer
export const initGTM = () => {
  // Only initialize in production environment
  if (import.meta.env.MODE !== 'production') {
    console.log('Google Tag Manager tracking disabled in development mode');
    return;
  }

  // Initialize dataLayer if it doesn't exist
  window.dataLayer = window.dataLayer || [];
  
  // Push initial GTM data
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });
};

// GTM dataLayer event tracking functions
const pushDataLayerEvent = (event: string, eventData?: any) => {
  if (typeof window === 'undefined' || !window.dataLayer) return;
  if (import.meta.env.MODE !== 'production') return;
  
  window.dataLayer.push({
    event,
    ...eventData
  });
};

// Specific GTM tracking functions for each user action
export const trackFlightSearchGTM = (origin: string, destination: string, passengers: number) => {
  pushDataLayerEvent('flight_search', {
    origin,
    destination,
    passengers,
    timestamp: new Date().toISOString()
  });
};

export const trackFlightInspectGTM = (flightId: string, route: string, price: number, currency: string) => {
  pushDataLayerEvent('flight_inspect', {
    flight_id: flightId,
    route,
    price,
    currency,
    timestamp: new Date().toISOString()
  });
};

export const trackFlightSelectGTM = (flightId: string, route: string, price: number, currency: string) => {
  pushDataLayerEvent('flight_select', {
    flight_id: flightId,
    route,
    price,
    currency,
    timestamp: new Date().toISOString()
  });
};

export const trackContactSubmitGTM = (flightId: string, passengerCount: number) => {
  pushDataLayerEvent('contact_submit', {
    flight_id: flightId,
    passenger_count: passengerCount,
    timestamp: new Date().toISOString()
  });
};

export const trackPurchaseGTM = (flightId: string, totalValue: number, currency: string, passengerCount: number) => {
  pushDataLayerEvent('purchase', {
    flight_id: flightId,
    value: totalValue,
    currency,
    passenger_count: passengerCount,
    timestamp: new Date().toISOString()
  });
};