export const RefundPolicyPage = () => {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl text-brand-dark">Refund & Return Policy</h1>
      <p className="mt-2 text-sm text-brand-dark/70">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="mt-8 space-y-6 text-brand-dark/80">
        <section>
          <h2 className="font-display text-2xl text-brand-dark">1. Returns</h2>
          <p className="mt-2">
            We accept returns within 7 days of delivery for unused, unopened products in their original packaging. Custom orders and personalized items are not eligible for return unless defective.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">2. Refunds</h2>
          <p className="mt-2">
            Once we receive and inspect your return, we will process your refund within 5-7 business days. Refunds will be issued to the original payment method. Shipping costs are non-refundable unless the item is defective or incorrect.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">3. Defective Products</h2>
          <p className="mt-2">
            If you receive a defective or damaged product, please contact us within 48 hours of delivery. We will arrange a replacement or full refund, including return shipping costs.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">4. Return Process</h2>
          <p className="mt-2">To initiate a return:</p>
          <ol className="mt-2 ml-6 list-decimal space-y-1">
            <li>Contact us at <a href="mailto:info@candlesandcuddles.in" className="text-brand hover:underline">info@candlesandcuddles.in</a> with your order number</li>
            <li>We will provide return instructions and a return authorization</li>
            <li>Ship the item back to us using the provided address</li>
            <li>Once received, we will process your refund</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">5. Cancellations</h2>
          <p className="mt-2">
            Orders can be cancelled within 24 hours of placement if they have not yet been processed. Once an order is in production or shipped, it cannot be cancelled.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">6. Contact Us</h2>
          <p className="mt-2">
            For return or refund inquiries, contact us at{' '}
            <a href="mailto:info@candlesandcuddles.in" className="text-brand hover:underline">
              info@candlesandcuddles.in
            </a>
          </p>
        </section>
      </div>
    </section>
  );
};

