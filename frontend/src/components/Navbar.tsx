import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useCartStore } from '../store/cart';

const links = [
  { to: '/shop', label: 'Shop' },
  { to: '/custom-order', label: 'Custom Order' },
  { to: '/profile', label: 'Profile' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
];

export const Navbar = () => {
  const toggleCart = useCartStore((state) => state.toggle);
  const items = useCartStore((state) => state.items);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="font-display text-2xl text-brand-dark" onClick={() => setMobileOpen(false)}>
          Candles &amp; Cuddles
        </NavLink>
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white transition"
            onClick={() => toggleCart(true)}
            aria-label={`Open cart with ${items.length} items`}
          >
            Cart
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs text-white">
              {items.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          </button>
          <button
            type="button"
            className="rounded-full border border-brand/60 px-3 py-2 text-sm font-semibold text-brand-dark hover:border-brand hover:text-brand transition"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium uppercase tracking-wide text-brand-dark/80 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'text-brand' : '')}>
              {link.label}
            </NavLink>
          ))}
          <button
            className="relative rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white transition"
            onClick={() => toggleCart(true)}
            aria-label={`Open cart with ${items.length} items`}
          >
            Cart
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs text-white">
              {items.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          </button>
        </nav>
      </div>
      {mobileOpen && (
        <div className="md:hidden">
          <nav className="mx-4 mb-4 space-y-2 rounded-2xl border border-brand/15 bg-white/95 p-4 text-sm font-medium uppercase tracking-wide text-brand-dark/90 shadow-lg">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2 ${isActive ? 'bg-brand-light/60 text-brand-dark' : 'hover:bg-brand-light/50'}`
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

