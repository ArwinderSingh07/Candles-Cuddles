import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductReviews, createReview, updateReview, deleteReview, type CreateReviewData } from '../api/reviews';

export const useProductReviews = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => getProductReviews(productId!),
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewData) => createReview(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, updates }: { reviewId: string; updates: Partial<CreateReviewData> }) =>
      updateReview(reviewId, updates),
    onSuccess: () => {
      // Invalidate reviews for the product
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

