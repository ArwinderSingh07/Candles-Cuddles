import { Request, Response } from 'express';
import { z } from 'zod';
import { PageViewModel, ProductViewModel, CartActionModel } from '../models/Analytics';
import { ProductModel } from '../models/Product';

// Cache for IP to location mappings (to avoid hitting rate limits)
const ipLocationCache = new Map<string, { location: { country?: string; region?: string; city?: string }; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 10000; // Max cached IPs

const analyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
  region: z.string().optional(),
});

// Helper to get client IP
const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

// Get location from IP using free ip-api.com service with caching
const getLocationFromIp = async (ip: string): Promise<{ country?: string; region?: string; city?: string }> => {
  // Skip localhost/private IPs
  if (
    !ip ||
    ip === 'unknown' ||
    ip.startsWith('127.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip === '::1' ||
    ip === 'localhost'
  ) {
    return {};
  }

  // Check cache first
  const cached = ipLocationCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.location;
  }

  // Clean cache if it's too large
  if (ipLocationCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = Array.from(ipLocationCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0];
    if (oldestKey) {
      ipLocationCache.delete(oldestKey);
    }
  }

  try {
    // Using ip-api.com (free, no API key needed, 45 req/min limit)
    // Add delay to avoid hitting rate limit
    await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay between requests
    
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`, {
      headers: {
        'User-Agent': 'CandlesAndCuddles-Analytics/1.0',
      },
    });
    
    if (!response.ok) {
      // If rate limited, return empty and don't cache
      if (response.status === 429) {
        console.warn('IP geolocation API rate limited, skipping lookup for:', ip);
        return {};
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'success') {
      const location = {
        country: data.country || undefined,
        region: data.regionName || undefined,
        city: data.city || undefined,
      };
      
      // Cache the result
      ipLocationCache.set(ip, {
        location,
        timestamp: Date.now(),
      });
      
      return location;
    }
  } catch (error) {
    // Silently fail - don't break tracking if geolocation fails
    if (error instanceof Error && error.message.includes('429')) {
      console.warn('IP geolocation API rate limited');
    } else {
      console.error('Failed to get location from IP:', error);
    }
  }

  return {};
};

export const trackPageView = async (req: Request, res: Response) => {
  try {
    const { path, referrer, userAgent, ip: providedIp, country, region, city, sessionId, userId } = req.body;
    
    // Get IP from request if not provided
    const clientIp = providedIp || getClientIp(req);
    
    // Get location from IP if not provided (but don't block on it)
    let locationData = { country, region, city };
    if ((!country && !region && !city) && clientIp && clientIp !== 'unknown') {
      // Don't await - let it resolve in background to avoid blocking
      getLocationFromIp(clientIp)
        .then((location) => {
          // Update the page view with location if it was created without one
          if (location.country || location.region || location.city) {
            PageViewModel.findOneAndUpdate(
              { sessionId, path, timestamp: { $gte: new Date(Date.now() - 5000) } },
              { $set: location },
              { sort: { timestamp: -1 } }
            ).catch(() => {
              // Ignore update errors
            });
          }
        })
        .catch(() => {
          // Ignore geolocation errors
        });
    }

    // Create page view immediately (don't wait for geolocation)
    await PageViewModel.create({
      path,
      referrer,
      userAgent,
      ip: clientIp,
      country: locationData.country,
      region: locationData.region,
      city: locationData.city,
      sessionId,
      userId,
      timestamp: new Date(),
    });

    res.status(201).json({ message: 'Page view tracked' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to track page view', error });
  }
};

export const trackProductView = async (req: Request, res: Response) => {
  try {
    const { productId, sessionId, userId } = req.body;

    await ProductViewModel.create({
      productId,
      sessionId,
      userId,
      timestamp: new Date(),
    });

    res.status(201).json({ message: 'Product view tracked' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to track product view', error });
  }
};

export const trackCartAction = async (req: Request, res: Response) => {
  try {
    const { productId, action, sessionId, userId } = req.body;

    await CartActionModel.create({
      productId,
      action,
      sessionId,
      userId,
      timestamp: new Date(),
    });

    res.status(201).json({ message: 'Cart action tracked' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to track cart action', error });
  }
};

export const getTrafficMetrics = async (req: Request, res: Response) => {
  try {
    const parsed = analyticsQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

    const { startDate, endDate, region } = parsed.data;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Ensure dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const matchQuery: any = {
      timestamp: { $gte: start, $lte: end },
    };

    if (region) {
      matchQuery.region = region;
    }

    // Total unique visitors
    const uniqueVisitors = await PageViewModel.distinct('sessionId', matchQuery);

    // Page views by day
    const pageViewsByDay = await PageViewModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          views: { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          date: '$_id',
          views: 1,
          uniqueVisitors: { $size: '$uniqueSessions' },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Geographic breakdown
    const geographicData = await PageViewModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { region: '$region', country: '$country' },
          visitors: { $addToSet: '$sessionId' },
          views: { $sum: 1 },
        },
      },
      {
        $project: {
          region: '$_id.region',
          country: '$_id.country',
          visitors: { $size: '$visitors' },
          views: 1,
        },
      },
      { $sort: { visitors: -1 } },
    ]);

    // Get detailed visitor information
    const visitorDetails = await PageViewModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$sessionId',
          firstVisit: { $min: '$timestamp' },
          lastVisit: { $max: '$timestamp' },
          pageViews: { $sum: 1 },
          userId: { $first: '$userId' },
          region: { $first: '$region' },
          country: { $first: '$country' },
          city: { $first: '$city' },
          userAgent: { $first: '$userAgent' },
          paths: { $addToSet: '$path' },
        },
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          sessionId: '$_id',
          firstVisit: 1,
          lastVisit: 1,
          pageViews: 1,
          userId: 1,
          region: 1,
          country: 1,
          city: 1,
          userAgent: 1,
          paths: 1,
          userName: { $arrayElemAt: ['$user.name', 0] },
          userEmail: { $arrayElemAt: ['$user.email', 0] },
        },
      },
      { $sort: { lastVisit: -1 } },
    ]);

    res.json({
      totalVisitors: uniqueVisitors.length,
      pageViewsByDay,
      geographicBreakdown: geographicData,
      visitors: visitorDetails,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get traffic metrics', error });
  }
};

export const getProductEngagement = async (req: Request, res: Response) => {
  try {
    const parsed = analyticsQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

    const { startDate, endDate, category } = parsed.data;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const matchQuery: any = {
      timestamp: { $gte: start, $lte: end },
    };

    // Get product views
    const productViews = await ProductViewModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$productId',
          views: { $sum: 1 },
          uniqueViewers: { $addToSet: '$sessionId' },
        },
      },
    ]);

    // Get cart additions
    const cartAdditions = await CartActionModel.aggregate([
      { $match: { ...matchQuery, action: 'add' } },
      {
        $group: {
          _id: '$productId',
          additions: { $sum: 1 },
          uniqueAdditions: { $addToSet: '$sessionId' },
        },
      },
    ]);

    // Get successful orders (captured or paid)
    const { OrderModel } = await import('../models/Order');
    const successfulOrders = await OrderModel.find({
      status: { $in: ['captured', 'paid'] },
      createdAt: { $gte: start, $lte: end },
    });

    // Aggregate order sales by product
    const orderSales = new Map<string, { quantity: number; revenue: number; orderCount: number }>();
    successfulOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = orderSales.get(item.productId) || { quantity: 0, revenue: 0, orderCount: 0 };
        orderSales.set(item.productId, {
          quantity: existing.quantity + item.qty,
          revenue: existing.revenue + item.price * item.qty,
          orderCount: existing.orderCount + 1,
        });
      });
    });

    // Get product details
    const allProductIds = new Set([
      ...productViews.map((p) => p._id),
      ...cartAdditions.map((c) => c._id),
      ...Array.from(orderSales.keys()),
    ]);
    const products = await ProductModel.find({
      _id: { $in: Array.from(allProductIds) },
      ...(category ? { category } : {}),
    });

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const engagementData = Array.from(allProductIds).map((productId) => {
      const product = productMap.get(productId.toString());
      const views = productViews.find((p) => p._id === productId) || { views: 0, uniqueViewers: [] };
      const cart = cartAdditions.find((c) => c._id === productId) || { additions: 0, uniqueAdditions: [] };
      const sales = orderSales.get(productId.toString()) || { quantity: 0, revenue: 0, orderCount: 0 };

      return {
        productId: productId.toString(),
        title: product?.title || 'Unknown Product',
        category: product?.category,
        views: views.views,
        uniqueViewers: views.uniqueViewers.length,
        cartAdditions: cart.additions,
        uniqueCartAdditions: cart.uniqueAdditions.length,
        salesQuantity: sales.quantity,
        salesRevenue: sales.revenue,
        salesOrderCount: sales.orderCount,
        conversionRate: views.views > 0 ? (cart.additions / views.views) * 100 : 0,
        cartToOrderRate: cart.additions > 0 ? (sales.orderCount / cart.additions) * 100 : 0,
      };
    });

    // Sort by views
    engagementData.sort((a, b) => b.views - a.views);

    const totalSalesRevenue = Array.from(orderSales.values()).reduce((sum, s) => sum + s.revenue, 0);
    const totalSalesQuantity = Array.from(orderSales.values()).reduce((sum, s) => sum + s.quantity, 0);

    res.json({
      products: engagementData,
      summary: {
        totalProductViews: productViews.reduce((sum, p) => sum + p.views, 0),
        totalCartAdditions: cartAdditions.reduce((sum, c) => sum + c.additions, 0),
        totalSalesRevenue,
        totalSalesQuantity,
        totalSuccessfulOrders: successfulOrders.length,
        averageConversionRate:
          engagementData.length > 0
            ? engagementData.reduce((sum, p) => sum + p.conversionRate, 0) / engagementData.length
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get product engagement', error });
  }
};

export const getAnalyticsSummary = async (req: Request, res: Response) => {
  try {
    const parsed = analyticsQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

    const { startDate, endDate } = parsed.data;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const matchQuery = {
      timestamp: { $gte: start, $lte: end },
    };

    const [trafficMetrics, productEngagement] = await Promise.all([
      getTrafficMetrics({ query: parsed.data } as Request, res),
      getProductEngagement({ query: parsed.data } as Request, res),
    ]);

    // This is a simplified version - in production, you'd want to combine these properly
    res.json({
      traffic: {
        totalVisitors: 0, // Will be populated by trafficMetrics
      },
      products: {
        totalViews: 0, // Will be populated by productEngagement
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get analytics summary', error });
  }
};

