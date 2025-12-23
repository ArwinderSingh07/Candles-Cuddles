import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import type { Review } from '../api/reviews';

interface ReviewDisplayProps {
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

const StarRating = ({ rating, size = 'h-5 w-5' }: { rating: number; size?: string }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        star <= rating ? (
          <StarIcon key={star} className={`${size} text-yellow-400`} />
        ) : (
          <StarIconOutline key={star} className={`${size} text-gray-300`} />
        )
      ))}
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  const date = new Date(review.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="rounded-xl border border-brand/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light/30 font-semibold text-brand">
              {review.customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-brand-dark">{review.customerName}</p>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size="h-4 w-4" />
                <span className="text-xs text-brand-dark/60">{formattedDate}</span>
              </div>
            </div>
          </div>
          {review.verifiedPurchase && (
            <span className="ml-14 mt-1 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
              ✓ Verified Purchase
            </span>
          )}
        </div>
      </div>
      <p className="mt-4 text-brand-dark/80">{review.comment}</p>
    </div>
  );
};

export const ReviewDisplay = ({ reviews, averageRating, totalReviews, ratingDistribution }: ReviewDisplayProps) => {
  if (totalReviews === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl text-brand-dark">Customer Reviews</h2>
        <div className="mt-8 rounded-xl border border-brand/10 bg-white p-12 text-center">
          <p className="text-brand-dark/60">No reviews yet. Be the first to review this product!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-display text-3xl text-brand-dark">Customer Reviews</h2>

      {/* Rating Summary */}
      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="rounded-xl border border-brand/10 bg-white p-6 text-center shadow-sm">
            <div className="text-5xl font-bold text-brand-dark">{averageRating.toFixed(1)}</div>
            <StarRating rating={Math.round(averageRating)} />
            <p className="mt-2 text-sm text-brand-dark/60">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-brand-dark">{rating}</span>
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-brand-dark/60">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="mt-12 space-y-6">
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>
    </section>
  );
};

