export const ContactPage = () => (
  <section className="min-h-[calc(100vh-120px)] bg-[#fdf4ee] px-4 py-16">
    <div className="mx-auto flex max-w-5xl flex-col gap-10 rounded-[32px] bg-white/80 p-8 shadow-lg ring-1 ring-[#f0d8c7] lg:flex-row lg:items-center lg:gap-16 lg:p-12">
      <div className="flex-1 space-y-4 text-center lg:text-left">
        <p className="text-sm uppercase tracking-[0.3em] text-[#b48b76]">Let&apos;s Connect</p>
        <h1 className="font-display text-4xl text-[#5a2d22]">We&apos;d love to hear from you</h1>
        <p className="text-[#7c4f3d]">
          Share a custom brief, ask about candle care, or just say hello. We reply within one business day.
        </p>
        <div
          className="mx-auto h-48 w-full max-w-xs rounded-[28px] bg-[url('/design/connect.png')] bg-cover bg-center shadow-inner lg:mx-0"
          aria-hidden="true"
        />
      </div>

      <form className="flex-1 space-y-4 rounded-[28px] bg-white/90 p-6 shadow-inner ring-1 ring-[#f1e2d8]">
        <div>
          <label className="text-sm font-medium text-[#7c4f3d]" htmlFor="name">
            Your Name
          </label>
          <input
            id="name"
            className="mt-1 w-full rounded-2xl border border-[#f2d9c6] bg-[#fffaf6] px-4 py-3 text-[#5a2d22] placeholder:text-[#c8a595] focus:border-[#c47c62] focus:outline-none"
            placeholder="Aanya Kapoor"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#7c4f3d]" htmlFor="email">
            Your Email
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 w-full rounded-2xl border border-[#f2d9c6] bg-[#fffaf6] px-4 py-3 text-[#5a2d22] placeholder:text-[#c8a595] focus:border-[#c47c62] focus:outline-none"
            placeholder="you@candlesandcuddles.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#7c4f3d]" htmlFor="phone">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            className="mt-1 w-full rounded-2xl border border-[#f2d9c6] bg-[#fffaf6] px-4 py-3 text-[#5a2d22] placeholder:text-[#c8a595] focus:border-[#c47c62] focus:outline-none"
            placeholder="+91 98765 43210"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#7c4f3d]" htmlFor="message">
            Your Message
          </label>
          <textarea
            id="message"
            rows={4}
            className="mt-1 w-full rounded-2xl border border-[#f2d9c6] bg-[#fffaf6] px-4 py-3 text-[#5a2d22] placeholder:text-[#c8a595] focus:border-[#c47c62] focus:outline-none"
            placeholder="Tell us about your dream pairing..."
          />
        </div>
        <button
          type="button"
          className="w-full rounded-full bg-[#7b2f2f] py-3 font-semibold text-white transition hover:bg-[#672525]"
        >
          Send Message
        </button>
        <div className="space-y-1 text-center text-sm text-[#7c4f3d] lg:text-left">
          <p>Email: contact@candlesandcuddles.com</p>
          <p>Business Hours: Mon–Fri, 9am–5pm EST</p>
        </div>
      </form>
    </div>

    <div className="mt-12 text-center text-sm text-[#a67a65]">
      <p>We&apos;re also on</p>
      <div className="mt-3 flex justify-center gap-4 text-lg">
        <span>Instagram</span>
        <span>Facebook</span>
        <span>Pinterest</span>
        <span>YouTube</span>
      </div>
    </div>
  </section>
);

