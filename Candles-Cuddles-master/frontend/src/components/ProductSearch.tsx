import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ProductSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ProductSearch = ({ searchQuery, onSearchChange }: ProductSearchProps) => {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-brand-dark/40" />
      </div>
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-xl border border-brand/20 bg-white py-3 pl-10 pr-10 text-gray-700 placeholder:text-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
      {searchQuery && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-dark/40 hover:text-brand-dark"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

