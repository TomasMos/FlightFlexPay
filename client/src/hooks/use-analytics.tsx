import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackPageView } from '@/lib/analytics';
import { trackPageView as trackMetaPageView } from '@/lib/metaPixel';

export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      // Track for Google Analytics
      trackPageView(location);
      // Track for Meta Pixel
      trackMetaPageView();
      prevLocationRef.current = location;
    }
  }, [location]);
};