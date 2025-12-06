import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { createReview, updateReview, deleteReview, getCustomerReview, type Review } from '../api/reviews';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

export const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExistingReview = async () => {
      try {
        const review = await getCustomerReview(productId);
        if (review) {
          setExistingReview(review);
          setRating(review.rating);
          setComment(review.comment);
        }
      } catch (error) {
        // Customer not logged in or no review exists
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingReview();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        await updateReview(existingReview._id, { rating, comment });
        setToast('Review updated successfully! ✨');
      } else {
        await createReview({ productId, rating, comment });
        setToast('Thank you for your review! ✨');
      }
      setExistingReview(null);
      setComment('');
      setRating(0);
      setTimeout(() => {
        setToast(null);
        onReviewSubmitted?.();
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;

    if (!confirm('Are you sure you want to delete your review?')) return;

    try {
      await deleteReview(existingReview._id);
      setToast('Review deleted');
      setExistingReview(null);
      setRating(0);
      setComment('');
      setTimeout(() => {
        setToast(null);
        onReviewSubmitted?.();
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to delete review');
    }
  };

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('cuddles_customer_id');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-xl border border-brand/10 bg-white p-6">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-xl border border-brand/10 bg-white p-6 text-center">
          <p className="text-brand-dark/60">
            Please{' '}
            <a href="/signin" className="font-semibold text-brand hover:underline">
              sign in
            </a>{' '}
            to write a review
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg sm:right-6">
          {toast}
        </div>
      )}

      <div className="rounded-xl border border-brand/10 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-display text-xl text-brand-dark">
          {existingReview ? 'Update Your Review' : 'Write a Review'}
        </h3>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-dark">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  {(hoveredRating >= star || (!hoveredRating && rating >= star)) ? (
                    <StarIcon className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <StarIconOutline className="h-8 w-8 text-gray-300" />
                  )}
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-brand-dark/60">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-dark">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-brand/20 bg-white px-4 py-3 text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
              rows={5}
              placeholder="Share your experience with this product..."
              required
              minLength={10}
            />
            <p className="mt-1 text-xs text-brand-dark/60">
              {comment.length}/1000 characters (minimum 10)
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
              className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
            </button>
            {existingReview && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-full border border-red-300 px-6 py-2.5 font-semibold text-red-600 transition hover:bg-red-50"
              >
                Delete Review
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};

