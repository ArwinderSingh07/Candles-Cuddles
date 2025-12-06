import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { getRecentReviews, type Review } from '../api/reviews';

interface Testimonial {
  name: string;
  location?: string;
  rating: number;
  text: string;
  image: string;
  verifiedPurchase?: boolean;
  date?: string;
}

// Helper to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Transform review to testimonial format
const transformReview = (review: Review): Testimonial => {
  return {
    name: review.customerName,
    location: '', // We don't store location in reviews
    rating: review.rating,
    text: review.comment,
    image: getInitials(review.customerName),
    verifiedPurchase: review.verifiedPurchase,
    date: review.createdAt,
  };
};

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['recent-reviews'],
    queryFn: () => getRecentReviews(10),
  });

  // Transform reviews to testimonials format
  const testimonials: Testimonial[] = reviews && reviews.length > 0
    ? reviews.map(transformReview)
    : [];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Don't show section if no reviews exist
  if (!isLoading && testimonials.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="bg-gradient-to-b from-white to-brand-light/20 px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">What Our Customers Say</p>
          <h2 className="mt-2 font-display text-3xl text-brand-dark">Loved by Many</h2>
          <div className="mt-12 flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-white to-brand-light/20 px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">What Our Customers Say</p>
        <h2 className="mt-2 font-display text-3xl text-brand-dark">Loved by Many</h2>

        <div className="relative mt-12">
          {/* Testimonial Card */}
          <div className="rounded-3xl border border-brand/15 bg-white p-8 shadow-lg md:p-12">
            {/* Avatar/Initials */}
            <div className="mb-6 flex items-center justify-center">
              {typeof currentTestimonial.image === 'string' && currentTestimonial.image.length <= 2 ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-light/30 to-brand text-2xl font-semibold text-white shadow-md">
                  {currentTestimonial.image}
                </div>
              ) : (
                <div className="text-6xl">{currentTestimonial.image}</div>
              )}
            </div>
            
            {/* Rating */}
            <div className="mb-4 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) =>
                star <= currentTestimonial.rating ? (
                  <StarIcon key={star} className="h-5 w-5 text-yellow-400" />
                ) : (
                  <StarIconOutline key={star} className="h-5 w-5 text-gray-300" />
                )
              )}
            </div>
            
            {/* Review Text */}
            <blockquote className="mb-6 text-lg italic text-brand-dark/80">
              "{currentTestimonial.text}"
            </blockquote>
            
            {/* Customer Info */}
            <div>
              <div className="flex items-center justify-center gap-2">
                <p className="font-semibold text-brand-dark">{currentTestimonial.name}</p>
                {currentTestimonial.verifiedPurchase && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    ✓ Verified Purchase
                  </span>
                )}
              </div>
              {currentTestimonial.location && (
                <p className="text-sm text-brand-dark/60">{currentTestimonial.location}</p>
              )}
              {currentTestimonial.date && (
                <p className="mt-1 text-xs text-brand-dark/50">
                  {new Date(currentTestimonial.date).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="rounded-full border border-brand/20 p-2 text-brand-dark transition hover:bg-brand hover:text-white"
              aria-label="Previous testimonial"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition ${
                    i === currentIndex ? 'w-8 bg-brand' : 'w-2 bg-brand-light'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="rounded-full border border-brand/20 p-2 text-brand-dark transition hover:bg-brand hover:text-white"
              aria-label="Next testimonial"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

