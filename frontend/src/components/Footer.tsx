export const Footer = () => (
  <footer className="border-t border-brand/10 bg-white">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-brand-dark/70 md:flex-row md:items-center md:justify-between">
      <p>© {new Date().getFullYear()} Candles &amp; Cuddles. Crafted with love in Bengaluru.</p>
      <div className="flex gap-6">
        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-brand">
          Instagram
        </a>
        <a href="mailto:hello@candlesandcuddles.com" className="hover:text-brand">
          hello@candlesandcuddles.com
        </a>
      </div>
    </div>
  </footer>
);

