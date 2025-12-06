import { Link } from 'react-router-dom';
import { NewsletterSignup } from './NewsletterSignup';

export const Footer = () => (
  <footer className="border-t border-brand/10 bg-white">
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-8 md:grid-cols-5">
        {/* Brand */}
        <div>
          <h3 className="font-display text-xl text-brand-dark">Candles &amp; Cuddles</h3>
          <p className="mt-2 text-sm text-brand-dark/70">
            Handcrafted candles for cozy moments and meaningful rituals.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-brand-dark">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-dark/70">
            <li>
              <Link to="/shop" className="hover:text-brand transition">
                Shop
              </Link>
            </li>
            <li>
              <Link to="/custom-order" className="hover:text-brand transition">
                Custom Order
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-brand transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-brand transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-brand-dark">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-dark/70">
            <li>
              <Link to="/privacy" className="hover:text-brand transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-brand transition">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/refund" className="hover:text-brand transition">
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Social & Contact */}
        <div>
          <h4 className="font-semibold text-brand-dark">Connect</h4>
          <div className="mt-3 space-y-2 text-sm text-brand-dark/70">
            <a
              href="https://instagram.com/candlesandcuddles"
              target="_blank"
              rel="noreferrer"
              className="block hover:text-brand transition"
            >
              Instagram
            </a>
            <a
              href="mailto:info@candlesandcuddles.in"
              className="block hover:text-brand transition"
            >
              info@candlesandcuddles.in
            </a>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-semibold text-brand-dark">Newsletter</h4>
          <p className="mt-3 text-sm text-brand-dark/70">
            Get updates on new collections and exclusive offers.
          </p>
          <div className="mt-4">
            <NewsletterSignup variant="inline" />
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-brand/10 pt-6 text-center text-sm text-brand-dark/70">
        <p>© {new Date().getFullYear()} Candles &amp; Cuddles. Crafted with love in Raipur, Chhattisgarh.</p>
      </div>
    </div>
  </footer>
);

