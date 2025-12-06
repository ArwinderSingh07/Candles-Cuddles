import type { PropsWithChildren } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';

export const Layout = ({ children }: PropsWithChildren) => (
  <div className="flex min-h-screen flex-col bg-[#fdf9f7] text-brand-dark">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
    <CartDrawer />
  </div>
);

