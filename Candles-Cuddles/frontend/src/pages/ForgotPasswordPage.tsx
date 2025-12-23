import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { requestPasswordReset } from '../api/passwordReset';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setSuccess(true);
      setToast('OTP sent successfully! Check your email.');
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Unable to send OTP');
      } else {
        setError(err instanceof Error ? err.message : 'Unable to send OTP. Please try again.');
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

        {/* Back Button */}
        <button
          onClick={() => navigate('/signin')}
          className="mb-6 flex items-center gap-2 text-sm text-brand-dark/70 transition hover:text-brand-dark"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Sign In
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white">
            <EnvelopeIcon className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl text-brand-dark">Forgot Password?</h1>
          <p className="mt-2 text-sm text-brand-dark/70">
            Enter your email address and we'll send you an OTP to reset your password
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-brand/15 bg-white/90 p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                <p className="font-semibold">✓ OTP Sent Successfully!</p>
                <p className="mt-1">
                  We've sent a 6-digit OTP to <strong>{email}</strong>. Please check your email and enter the OTP to reset your password.
                </p>
              </div>
              <button
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
              >
                Enter OTP
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                    Sending OTP...
                  </span>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          )}

          {/* Link to Sign In */}
          <div className="mt-6 text-center">
            <p className="text-sm text-brand-dark/70">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="font-semibold text-brand hover:text-brand-dark transition"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
          <p className="font-semibold">ℹ️ Note</p>
          <p className="mt-1">
            The OTP will be sent to your registered email address and will expire in 10 minutes. If you don't receive the email, please check your spam folder.
          </p>
        </div>
      </div>
    </section>
  );
};

