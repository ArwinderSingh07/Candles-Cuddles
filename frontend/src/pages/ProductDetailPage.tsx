import { useParams } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import { useCartStore } from '../store/cart';
import { formatINR } from '../lib/currency';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const addItem = useCartStore((state) => state.addItem);

  if (isLoading) return <p className="px-6 py-16 text-brand-dark/70">Loading product...</p>;
  if (!product) return <p className="px-6 py-16 text-brand-dark/70">Product unavailable.</p>;

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
      <div
        className="h-[480px] rounded-3xl bg-cover bg-center shadow-lg"
        style={{ backgroundImage: `url(${product.images?.[0] ?? '/design/product_page.jpg'})` }}
        role="img"
        aria-label={product.title}
      />
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">Scent story</p>
        <h1 className="font-display text-4xl text-brand-dark">{product.title}</h1>
        <p className="mt-4 text-lg text-brand-dark/80">{product.description}</p>
        <p className="mt-6 text-3xl font-bold text-brand">{formatINR(product.price)}</p>
        <button className="mt-8 rounded-full bg-brand px-6 py-3 font-semibold text-white" onClick={() => addItem(product)}>
          Add to cart
        </button>
        <div className="mt-10 grid gap-4 rounded-3xl bg-white p-6 shadow">
          <h3 className="font-semibold text-brand-dark">Includes</h3>
          <ul className="space-y-2 text-sm text-brand-dark/80">
            <li>• 200g candle (45 hr burn)</li>
            <li>• Brass wick trimmer &amp; matches</li>
            <li>• Complimentary handwritten card</li>
            <li>• Free insured shipping via Delhivery</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

