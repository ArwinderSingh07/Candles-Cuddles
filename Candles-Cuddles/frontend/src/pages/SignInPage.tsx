import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { signInCustomer } from '../api/customers';

export const SignInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    const customerId = localStorage.getItem('cuddles_customer_id');
    if (customerId) {
      navigate('/profile');
    }
  }, [navigate]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const customer = await signInCustomer(formData.email.trim().toLowerCase(), formData.password);
      localStorage.setItem('cuddles_customer_id', customer._id);
      setToast('Signed in successfully! ✨');
      setTimeout(() => {
        navigate('/profile');
      }, 500);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 404) {
        setError(err.response?.data?.message || 'Invalid email or password');
      } else {
        setError(err instanceof Error ? err.message : 'Unable to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-b from-brand-light/30 to-white px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-md">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-4 z-50 animate-slide-in rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg sm:right-6">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white">
            <EnvelopeIcon className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl text-brand-dark">Welcome Back</h1>
          <p className="mt-2 text-sm text-brand-dark/70">
            Sign in to access your account and track orders
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-brand/15 bg-white/90 p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <EnvelopeIcon className="h-5 w-5 text-brand-dark/40" />
                </div>
                <input
                  type="email"
                  className="w-full rounded-xl border border-brand/20 bg-white py-3 pl-10 pr-4 text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-brand-dark/40" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-xl border border-brand/20 bg-white py-3 pl-10 pr-10 text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-dark/40 hover:text-brand-dark"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.email.trim() || !formData.password}
              className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-2 text-center">
            <p className="text-sm text-brand-dark/70">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="font-semibold text-brand hover:text-brand-dark transition"
              >
                Sign Up
              </button>
            </p>
            <p className="text-sm text-brand-dark/70">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="font-semibold text-brand hover:text-brand-dark transition"
              >
                Forgot Password?
              </button>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
          <p className="font-semibold">ℹ️ Note</p>
          <p className="mt-1">
            Use the email address associated with your account to sign in. If you don't have an account, please sign up first.
          </p>
        </div>
      </div>
    </section>
  );
};

