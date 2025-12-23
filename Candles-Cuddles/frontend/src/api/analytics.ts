import api from './client';

export const trackPageView = async (data: {
  path: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  country?: string;
  region?: string;
  city?: string;
  sessionId: string;
  userId?: string;
}) => {
  try {
    // Always send IP - backend will resolve location
    const payload = {
      ...data,
      // Ensure IP is sent if available
    };
    await api.post('/analytics/pageview', payload);
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.error('Failed to track page view:', error);
  }
};

export const trackProductView = async (data: {
  productId: string;
  sessionId: string;
  userId?: string;
}) => {
  try {
    await api.post('/analytics/productview', data);
  } catch (error) {
    console.error('Failed to track product view:', error);
  }
};

export const trackCartAction = async (data: {
  productId: string;
  action: 'add' | 'remove';
  sessionId: string;
  userId?: string;
}) => {
  try {
    await api.post('/analytics/cartaction', data);
  } catch (error) {
    console.error('Failed to track cart action:', error);
  }
};

