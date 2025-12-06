import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { verifyOTPAndResetPassword } from '../api/passwordReset';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailFromQuery = searchParams.get('email') || '';
  
  const [formData, setFormData] = useState({
    email: emailFromQuery,
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
        navigate('/signin');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, navigate]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!formData.newPassword || formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await verifyOTPAndResetPassword(
        formData.email.trim().toLowerCase(),
        formData.otp,
        formData.newPassword,
      );
      setToast('Password reset successfully! Redirecting to sign in...');
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid or expired OTP');
      } else {
        setError(err instanceof Error ? err.message : 'Unable to reset password. Please try again.');
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
          onClick={() => navigate('/forgot-password')}
          className="mb-6 flex items-center gap-2 text-sm text-brand-dark/70 transition hover:text-brand-dark"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white">
            <LockClosedIcon className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl text-brand-dark">Reset Password</h1>
          <p className="mt-2 text-sm text-brand-dark/70">
            Enter the OTP sent to your email and create a new password
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-brand/15 bg-white/90 p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                Email Address
              </label>
              <input
                type="email"
                className="w-full rounded-xl border border-brand/20 bg-white py-3 px-4 text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                OTP (6 digits)
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-brand/20 bg-white py-3 px-4 text-center text-2xl font-mono tracking-widest text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                placeholder="000000"
                value={formData.otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setFormData({ ...formData, otp: value });
                }}
                required
                maxLength={6}
                autoFocus
              />
              <p className="mt-1 text-xs text-brand-dark/60">Enter the 6-digit code sent to your email</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-brand-dark/40" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-xl border border-brand/20 bg-white py-3 pl-10 pr-10 text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                  placeholder="At least 6 characters"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-dark/40 hover:text-brand-dark"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-brand-dark/40" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full rounded-xl border border-brand/20 bg-white py-3 pl-10 pr-10 text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-dark/40 hover:text-brand-dark"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !formData.email.trim() ||
                formData.otp.length !== 6 ||
                !formData.newPassword ||
                formData.newPassword.length < 6 ||
                formData.newPassword !== formData.confirmPassword
              }
              className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  Resetting Password...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-brand-dark/70">
              Didn't receive the OTP?{' '}
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="font-semibold text-brand hover:text-brand-dark transition"
              >
                Resend OTP
              </button>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
          <p className="font-semibold">ℹ️ Security Note</p>
          <p className="mt-1">
            The OTP expires in 10 minutes. Make sure to use a strong password with at least 6 characters.
          </p>
        </div>
      </div>
    </section>
  );
};

