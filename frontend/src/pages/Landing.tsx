import { Hero } from '../components/Hero';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';

export const LandingPage = () => {
  const { data: products } = useProducts();
  return (
    <>
      <Hero />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/60">Best sellers</p>
            <h2 className="font-display text-3xl text-brand-dark">Curated edits</h2>
          </div>
          <p className="max-w-lg text-brand-dark/70">
            Each set includes vegan wax candles, wick trimmer, and handwritten card. Gift-ready in compostable packaging.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {products?.slice(0, 3).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          {[
            { title: 'Razorpay Secure', body: 'Server-side order creation, signature verification, and PCI compliant checkout.' },
            { title: 'Eco pours', body: 'Soy-coconut wax with FSC lids & dyes safe for indoor air quality.' },
            { title: 'Free delivery', body: 'Complimentary shipping pan-India on sets over ₹899.' },
          ].map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-brand/10 p-6">
              <h3 className="font-display text-2xl text-brand-dark">{feature.title}</h3>
              <p className="mt-3 text-sm text-brand-dark/70">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

