import { NavLink } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const links = [
  { to: '/profile', label: 'Profile', icon: '👤' },
  { to: '/profile/orders', label: 'Orders', icon: '📦' },
  { to: '/profile/addresses', label: 'Addresses', icon: '📍' },
  { to: '/profile/payments', label: 'Payments', icon: '💳' },
];

export const ProfileLayout = ({ children, title, subtitle }: PropsWithChildren<{ title: string; subtitle?: string }>) => {
  return (
    <section className="bg-gradient-to-b from-brand-light/30 to-white px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-dark/60 sm:text-sm">Your space</p>
            <h1 className="font-display text-2xl text-brand-dark sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-brand-dark/70">{subtitle}</p>}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-brand/10 pb-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border-brand bg-brand-light/20 text-brand'
                    : 'border-transparent text-brand-dark/70 hover:border-brand/30 hover:text-brand-dark'
                }`
              }
            >
              <span>{link.icon}</span>
              <span className="hidden sm:inline">{link.label}</span>
              <span className="sm:hidden">{link.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">{children}</div>
      </div>
    </section>
  );
};

