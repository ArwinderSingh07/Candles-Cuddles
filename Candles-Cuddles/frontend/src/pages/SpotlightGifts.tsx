export const SpotlightGiftsPage = () => (
  <section className="bg-gradient-to-b from-brand-light/30 to-white px-6 py-16">
    <div className="mx-auto max-w-5xl space-y-6 rounded-3xl bg-white/80 p-8 shadow-xl ring-1 ring-brand-light">
      <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/70">Spotlight · Gift-ready sets</p>
      <h1 className="font-display text-4xl text-brand-dark">Bundles with eco packaging & handwritten notes</h1>
      <p className="text-lg text-brand-dark/80">
        Dummy copy for the third hero slide. Showcase bundles, pricing, delivery promises, or any seasonal promos here when
        you have them.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {['/design/product-candle-7.png', '/design/product-candle-8.png', '/design/connect.png'].map((img) => (
          <div
            key={img}
            className="h-48 rounded-2xl bg-cover bg-center ring-1 ring-brand-light/60"
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
      </div>
    </div>
  </section>
);
