import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatINR } from '../lib/currency';
import { useCartStore } from '../store/cart';

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const addItem = useCartStore((state) => state.addItem);
  return (
    <div className="flex flex-col rounded-3xl bg-white p-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition">
      <div
        className="h-56 w-full rounded-2xl bg-cover bg-center"
        style={{ backgroundImage: `url(${product.images?.[0] ?? '/design/product_page.jpg'})` }}
      />
      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">{product.slug}</p>
        <h3 className="mt-2 font-display text-2xl text-brand-dark">{product.title}</h3>
        <p className="mt-2 flex-1 text-sm text-brand-dark/70">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-brand-dark">{formatINR(product.price)}</span>
          <div className="flex gap-2">
            <button
              className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand"
              onClick={() => addItem(product)}
            >
              Add
            </button>
            <Link
              to={`/product/${product._id}`}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

