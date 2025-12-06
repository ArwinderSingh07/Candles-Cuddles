import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useProductReviews } from '../hooks/useReviews';
import { useCartStore } from '../store/cart';
import { useWishlistStore } from '../store/wishlist';
import { useProductTracking } from '../hooks/useAnalytics';
import { formatINR } from '../lib/currency';
import { ProductImageGallery } from '../components/ProductImageGallery';
import { QuantitySelector } from '../components/QuantitySelector';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailSkeleton } from '../components/LoadingSkeleton';
import { ReviewDisplay } from '../components/ReviewDisplay';
import { ReviewForm } from '../components/ReviewForm';
import { ShareIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import type { Product } from '../types';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: allProducts } = useProducts();
  const { data: reviewsData, refetch: refetchReviews } = useProductReviews(id);
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Track product view
  useProductTracking(id || '');

  // Get related products (same category, exclude current)
  const relatedProducts = allProducts
    ?.filter((p: Product) => p._id !== id && (product?.category ? p.category === product.category : true))
    .slice(0, 3) || [];

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product) return <p className="px-6 py-16 text-brand-dark/70">Product unavailable.</p>;

  const isNew = new Date(product.createdAt || Date.now()).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days
  const stock = product.stock ?? 0;
  const maxQuantity = stock > 0 ? Math.min(stock, 99) : 99;
  const inWishlist = product ? isInWishlist(product._id) : false;

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
        {/* Image Gallery */}
        <ProductImageGallery images={product.images || []} title={product.title} />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">{product.category}</p>
            )}
            <div className="mt-2 flex items-center gap-3">
              <h1 className="font-display text-4xl text-brand-dark">{product.title}</h1>
              {isNew && (
                <span className="inline-flex items-center rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-bold text-white">
                  New
                </span>
              )}
            </div>
          </div>

          <p className="text-lg text-brand-dark/80">{product.description}</p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-brand/20 bg-brand-light/10 px-3 py-1 text-xs font-medium text-brand-dark"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-baseline gap-4">
            <p className="text-3xl font-bold text-brand">{formatINR(product.price)}</p>
            {stock > 0 && stock < 10 && (
              <span className="text-sm text-orange-600">Only {stock} left in stock!</span>
            )}
            {stock === 0 && <span className="text-sm text-red-600">Out of stock</span>}
          </div>

          {/* Average Rating */}
          {reviewsData && reviewsData.totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) =>
                  star <= Math.round(reviewsData.averageRating) ? (
                    <StarIcon key={star} className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <StarIconOutline key={star} className="h-5 w-5 text-gray-300" />
                  )
                )}
              </div>
              <span className="text-sm font-semibold text-brand-dark">
                {reviewsData.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-brand-dark/60">
                ({reviewsData.totalReviews} {reviewsData.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={maxQuantity}
              disabled={stock === 0}
            />
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleAddToCart}
                disabled={stock === 0 || addedToCart}
              >
                {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
              <button
                onClick={handleShare}
                className="rounded-full border border-brand/20 p-3 text-brand-dark transition hover:bg-brand-light/20"
                aria-label="Share product"
              >
                <ShareIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => product && toggleItem(product._id)}
                className={`rounded-full border p-3 transition ${
                  inWishlist
                    ? 'border-brand bg-brand-light/30 text-brand'
                    : 'border-brand/20 text-brand-dark hover:bg-brand-light/20'
                }`}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {inWishlist ? (
                  <HeartIconSolid className="h-5 w-5" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Includes Section */}
          <div className="rounded-3xl border border-brand/15 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-brand-dark">What's Included</h3>
            <ul className="mt-3 space-y-2 text-sm text-brand-dark/80">
              <li className="flex items-center gap-2">
                <span className="text-brand">✓</span>
                <span>200g candle (45 hr burn)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand">✓</span>
                <span>Brass wick trimmer &amp; matches</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand">✓</span>
                <span>Complimentary handwritten card</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand">✓</span>
                <span>Free insured shipping pan-India</span>
              </li>
            </ul>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 rounded-xl border border-brand/10 bg-white/50 p-4">
            <div className="text-center">
              <div className="text-2xl">🚚</div>
              <p className="mt-1 text-xs text-brand-dark/70">Free Shipping</p>
            </div>
            <div className="text-center">
              <div className="text-2xl">🔒</div>
              <p className="mt-1 text-xs text-brand-dark/70">Secure Payment</p>
            </div>
            <div className="text-center">
              <div className="text-2xl">↩️</div>
              <p className="mt-1 text-xs text-brand-dark/70">Easy Returns</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviewsData && (
        <>
          <ReviewDisplay
            reviews={reviewsData.reviews}
            averageRating={reviewsData.averageRating}
            totalReviews={reviewsData.totalReviews}
            ratingDistribution={reviewsData.ratingDistribution}
          />
          <ReviewForm
            productId={product._id}
            onReviewSubmitted={() => {
              refetchReviews();
            }}
          />
        </>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <h2 className="font-display text-3xl text-brand-dark">You May Also Like</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {relatedProducts.map((relatedProduct: Product) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </>
  );
};

