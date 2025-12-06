export const SpotlightCustomPage = () => (
  <section className="bg-gradient-to-b from-brand-light/30 to-white px-6 py-16">
    <div className="mx-auto max-w-5xl space-y-6 rounded-3xl bg-white/80 p-8 shadow-xl ring-1 ring-brand-light">
      <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/70">Spotlight · Custom briefs</p>
      <h1 className="font-display text-4xl text-brand-dark">Personalise scents, colors, and labels</h1>
      <p className="text-lg text-brand-dark/80">
        Dummy content for the second hero slide. Describe how you handle bespoke orders, timelines, and constraints. You can
        replace this with real copy once ready.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {['/design/product-candle-4.png', '/design/product-candle-5.png', '/design/product-candle-6.png'].map((img) => (
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
