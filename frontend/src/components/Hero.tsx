import { NavLink } from 'react-router-dom';

export const Hero = () => (
  <section className="bg-gradient-to-r from-brand-light/60 to-white">
    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-2 md:items-center">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/70">Winter 24 • Limited pour</p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-brand-dark md:text-5xl">
          Candles designed for cozy rituals &amp; slow evenings.
        </h1>
        <p className="mt-6 text-lg text-brand-dark/80">
          Sustainably poured blends, bundled with curated add-ons for gifting under ₹999. Powered by secure Razorpay checkout.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <NavLink to="/shop" className="rounded-full bg-brand px-6 py-3 font-semibold text-white">
            Shop the grid
          </NavLink>
          <NavLink to="/custom-order" className="rounded-full border border-brand px-6 py-3 font-semibold text-brand">
            Design your set
          </NavLink>
        </div>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 rounded-2xl bg-[url('/design/landing.jpg')] bg-cover bg-center" />
          <div className="h-48 rounded-2xl bg-[url('/design/themesandseasons.jpg')] bg-cover bg-center" />
          <div className="col-span-2 h-56 rounded-2xl bg-[url('/design/use.jpg')] bg-cover bg-center" />
        </div>
      </div>
    </div>
  </section>
);

