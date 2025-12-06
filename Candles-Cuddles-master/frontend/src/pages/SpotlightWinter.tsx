export const SpotlightWinterPage = () => (
  <section className="bg-gradient-to-b from-brand-light/30 to-white px-6 py-16">
    <div className="mx-auto max-w-5xl space-y-6 rounded-3xl bg-white/80 p-8 shadow-xl ring-1 ring-brand-light">
      <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/70">Spotlight · Winter 24</p>
      <h1 className="font-display text-4xl text-brand-dark">Limited pours for cozy rituals</h1>
      <p className="text-lg text-brand-dark/80">
        This dummy page mirrors the first hero slide. Swap in collection details, drop imagery, and add a CTA when you are
        ready. For now it simply proves the slider links are wired up.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {['/design/product-candle-1.png', '/design/product-candle-2.png', '/design/product-candle-3.png'].map((img) => (
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
