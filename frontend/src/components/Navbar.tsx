import { NavLink } from 'react-router-dom';
import { useCartStore } from '../store/cart';

const links = [
  { to: '/shop', label: 'Shop' },
  { to: '/custom-order', label: 'Custom Order' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
];

export const Navbar = () => {
  const toggleCart = useCartStore((state) => state.toggle);
  const items = useCartStore((state) => state.items);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-brand/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="font-display text-2xl text-brand-dark">
          Candles &amp; Cuddles
        </NavLink>
        <nav className="hidden gap-8 md:flex text-sm font-medium uppercase tracking-wide text-brand-dark/80">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'text-brand' : '')}>
              {link.label}
            </NavLink>
          ))}
        </nav>
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
      </div>
    </header>
  );
};

