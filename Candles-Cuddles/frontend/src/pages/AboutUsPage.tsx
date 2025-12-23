export const AboutUsPage = () => {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">Our Story</p>
        <h1 className="mt-2 font-display text-4xl text-brand-dark">About Candles & Cuddles</h1>
      </div>

      <div className="mt-12 space-y-8 text-brand-dark/80">
        <section>
          <h2 className="font-display text-2xl text-brand-dark">Our Mission</h2>
          <p className="mt-3">
            At Candles & Cuddles, we believe in creating moments of warmth, comfort, and connection. Our handcrafted candles are designed to transform ordinary spaces into cozy sanctuaries, perfect for slow evenings and meaningful rituals.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">Sustainable Craftsmanship</h2>
          <p className="mt-3">
            We're committed to sustainability and quality. Our candles are made with:
          </p>
          <ul className="mt-3 ml-6 list-disc space-y-2">
            <li><strong>Soy-coconut wax blend</strong> - Clean-burning and eco-friendly</li>
            <li><strong>FSC-certified lids</strong> - Responsibly sourced wood</li>
            <li><strong>Clean fragrance oils</strong> - Safe for indoor air quality</li>
            <li><strong>Compostable packaging</strong> - Minimizing our environmental footprint</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">Handcrafted with Love</h2>
          <p className="mt-3">
            Each candle is carefully poured by hand in our Raipur, Chhattisgarh studio. We take pride in the attention to detail that goes into every product, from the selection of scents to the final packaging. Every order includes a handwritten note, because we believe in the personal touch.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">Custom Creations</h2>
          <p className="mt-3">
            Beyond our curated collections, we offer custom candle services for special occasions, corporate gifting, and personal projects. Whether it's a wedding, anniversary, or brand collaboration, we work with you to create something truly unique.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">Our Values</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-brand/15 bg-white p-6">
              <h3 className="font-semibold text-brand-dark">Quality First</h3>
              <p className="mt-2 text-sm">We never compromise on the quality of our ingredients or craftsmanship.</p>
            </div>
            <div className="rounded-xl border border-brand/15 bg-white p-6">
              <h3 className="font-semibold text-brand-dark">Sustainability</h3>
              <p className="mt-2 text-sm">We're committed to eco-friendly practices and responsible sourcing.</p>
            </div>
            <div className="rounded-xl border border-brand/15 bg-white p-6">
              <h3 className="font-semibold text-brand-dark">Customer Care</h3>
              <p className="mt-2 text-sm">Your satisfaction is our priority. We're here to help every step of the way.</p>
            </div>
            <div className="rounded-xl border border-brand/15 bg-white p-6">
              <h3 className="font-semibold text-brand-dark">Community</h3>
              <p className="mt-2 text-sm">We believe in building connections and supporting our local community.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-brand/15 bg-gradient-to-br from-brand-light/20 to-white p-8 text-center">
          <h2 className="font-display text-2xl text-brand-dark">Get in Touch</h2>
          <p className="mt-3">
            Have questions or want to collaborate? We'd love to hear from you.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/contact"
              className="rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
            >
              Contact Us
            </a>
            <a
              href="/custom-order"
              className="rounded-full border border-brand px-6 py-3 font-semibold text-brand transition hover:bg-brand-light/20"
            >
              Start Custom Order
            </a>
          </div>
        </section>
      </div>
    </section>
  );
};

