export const PrivacyPolicyPage = () => {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl text-brand-dark">Privacy Policy</h1>
      <p className="mt-2 text-sm text-brand-dark/70">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      <div className="mt-8 space-y-6 text-brand-dark/80">
        <section>
          <h2 className="font-display text-2xl text-brand-dark">1. Information We Collect</h2>
          <p className="mt-2">
            We collect information that you provide directly to us, including when you create an account, place an order, or contact us. This may include:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Name, email address, phone number</li>
            <li>Shipping and billing addresses</li>
            <li>Payment information (processed securely through Razorpay)</li>
            <li>Order history and preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">2. How We Use Your Information</h2>
          <p className="mt-2">
            We use the information we collect to:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your orders and our products</li>
            <li>Send you marketing communications (with your consent)</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">3. Data Security</h2>
          <p className="mt-2">
            We implement appropriate technical and organizational measures to protect your personal information. Payment information is processed securely through Razorpay and is not stored on our servers.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">4. Your Rights</h2>
          <p className="mt-2">
            You have the right to:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-brand-dark">5. Contact Us</h2>
          <p className="mt-2">
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:info@candlesandcuddles.in" className="text-brand hover:underline">
              info@candlesandcuddles.in
            </a>
          </p>
        </section>
      </div>
    </section>
  );
};

