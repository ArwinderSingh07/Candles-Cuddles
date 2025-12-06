import { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { ProductSearch } from '../components/ProductSearch';
import { ProductFilters } from '../components/ProductFilters';
import { ProductCardSkeleton } from '../components/LoadingSkeleton';
import { FunnelIcon, XMarkIcon, Squares2X2Icon, Bars3Icon } from '@heroicons/react/24/outline';
import type { Product } from '../types';

export const ShopPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy as 'newest' | 'price-low' | 'price-high' | 'name',
    }),
    [searchQuery, selectedCategory, minPrice, maxPrice, sortBy],
  );

  const { data: products, isLoading } = useProducts(filters);

  // Extract unique categories from products
  const categories = useMemo(() => {
    if (!products) return [];
    const cats = products
      .map((p: Product) => p.category)
      .filter((cat): cat is string => Boolean(cat));
    return Array.from(new Set(cats)).sort();
  }, [products]);

  const handlePriceChange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || selectedCategory || minPrice || maxPrice || sortBy !== 'newest';

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCategory) count++;
    if (minPrice || maxPrice) count++;
    if (sortBy !== 'newest') count++;
    return count;
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy]);

  return (
    <section className="relative min-h-[calc(100vh-120px)] bg-gradient-to-b from-brand-light/40 to-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(198,93,123,0.08),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(198,93,123,0.06),transparent_30%)]" />
      
      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/70">Shop all</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-brand-dark md:text-5xl">
            All scents
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-dark/80">
            Discover our curated collection of hand-poured candles, each crafted with care and premium ingredients.
          </p>
      </div>

        {/* Search Bar */}
        <div className="mb-6">
            <ProductSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          </div>

        {/* Filters and Controls */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl border border-brand/20 bg-white px-4 py-2.5 text-sm font-semibold text-brand-dark transition hover:bg-brand-light/20 md:w-auto"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Results Count and View Toggle */}
          <div className="flex items-center justify-between gap-4">
            {!isLoading && products && (
              <p className="text-sm text-brand-dark/70">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-brand/20 bg-white p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2 transition ${
                  viewMode === 'grid'
                    ? 'bg-brand text-white'
                    : 'text-brand-dark/60 hover:bg-brand-light/20'
                }`}
                aria-label="Grid view"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-2 transition ${
                  viewMode === 'list'
                    ? 'bg-brand text-white'
                    : 'text-brand-dark/60 hover:bg-brand-light/20'
                }`}
                aria-label="List view"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-brand-dark">Active filters:</span>
            {searchQuery && (
              <span className="flex items-center gap-1 rounded-full border border-brand/20 bg-brand-light/30 px-3 py-1 text-sm text-brand-dark">
                Search: &quot;{searchQuery}&quot;
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-brand"
                  aria-label="Remove search filter"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="flex items-center gap-1 rounded-full border border-brand/20 bg-brand-light/30 px-3 py-1 text-sm text-brand-dark">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-1 hover:text-brand"
                  aria-label="Remove category filter"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="flex items-center gap-1 rounded-full border border-brand/20 bg-brand-light/30 px-3 py-1 text-sm text-brand-dark">
                ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
                <button
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                  className="ml-1 hover:text-brand"
                  aria-label="Remove price filter"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            )}
            {sortBy !== 'newest' && (
              <span className="flex items-center gap-1 rounded-full border border-brand/20 bg-brand-light/30 px-3 py-1 text-sm text-brand-dark">
                {sortBy === 'price-low' && 'Price: Low to High'}
                {sortBy === 'price-high' && 'Price: High to Low'}
                {sortBy === 'name' && 'Name: A to Z'}
                <button
                  onClick={() => setSortBy('newest')}
                  className="ml-1 hover:text-brand"
                  aria-label="Reset sort"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            )}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="rounded-full border border-brand/20 bg-white px-3 py-1 text-sm font-medium text-brand-dark transition hover:bg-brand-light/20"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 animate-slide-down">
          <ProductFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={handlePriceChange}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          </div>
        )}

        {/* Loading State */}
      {isLoading && (
          <div className={`mt-8 grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

        {/* Empty State */}
      {!isLoading && products && products.length === 0 && (
          <div className="mt-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-light/20">
              <FunnelIcon className="h-12 w-12 text-brand/60" />
          </div>
            <h3 className="mb-2 font-display text-2xl text-brand-dark">No products found</h3>
            <p className="mb-6 text-brand-dark/70">
              {hasActiveFilters
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Check back soon for new arrivals!'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="rounded-full border border-brand bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
              >
                Clear all filters
              </button>
            )}
        </div>
      )}

        {/* Products Grid */}
      {!isLoading && products && products.length > 0 && (
          <div
            className={`mt-8 grid gap-6 ${
              viewMode === 'grid'
                ? 'md:grid-cols-2 lg:grid-cols-3'
                : 'md:grid-cols-1'
            }`}
          >
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
      </div>
    </section>
  );
};

