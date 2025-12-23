import { useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { subscribeNewsletter } from '../api/newsletter';

interface NewsletterSignupProps {
  variant?: 'inline' | 'card';
}

export const NewsletterSignup = ({ variant = 'inline' }: NewsletterSignupProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await subscribeNewsletter(email.trim().toLowerCase());
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'card') {
    return (
      <div className="rounded-2xl border border-brand/15 bg-gradient-to-br from-brand-light/20 to-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white">
          <EnvelopeIcon className="h-8 w-8" />
        </div>
        <h3 className="font-display text-2xl text-brand-dark">Stay in the Loop</h3>
        <p className="mt-2 text-brand-dark/70">
          Subscribe to our newsletter for exclusive offers, new collections, and candle care tips.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:max-w-md sm:mx-auto">
          <input
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-xl border border-brand/20 bg-white px-4 py-3 text-gray-700 placeholder:text-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-3 text-sm text-green-600">✓ Successfully subscribed!</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <EnvelopeIcon className="h-5 w-5 text-brand-dark/40" />
        </div>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-brand/20 bg-white py-3 pl-10 pr-4 text-gray-700 placeholder:text-gray-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">✓ Subscribed!</p>}
    </form>
  );
};

