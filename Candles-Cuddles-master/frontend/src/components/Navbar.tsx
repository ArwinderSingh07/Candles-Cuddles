import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../store/cart';

const links = [
  { to: '/shop', label: 'Shop', icon: ShoppingBagIcon },
  { to: '/scent-finder', label: 'Scent Finder', icon: QuestionMarkCircleIcon },
  { to: '/custom-order', label: 'Custom Order', icon: WrenchScrewdriverIcon },
  { to: '/contact', label: 'Contact', icon: PhoneIcon },
  { to: '/faq', label: 'FAQ', icon: QuestionMarkCircleIcon },
];

export const Navbar = () => {
  const toggleCart = useCartStore((state) => state.toggle);
  const items = useCartStore((state) => state.items);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const isProfilePage = location.pathname.startsWith('/profile');
  
  // Check if user is signed in
  const [isSignedIn, setIsSignedIn] = useState(() => {
    return !!localStorage.getItem('cuddles_customer_id');
  });

  // Update signed in state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsSignedIn(!!localStorage.getItem('cuddles_customer_id'));
    };
    window.addEventListener('storage', handleStorageChange);
    // Also check on location change (in case of same-tab navigation)
    handleStorageChange();
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutsideMobile = mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node);
      const clickedOutsideDesktop = desktopMenuRef.current && !desktopMenuRef.current.contains(event.target as Node);
      if (clickedOutsideMobile && clickedOutsideDesktop) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const cartItemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-brand/10 bg-[#fdf9f7]/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 sm:py-3">
        <NavLink
          to="/"
          className="group flex items-center gap-2 font-display text-lg font-semibold text-brand-dark transition sm:text-xl md:gap-3"
          onClick={() => {
            setMobileOpen(false);
            setProfileMenuOpen(false);
          }}
        >
          <div className="relative flex h-10 w-10 items-center justify-center sm:h-12 sm:w-12 md:h-14 md:w-14">
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand/20 to-brand-dark/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
            
            {/* Logo container with subtle border */}
            <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-light/30 to-white shadow-sm ring-1 ring-brand/10 transition-all group-hover:shadow-lg group-hover:ring-brand/20">
              <img 
                src="/design/new_logo.png" 
                alt="Candles & Cuddles" 
                className="navbar-logo h-full w-full object-contain rounded-full"
              />
            </div>
            
            {/* Decorative sparkle */}
            <div className="absolute -right-1 -top-1 hidden h-3 w-3 rounded-full bg-brand opacity-0 blur-sm transition-opacity group-hover:opacity-100 sm:block"></div>
          </div>
          <span className="hidden transition-colors group-hover:text-brand sm:inline">Candles &amp; Cuddles</span>
          <span className="transition-colors group-hover:text-brand sm:hidden">C&amp;C</span>
        </NavLink>
        {/* Mobile Menu */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="relative" ref={mobileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className={`relative flex items-center gap-1 rounded-full p-2.5 transition-all ${
                isProfilePage
                  ? 'bg-brand text-white shadow-md'
                  : 'border border-brand/20 text-brand-dark hover:bg-brand-light/20 hover:border-brand/40'
              }`}
              aria-label={isSignedIn ? 'Profile menu' : 'Account menu'}
              aria-expanded={profileMenuOpen}
            >
              <UserIcon className="h-5 w-5" />
              <ChevronDownIcon className={`h-3 w-3 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-52 animate-slide-down rounded-xl border border-brand/15 bg-white shadow-xl backdrop-blur-sm">
                {isSignedIn ? (
                  <div className="py-2">
                    <NavLink
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-dark transition hover:bg-brand-light/20"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <UserIcon className="h-4 w-4" />
                      My Profile
                    </NavLink>
                    <NavLink
                      to="/profile/orders"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-dark transition hover:bg-brand-light/20"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <ShoppingBagIcon className="h-4 w-4" />
                      My Orders
                    </NavLink>
                    <NavLink
                      to="/profile/addresses"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-dark transition hover:bg-brand-light/20"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <span className="text-base">📍</span>
                      Addresses
                    </NavLink>
                    <NavLink
                      to="/profile/payments"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-dark transition hover:bg-brand-light/20"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <span className="text-base">💳</span>
                      Payment Methods
                    </NavLink>
                    <div className="my-2 border-t border-brand/10"></div>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                      onClick={() => {
                        localStorage.removeItem('cuddles_customer_id');
                        setIsSignedIn(false);
                        setProfileMenuOpen(false);
                        navigate('/');
                        window.dispatchEvent(new Event('storage'));
                      }}
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="py-2">
                    <NavLink
                      to="/signup"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand-light/20"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <span>✨</span>
                      Sign Up
                    </NavLink>
                    <NavLink
                      to="/signin"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-dark transition hover:bg-brand-light/20"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <span>🔑</span>
                      Sign In
                    </NavLink>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            className="relative rounded-full border border-brand p-2.5 text-brand transition hover:bg-brand hover:text-white"
            onClick={() => toggleCart(true)}
            aria-label={`Open cart with ${cartItemCount} items`}
          >
            <ShoppingCartIcon className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow-sm">
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className="rounded-full border border-brand/60 p-2.5 text-brand-dark transition hover:border-brand hover:bg-brand-light/20 hover:text-brand"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-brand-dark/80 lg:flex">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${
                    isActive
                      ? 'bg-brand-light/20 text-brand font-semibold'
                      : 'hover:bg-brand-light/10 hover:text-brand-dark'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}
          <div className="flex items-center gap-3">
            <div className="relative" ref={desktopMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 transition-all ${
                  isProfilePage
                    ? 'bg-brand text-white shadow-md'
                    : 'border border-brand/20 text-brand-dark hover:bg-brand-light/20 hover:border-brand/40'
                }`}
                aria-label={isSignedIn ? 'Profile menu' : 'Account menu'}
                aria-expanded={profileMenuOpen}
              >
                <UserIcon className="h-5 w-5" />
                <ChevronDownIcon className={`h-3 w-3 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 animate-slide-down rounded-xl border border-brand/15 bg-white shadow-xl backdrop-blur-sm">
                  {isSignedIn ? (
                    <div className="py-2">
                      <NavLink
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-dark transition hover:bg-brand-light/20"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <UserIcon className="h-4 w-4" />
                        My Profile
                      </NavLink>
                      <NavLink
                        to="/profile/orders"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-dark transition hover:bg-brand-light/20"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <ShoppingBagIcon className="h-4 w-4" />
                        My Orders
                      </NavLink>
                      <NavLink
                        to="/profile/addresses"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-dark transition hover:bg-brand-light/20"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <span className="text-base">📍</span>
                        Addresses
                      </NavLink>
                      <NavLink
                        to="/profile/payments"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-dark transition hover:bg-brand-light/20"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <span className="text-base">💳</span>
                        Payment Methods
                      </NavLink>
                      <div className="my-2 border-t border-brand/10"></div>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                        onClick={() => {
                          localStorage.removeItem('cuddles_customer_id');
                          setIsSignedIn(false);
                          setProfileMenuOpen(false);
                          navigate('/');
                          window.dispatchEvent(new Event('storage'));
                        }}
                      >
                        <span>🚪</span>
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="py-2">
                      <NavLink
                        to="/signup"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand-light/20"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <span>✨</span>
                        Sign Up
                      </NavLink>
                      <NavLink
                        to="/signin"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-dark transition hover:bg-brand-light/20"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <span>🔑</span>
                        Sign In
                      </NavLink>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              className="relative rounded-full border border-brand p-2.5 text-brand transition hover:bg-brand hover:text-white hover:shadow-md"
              onClick={() => toggleCart(true)}
              aria-label={`Open cart with ${cartItemCount} items`}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow-sm">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>
      {mobileOpen && (
        <div className="lg:hidden animate-slide-down border-t border-brand/10 bg-white/98 backdrop-blur-sm">
          <nav className="mx-4 space-y-1 py-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-light/30 text-brand font-semibold'
                    : 'text-brand-dark/80 hover:bg-brand-light/20'
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              <HomeIcon className="h-5 w-5" />
              Home
            </NavLink>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-light/30 text-brand font-semibold'
                        : 'text-brand-dark/80 hover:bg-brand-light/20'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

