// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize unified tracking (Google Analytics + Google Ads)
export const initTracking = () => {
  // Only initialize in production environment
  if (import.meta.env.MODE !== 'production') {
    console.log('Google Analytics and Google Ads tracking disabled in development mode');
    return;
  }

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID;

  if (!gaId && !googleAdsId) {
    console.warn('No tracking IDs configured');
    return;
  }

  // Use Google Ads ID for gtag script if available, otherwise GA ID
  const scriptId = googleAdsId || gaId;

  // Add unified gtag script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${scriptId}`;
  document.head.appendChild(script1);

  // Initialize gtag with both GA and Google Ads
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    ${gaId ? `gtag('config', '${gaId}');` : ''}
    ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ''}
  `;
  document.head.appendChild(script2);
};

// Legacy function for backward compatibility
export const initGA = () => {
  initTracking();
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (import.meta.env.MODE !== 'production') return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (import.meta.env.MODE !== 'production') return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Google Ads Conversion Tracking
export const trackConversion = (
  conversionLabel: string,
  value?: number,
  currency?: string
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (import.meta.env.MODE !== 'production') return;
  
  const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID;
  if (!googleAdsId) return;
  
  window.gtag('event', 'conversion', {
    'send_to': `${googleAdsId}/${conversionLabel}`,
    'value': value || 1.0,
    'currency': currency || 'GBP'
  });
};

// Specific conversion tracking functions
export const trackFlightSearchConversion = () => {
  trackConversion('E8FpCLu4xJQbEK-ujKhB', 1.0, 'GBP');
};

export const trackFlightInspectConversion = () => {
  trackConversion('E8FpCLu4xJQbEK-ujKhB', 1.0, 'GBP');
};

export const trackFlightSelectConversion = () => {
  trackConversion('E8FpCLu4xJQbEK-ujKhB', 1.0, 'GBP');
};

export const trackContactSubmitConversion = () => {
  trackConversion('E8FpCLu4xJQbEK-ujKhB', 1.0, 'GBP');
};

export const trackPurchaseConversion = (value: number, currency: string) => {
  trackConversion('E8FpCLu4xJQbEK-ujKhB', value, currency);
};