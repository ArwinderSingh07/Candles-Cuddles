export const TermsOfServicePage = () => {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl text-brand-dark">Terms of Service</h1>
      <p className="mt-2 text-sm text-brand-dark/70">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="mt-8 space-y-6 text-brand-dark/80">
        <section>
          <h2 className="font-display text-2xl text-brand-dark">1. Acceptance of Terms</h2>
          <p className="mt-2">
            By accessing and using the Candles & Cuddles website, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">2. Products and Pricing</h2>
          <p className="mt-2">
            We reserve the right to change product prices and availability at any time. All prices are in Indian Rupees (INR) unless otherwise stated. We strive to ensure accuracy but errors may occur.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">3. Orders and Payment</h2>
          <p className="mt-2">
            All orders are subject to acceptance and availability. Payment is processed securely through Razorpay. We reserve the right to refuse or cancel any order at our discretion.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">4. Shipping and Delivery</h2>
          <p className="mt-2">
            We ship pan-India. Delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery. We are not responsible for delays caused by shipping carriers.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">5. Intellectual Property</h2>
          <p className="mt-2">
            All content on this website, including text, images, logos, and designs, is the property of Candles & Cuddles and protected by copyright laws. You may not reproduce or distribute any content without our written permission.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">6. Limitation of Liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by law, Candles & Cuddles shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">7. Contact Us</h2>
          <p className="mt-2">
            For questions about these Terms, contact us at{' '}
            <a href="mailto:info@candlesandcuddles.in" className="text-brand hover:underline">
              info@candlesandcuddles.in
            </a>
          </p>
        </section>
      </div>
    </section>
  );
};

