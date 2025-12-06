import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import type { Product } from '../types';
import { formatINR } from '../lib/currency';
import { useCartStore } from '../store/cart';
import { useWishlistStore } from '../store/wishlist';
import { ProductBadge } from './ProductBadge';
import { useProductReviews } from '../hooks/useReviews';

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { data: reviewsData } = useProductReviews(product._id);
  const isNew = new Date(product.createdAt || Date.now()).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;
  const stock = product.stock ?? 0;
  const isOutOfStock = stock === 0;
  const inWishlist = isInWishlist(product._id);

  return (
    <div className="group relative flex flex-col rounded-3xl bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      {/* Image Container */}
      <Link to={`/product/${product._id}`} className="relative block overflow-hidden rounded-2xl">
        <div
          className="h-56 w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${product.images?.[0] ?? '/design/product-candle-1.png'})` }}
        />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {isNew && <ProductBadge type="new" />}
          {product.category === 'Bestseller' && <ProductBadge type="bestseller" />}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleItem(product._id);
          }}
          className={`absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-md transition-all ${
            inWishlist ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } hover:bg-white`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {inWishlist ? (
            <HeartIconSolid className="h-5 w-5 text-brand" />
          ) : (
            <HeartIcon className="h-5 w-5 text-brand-dark" />
          )}
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-dark">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="mt-4 flex flex-1 flex-col">
        {product.category && (
          <p className="text-xs uppercase tracking-[0.2em] text-brand-dark/60">{product.category}</p>
        )}
        <Link to={`/product/${product._id}`}>
          <h3 className="mt-1 font-display text-xl text-brand-dark transition hover:text-brand">
            {product.title}
          </h3>
        </Link>
        
        {/* Rating */}
        {reviewsData && reviewsData.totalReviews > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) =>
                star <= Math.round(reviewsData.averageRating) ? (
                  <StarIcon key={star} className="h-4 w-4 text-yellow-400" />
                ) : (
                  <StarIconOutline key={star} className="h-4 w-4 text-gray-300" />
                )
              )}
            </div>
            <span className="text-xs font-medium text-brand-dark">
              {reviewsData.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-brand-dark/60">
              ({reviewsData.totalReviews})
            </span>
          </div>
        )}
        
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-brand-dark/70">{product.description}</p>
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-brand/20 bg-brand-light/10 px-2 py-0.5 text-xs text-brand-dark/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-brand-dark">{formatINR(product.price)}</span>
          <div className="flex gap-2">
            <button
              className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white disabled:opacity-40"
              onClick={() => addItem(product)}
              disabled={isOutOfStock}
            >
              Add
            </button>
            <Link
              to={`/product/${product._id}`}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

