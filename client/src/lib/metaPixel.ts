// Define the fbq function globally
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

// Initialize Meta Pixel
export const initMetaPixel = () => {
  // Only initialize in production environment
  if (import.meta.env.MODE !== 'production') {
    console.log('Meta Pixel disabled in development mode');
    return;
  }

  const pixelId = '1431128794853992';

  // Prevent duplicate initialization
  if (typeof window !== 'undefined' && window.fbq) return;

  // Meta Pixel initialization code
  (function(f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js', undefined, undefined, undefined);

  // Initialize pixel and track PageView
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }
};

// Track page views for SPA navigation
export const trackPageView = () => {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'PageView');
};

// Track custom events
export const trackMetaEvent = (eventName: string, parameters?: any) => {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', eventName, parameters || {});
};

// Specific event tracking functions
export const trackFlightSearch = (origin: string, destination: string, passengers: number) => {
  trackMetaEvent('Search', {
    search_string: `${origin} to ${destination}`,
    content_category: 'flights',
    custom_passengers: passengers
  });
};

export const trackFlightView = (flightId: string, route: string, price: number, currency: string) => {
  trackMetaEvent('ViewContent', {
    content_ids: [flightId],
    content_type: 'flight',
    content_name: route,
    value: price,
    currency: currency
  });
};

export const trackFlightSelect = (flightId: string, route: string, price: number, currency: string) => {
  trackMetaEvent('AddToCart', {
    content_ids: [flightId],
    content_type: 'flight',
    content_name: route,
    value: price,
    currency: currency
  });
};

export const trackContactSubmit = (flightId: string, passengers: number) => {
  trackMetaEvent('InitiateCheckout', {
    content_ids: [flightId],
    content_type: 'flight',
    num_items: passengers
  });
};

export const trackPurchase = (flightId: string, totalValue: number, currency: string, passengers: number) => {
  trackMetaEvent('Purchase', {
    content_ids: [flightId],
    content_type: 'flight',
    value: totalValue,
    currency: currency,
    num_items: passengers
  });
};