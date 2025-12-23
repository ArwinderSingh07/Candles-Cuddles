import { FunnelIcon } from '@heroicons/react/24/outline';

interface ProductFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  minPrice: string;
  maxPrice: string;
  onPriceChange: (min: string, max: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const ProductFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  sortBy,
  onSortChange,
}: ProductFiltersProps) => {
  return (
    <div className="space-y-4 rounded-xl border border-brand/15 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <FunnelIcon className="h-5 w-5 text-brand" />
        <h3 className="font-semibold text-brand-dark">Filters</h3>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-dark">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price Filter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-brand-dark">Price Range</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            className="rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
            className="rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="mb-2 block text-sm font-medium text-brand-dark">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
};

