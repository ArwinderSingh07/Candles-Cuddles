import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const slides = [
  {
    eyebrow: 'Winter 24 · Limited pour',
    title: 'Candles designed for cozy rituals & slow evenings.',
    body: 'Sustainably poured blends, bundled with curated add-ons for gifting under ₹1,999. Powered by secure Razorpay checkout.',
    primary: { label: 'Learn more', to: '/spotlight/winter' },
    secondary: { label: 'Shop the grid', to: '/shop' },
    images: ['/design/landing.jpg', '/design/themesandseasons.jpg', '/design/use.jpg'],
  },
  {
    eyebrow: 'Custom briefs welcome',
    title: 'Personalise scents, colors, and labels for your occasion.',
    body: 'Upload inspiration, pick your palette, and we’ll pour a limited run just for you. Perfect for weddings, gifting, or brand drops.',
    primary: { label: 'Learn more', to: '/spotlight/custom' },
    secondary: { label: 'Start a custom brief', to: '/custom-order' },
    images: ['/design/designyourown.jpg', '/design/landing2.jpg', '/design/product_page.jpg'],
  },
  {
    eyebrow: 'Gift-ready sets',
    title: 'Curated bundles with eco packaging & handwritten notes.',
    body: 'Choose from our best sellers with FSC lids, soy-coconut wax, and clean fragrance oils. Complimentary shipping pan-India.',
    primary: { label: 'Learn more', to: '/spotlight/gifts' },
    secondary: { label: 'View best sellers', to: '/shop' },
    images: ['/design/Q&A.jpg', '/design/connect.png', '/design/use.jpg'],
  },
];

export const Hero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(id);
  }, []);

  const slide = slides[index];

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-brand-light/60 to-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(198,93,123,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(198,93,123,0.1),transparent_30%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/70">{slide.eyebrow}</p>
            <h1 className="font-display text-4xl leading-tight text-brand-dark md:text-5xl">{slide.title}</h1>
            <p className="text-lg text-brand-dark/80">{slide.body}</p>
            <div className="flex flex-wrap gap-4">
              <NavLink to={slide.primary.to} className="rounded-full bg-brand px-6 py-3 font-semibold text-white">
                {slide.primary.label}
              </NavLink>
              <NavLink to={slide.secondary.to} className="rounded-full border border-brand px-6 py-3 font-semibold text-brand">
                {slide.secondary.label}
              </NavLink>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
                className="rounded-full border border-brand/40 px-3 py-2 text-brand-dark hover:border-brand hover:text-brand-dark transition"
                aria-label="Previous hero slide"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setIndex((index + 1) % slides.length)}
                className="rounded-full border border-brand/40 px-3 py-2 text-brand-dark hover:border-brand hover:text-brand-dark transition"
                aria-label="Next hero slide"
              >
                ›
              </button>
              <div className="flex gap-2" aria-label="Hero slide indicators">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      i === index ? 'bg-brand shadow-brand/50 shadow-sm' : 'bg-brand-light'
                    }`}
                    aria-pressed={i === index}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-white/80 p-6 shadow-2xl ring-1 ring-brand-light/60">
            <div className="grid grid-cols-2 gap-4">
              {slide.images.map((img, i) => (
                <div
                  key={img}
                  className={`rounded-2xl bg-cover bg-center transition duration-700 ${
                    i === 2 ? 'col-span-2 h-56' : 'h-48'
                  }`}
                  style={{ backgroundImage: `url(${img})` }}
                  aria-label="Collection preview"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
