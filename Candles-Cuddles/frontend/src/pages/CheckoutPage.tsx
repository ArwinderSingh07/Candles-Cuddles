import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCartStore } from '../store/cart';
import { formatINR } from '../lib/currency';
import { useCheckout } from '../hooks/useCheckout';
import { TrustBadges } from '../components/TrustBadges';

interface CheckoutForm {
  name: string;
  email: string;
  phone?: string;
}

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const { checkout, status, error, orderId } = useCheckout();
  const { register, handleSubmit } = useForm<CheckoutForm>();

  const onSubmit = (values: CheckoutForm) => checkout(values);

  // Redirect to order confirmation on success
  useEffect(() => {
    if (status === 'success' && orderId) {
      const timer = setTimeout(() => {
        navigate(`/order-confirmation/${orderId}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, orderId, navigate]);

  return (
    <section className="mx-auto max-w-5xl gap-10 px-6 py-16 md:grid md:grid-cols-[2fr,1fr]">
      <div>
        <h1 className="font-display text-3xl text-brand-dark">Checkout</h1>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="checkout-name" className="text-sm font-semibold text-brand-dark">
              Full name
            </label>
            <input
              id="checkout-name"
              className="mt-2 w-full rounded-2xl border border-brand/20 bg-white px-4 py-3 text-gray-700 placeholder:text-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              {...register('name', { required: true })}
            />
          </div>
          <div>
            <label htmlFor="checkout-email" className="text-sm font-semibold text-brand-dark">
              Email
            </label>
            <input
              id="checkout-email"
              type="email"
              className="mt-2 w-full rounded-2xl border border-brand/20 bg-white px-4 py-3 text-gray-700 placeholder:text-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              {...register('email', { required: true })}
            />
          </div>
          <div>
            <label htmlFor="checkout-phone" className="text-sm font-semibold text-brand-dark">
              Phone
            </label>
            <input
              id="checkout-phone"
              className="mt-2 w-full rounded-2xl border border-brand/20 bg-white px-4 py-3 text-gray-700 placeholder:text-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              {...register('phone')}
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-brand px-6 py-3 font-semibold text-white disabled:opacity-60"
            disabled={status === 'loading' || !items.length}
          >
            {status === 'loading' ? 'Opening Razorpay...' : 'Pay with Razorpay'}
          </button>
        </form>
        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {status === 'success' && (
          <div className="mt-4 animate-slide-down rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <p className="font-semibold">Payment successful!</p>
            <p className="mt-1">Redirecting to order confirmation...</p>
          </div>
        )}
      </div>
      <aside className="mt-12 rounded-3xl bg-white p-6 shadow md:mt-0">
        <h2 className="text-lg font-semibold text-brand-dark">Summary</h2>
        <ul className="mt-4 space-y-3 text-sm text-brand-dark/80">
          {items.map((item) => (
            <li key={item.product._id} className="flex justify-between">
              <span>
                {item.product.title} × {item.qty}
              </span>
              <span>{formatINR(item.product.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-between border-t border-brand/10 pt-4 text-brand-dark">
          <span className="text-sm uppercase tracking-wide">Total</span>
          <span className="text-2xl font-bold">{formatINR(total())}</span>
        </div>
        <div className="mt-6 space-y-4">
          <TrustBadges />
          <p className="text-xs text-brand-dark/60">
            Payments are processed via Razorpay with server-side signature verification for security.
          </p>
        </div>
      </aside>
    </section>
  );
};

