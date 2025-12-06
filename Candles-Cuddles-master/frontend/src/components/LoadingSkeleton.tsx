export const ProductCardSkeleton = () => (
  <div className="flex animate-pulse flex-col rounded-3xl bg-white p-4 shadow-sm">
    <div className="h-56 w-full rounded-2xl bg-gray-200" />
    <div className="mt-4 space-y-2">
      <div className="h-4 w-24 rounded bg-gray-200" />
      <div className="h-6 w-3/4 rounded bg-gray-200" />
      <div className="h-4 w-full rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
    </div>
    <div className="mt-4 flex items-center justify-between">
      <div className="h-6 w-20 rounded bg-gray-200" />
      <div className="flex gap-2">
        <div className="h-9 w-20 rounded-full bg-gray-200" />
        <div className="h-9 w-20 rounded-full bg-gray-200" />
      </div>
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="mx-auto grid max-w-6xl animate-pulse gap-12 px-6 py-16 md:grid-cols-2">
    <div className="h-[480px] rounded-3xl bg-gray-200" />
    <div className="space-y-6">
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="h-10 w-3/4 rounded bg-gray-200" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
      </div>
      <div className="h-8 w-32 rounded bg-gray-200" />
      <div className="h-12 w-40 rounded-full bg-gray-200" />
      <div className="h-48 rounded-3xl bg-gray-200" />
    </div>
  </div>
);

export const TextSkeleton = ({ lines = 3, className = '' }: { lines?: number; className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 animate-pulse rounded bg-gray-200 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
      />
    ))}
  </div>
);

