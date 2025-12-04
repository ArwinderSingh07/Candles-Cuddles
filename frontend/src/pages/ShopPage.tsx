import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';

export const ShopPage = () => {
  const { data: products, isLoading } = useProducts();
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">Shop all</p>
          <h1 className="font-display text-4xl text-brand-dark">All scents</h1>
        </div>
      </div>
      {isLoading && <p className="mt-8 text-brand-dark/70">Loading curated sets...</p>}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {products?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

