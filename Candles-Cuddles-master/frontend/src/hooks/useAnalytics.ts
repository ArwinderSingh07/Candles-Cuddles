import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackProductView } from '../api/analytics';

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Get user ID from localStorage if logged in
const getUserId = (): string | undefined => {
  const customerData = localStorage.getItem('customer');
  if (customerData) {
    try {
      const customer = JSON.parse(customerData);
      return customer._id;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

// Get location data using browser geolocation API or IP-based service
const getLocationData = async (): Promise<{ country?: string; region?: string; city?: string; ip?: string }> => {
  // Try to get IP first (will be used by backend for geolocation)
  let ip: string | undefined;
  
  try {
    // Get IP using a free service
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    ip = ipData.ip;
  } catch (error) {
    console.error('Failed to get IP:', error);
  }

  // Return IP - backend will resolve location from IP
  return {
    ip,
    // Location will be resolved by backend from IP
  };
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const track = async () => {
      const locationData = await getLocationData();
      
      await trackPageView({
        path: location.pathname,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent,
        sessionId: getSessionId(),
        userId: getUserId(),
        ...locationData,
      });
    };

    track();
  }, [location.pathname]);
};

export const useProductTracking = (productId: string) => {
  useEffect(() => {
    const track = async () => {
      if (productId) {
        await trackProductView({
          productId,
          sessionId: getSessionId(),
          userId: getUserId(),
        });
      }
    };

    track();
  }, [productId]);
};

// Export session ID getter for use in cart tracking
export { getSessionId, getUserId };

