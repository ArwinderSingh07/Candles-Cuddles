interface ProductBadgeProps {
  type: 'new' | 'bestseller' | 'sale' | 'limited';
  className?: string;
}

export const ProductBadge = ({ type, className = '' }: ProductBadgeProps) => {
  const badges = {
    new: { label: 'New', color: 'bg-green-500' },
    bestseller: { label: 'Bestseller', color: 'bg-brand' },
    sale: { label: 'Sale', color: 'bg-red-500' },
    limited: { label: 'Limited', color: 'bg-purple-500' },
  };

  const badge = badges[type];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-sm ${badge.color} ${className}`}
    >
      {badge.label}
    </span>
  );
};

