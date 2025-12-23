import { Request, Response } from 'express';
import { z } from 'zod';
import { ReviewModel } from '../models/Review';
import { OrderModel } from '../models/Order';
import { ProductModel } from '../models/Product';

const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be less than 1000 characters'),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10).max(1000).optional(),
});

/**
 * Check if customer has purchased the product
 */
const hasPurchasedProduct = async (customerId: string, productId: string): Promise<boolean> => {
  const orders = await OrderModel.find({
    customerId,
    status: { $in: ['paid', 'captured'] },
    'items.productId': productId,
  }).limit(1);

  return orders.length > 0;
};

/**
 * Create a new review
 * POST /api/v1/reviews
 */
export const createReview = async (req: Request, res: Response) => {
  if (!req.customer) {
    return res.status(401).json({ message: 'Customer authentication required' });
  }

  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues });
  }

  const { productId, rating, comment } = parsed.data;

  // Verify product exists
  const product = await ProductModel.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Check if customer already reviewed this product
  const existingReview = await ReviewModel.findOne({
    productId,
    customerId: req.customer.id,
  });

  if (existingReview) {
    return res.status(409).json({ message: 'You have already reviewed this product' });
  }

  // Check if customer has purchased this product (optional - can be made required)
  const verifiedPurchase = await hasPurchasedProduct(req.customer.id, productId);

  const review = await ReviewModel.create({
    productId,
    customerId: req.customer.id,
    customerName: req.customer.name,
    customerEmail: req.customer.email,
    rating,
    comment,
    verifiedPurchase,
  });

  res.status(201).json(review);
};

/**
 * Get reviews for a product
 * GET /api/v1/reviews/product/:productId
 */
export const getProductReviews = async (req: Request, res: Response) => {
  const { productId } = req.params;

  const reviews = await ReviewModel.find({ productId })
    .sort({ createdAt: -1 })
    .limit(50);

  // Calculate average rating
  const ratings = reviews.map((r) => r.rating);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  res.json({
    reviews,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalReviews: reviews.length,
    ratingDistribution: {
      5: ratings.filter((r) => r === 5).length,
      4: ratings.filter((r) => r === 4).length,
      3: ratings.filter((r) => r === 3).length,
      2: ratings.filter((r) => r === 2).length,
      1: ratings.filter((r) => r === 1).length,
    },
  });
};

/**
 * Get customer's review for a product
 * GET /api/v1/reviews/product/:productId/customer
 */
export const getCustomerReview = async (req: Request, res: Response) => {
  if (!req.customer) {
    return res.status(401).json({ message: 'Customer authentication required' });
  }

  const { productId } = req.params;

  const review = await ReviewModel.findOne({
    productId,
    customerId: req.customer.id,
  });

  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  res.json(review);
};

/**
 * Update customer's own review
 * PATCH /api/v1/reviews/:id
 */
export const updateReview = async (req: Request, res: Response) => {
  if (!req.customer) {
    return res.status(401).json({ message: 'Customer authentication required' });
  }

  const parsed = updateReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues });
  }

  const review = await ReviewModel.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  // Verify customer owns this review
  if (review.customerId.toString() !== req.customer.id) {
    return res.status(403).json({ message: 'You can only update your own reviews' });
  }

  const updatedReview = await ReviewModel.findByIdAndUpdate(
    req.params.id,
    parsed.data,
    { new: true },
  );

  res.json(updatedReview);
};

/**
 * Delete customer's own review
 * DELETE /api/v1/reviews/:id
 */
export const deleteReview = async (req: Request, res: Response) => {
  if (!req.customer) {
    return res.status(401).json({ message: 'Customer authentication required' });
  }

  const review = await ReviewModel.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  // Verify customer owns this review
  if (review.customerId.toString() !== req.customer.id) {
    return res.status(403).json({ message: 'You can only delete your own reviews' });
  }

  await ReviewModel.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

/**
 * Get recent reviews across all products (for testimonials)
 * GET /api/v1/reviews/recent
 */
export const getRecentReviews = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  
  const reviews = await ReviewModel.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('customerName customerEmail rating comment verifiedPurchase createdAt productId')
    .lean();

  res.json(reviews);
};

