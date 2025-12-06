import { Hero } from '../components/Hero';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/LoadingSkeleton';
import { NewsletterSignup } from '../components/NewsletterSignup';
import { Testimonials } from '../components/Testimonials';
import { TrustBadges } from '../components/TrustBadges';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  const { data: products } = useProducts();
  return (
    <>
      <Hero />
      {/* Scent Finder CTA */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="group relative overflow-hidden rounded-3xl border-2 border-brand/20 bg-gradient-to-br from-brand-light/30 via-white to-brand-light/10 p-10 text-center shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-brand blur-2xl animate-pulse"></div>
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-brand-dark blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-4xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12">
              🔍
            </div>
            <h2 className="font-display text-3xl text-brand-dark mb-2">Not sure which scent to choose?</h2>
            <p className="mt-2 text-lg text-brand-dark/70 mb-6">
              Take our fun, interactive quiz and discover your perfect candle match in under 2 minutes!
            </p>
            <Link
              to="/scent-finder"
              className="group/btn inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-dark px-8 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              <span>Find My Perfect Scent</span>
              <span className="transition-transform group-hover/btn:translate-x-1">→</span>
            </Link>
            <p className="mt-4 text-xs text-brand-dark/50">
              ✨ 5 quick questions • Personalized recommendations • 100% free
            </p>
          </div>
        </div>
      </section>

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
          {products ? (
            products.slice(0, 3).map((product) => <ProductCard key={product._id} product={product} />)
          ) : (
            Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)
          )}
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">Why Choose Us</p>
            <h2 className="mt-2 font-display text-3xl text-brand-dark">Trusted by Thousands</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3 mb-12">
            {[
              { title: 'Razorpay Secure', body: 'Server-side order creation, signature verification, and PCI compliant checkout.', icon: '🔒' },
              { title: 'Eco pours', body: 'Soy-coconut wax with FSC lids & dyes safe for indoor air quality.', icon: '🌱' },
              { title: 'Free delivery', body: 'Complimentary shipping pan-India on sets over ₹899.', icon: '📦' },
            ].map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-brand/10 bg-gradient-to-br from-white to-brand-light/10 p-6 transition hover:shadow-md">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-display text-2xl text-brand-dark">{feature.title}</h3>
                <p className="mt-3 text-sm text-brand-dark/70">{feature.body}</p>
              </div>
            ))}
          </div>
          <TrustBadges />
        </div>
      </section>
      <Testimonials />
      <section className="bg-gradient-to-b from-brand-light/30 to-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <NewsletterSignup variant="card" />
        </div>
      </section>
    </>
  );
};

