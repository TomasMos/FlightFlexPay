import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackPageView as trackMetaPageView } from '@/lib/metaPixel';

export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      // Track for Meta Pixel (GTM handles page tracking automatically)
      trackMetaPageView();
      prevLocationRef.current = location;
    }
  }, [location]);
};