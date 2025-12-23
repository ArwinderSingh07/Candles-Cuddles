import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { adminLogin } from '../api/admin';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminLogin(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-light/20 to-white px-6 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-brand/15 bg-white p-8 shadow-lg">
          {/* Logo/Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl font-semibold text-white">
              🔐
            </div>
            <h1 className="font-display text-3xl text-brand-dark">Admin Login</h1>
            <p className="mt-2 text-sm text-brand-dark/70">Sign in to manage your store</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-brand/20 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="admin@candlesandcuddles.in"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-brand/20 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-6 w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LockClosedIcon className="h-5 w-5" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          {/* Back to Store Link */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-brand-dark/70 hover:text-brand-dark transition"
            >
              ← Back to Store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

