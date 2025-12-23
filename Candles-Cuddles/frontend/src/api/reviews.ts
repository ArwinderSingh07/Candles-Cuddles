import api from './client';

export interface Review {
  _id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
}

/**
 * Get customer ID from localStorage
 */
const getCustomerId = (): string | null => {
  return localStorage.getItem('cuddles_customer_id');
};

/**
 * Get authorization header for customer requests
 */
const getCustomerAuthHeader = (): { Authorization?: string } => {
  const customerId = getCustomerId();
  if (!customerId) return {};
  return { Authorization: `Customer ${customerId}` };
};

/**
 * Get reviews for a product
 */
export const getProductReviews = async (productId: string): Promise<ProductReviewsResponse> => {
  const { data } = await api.get<ProductReviewsResponse>(`/reviews/product/${productId}`);
  return data;
};

/**
 * Get customer's review for a product
 */
export const getCustomerReview = async (productId: string): Promise<Review | null> => {
  try {
    const { data } = await api.get<Review>(`/reviews/product/${productId}/customer`, {
      headers: getCustomerAuthHeader(),
    });
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Create a new review
 */
export const createReview = async (reviewData: CreateReviewData): Promise<Review> => {
  const { data } = await api.post<Review>(
    '/reviews',
    {
      ...reviewData,
      customerId: getCustomerId(),
    },
    {
      headers: getCustomerAuthHeader(),
    },
  );
  return data;
};

/**
 * Update a review
 */
export const updateReview = async (reviewId: string, updates: Partial<CreateReviewData>): Promise<Review> => {
  const { data } = await api.patch<Review>(
    `/reviews/${reviewId}`,
    updates,
    {
      headers: getCustomerAuthHeader(),
    },
  );
  return data;
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
  await api.delete(`/reviews/${reviewId}`, {
    headers: getCustomerAuthHeader(),
  });
};

/**
 * Get recent reviews across all products (for testimonials)
 */
export const getRecentReviews = async (limit: number = 10): Promise<Review[]> => {
  const { data } = await api.get<Review[]>(`/reviews/recent?limit=${limit}`);
  return data;
};

