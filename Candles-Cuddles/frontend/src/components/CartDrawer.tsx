import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cart';
import { formatINR } from '../lib/currency';

export const CartDrawer = () => {
  const { isOpen, toggle, items, updateQty, removeItem, total } = useCartStore();

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => toggle(false)}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md transform bg-white shadow-xl transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-brand-dark">Your Cart</h2>
          <button onClick={() => toggle(false)} className="text-sm text-brand">
            Close
          </button>
        </div>
        <div className="flex h-[calc(100%-160px)] flex-col gap-4 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-brand-dark/70">Add a candle to begin checkout.</p>
          ) : (
            items.map((item) => (
              <div key={item.product._id} className="flex items-start gap-4 border-b pb-4">
                <div
                  className="h-16 w-16 flex-shrink-0 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.product.images?.[0] ?? '/design/product-candle-1.png'})` }}
                />
                <div className="flex-1">
                  <p className="font-medium text-brand-dark">{item.product.title}</p>
                  <p className="text-sm text-brand-dark/70">{formatINR(item.product.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-xs uppercase text-brand-dark/60">Qty</label>
                    <input
                      type="number"
                      min={1}
                      max={item.product.stock ?? 99}
                      value={item.qty}
                      onChange={(e) => updateQty(item.product._id, Number(e.target.value))}
                      className="w-16 rounded-lg border border-brand/20 bg-white px-2 py-1 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                </div>
                <button
                  className="text-xs font-semibold text-red-600 hover:text-red-700 transition"
                  onClick={() => removeItem(item.product._id)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        <div className="border-t px-6 py-4">
          <div className="flex items-center justify-between text-brand-dark">
            <p className="text-sm uppercase tracking-wide">Subtotal</p>
            <p className="text-lg font-semibold">{formatINR(total())}</p>
          </div>
          <Link
            to="/checkout"
            onClick={() => toggle(false)}
            className="mt-4 block rounded-full bg-brand px-4 py-3 text-center text-white font-semibold"
          >
            Go to checkout
          </Link>
        </div>
      </aside>
    </div>
  );
};

