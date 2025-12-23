import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <section className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center text-brand-dark">
    <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/60">404</p>
    <h1 className="font-display text-4xl">This candle went out</h1>
    <p className="max-w-md text-brand-dark/70">We couldn’t find the page you’re after. Let’s head back to the curated grid.</p>
    <Link to="/" className="rounded-full bg-brand px-6 py-3 font-semibold text-white">
      Back home
    </Link>
  </section>
);

