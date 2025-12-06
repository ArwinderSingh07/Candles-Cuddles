import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import type { Customer } from '../types';
import { getCustomer, updateCustomer, upsertCustomer, changePassword } from '../api/customers';
import { ProfileLayout } from '../components/ProfileLayout';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState<string | null>(() => localStorage.getItem('cuddles_customer_id'));
  const [profile, setProfile] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    gender: undefined,
    dob: undefined,
  });
  const [loading, setLoading] = useState(true); // Start with true to check auth
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const formattedDob = useMemo(() => (profile.dob ? profile.dob.slice(0, 10) : ''), [profile.dob]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const hydrate = async () => {
      if (!customerId) {
        // If not logged in, don't show loading state
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getCustomer(customerId);
        setProfile({
          ...data,
          dob: data.dob ? data.dob : undefined,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load profile');
        // If customer not found, clear localStorage
        if (err instanceof Error && err.message.includes('not found')) {
          localStorage.removeItem('cuddles_customer_id');
          setCustomerId(null);
        }
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, [customerId]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSaveProfile = async () => {
    setError(null);
    
    if (!profile.name?.trim()) {
      setError('Name is required');
      setTouched({ ...touched, name: true });
      return;
    }
    
    if (!profile.email?.trim()) {
      setError('Email is required');
      setTouched({ ...touched, email: true });
      return;
    }
    
    if (!validateEmail(profile.email)) {
      setError('Please enter a valid email address');
      setTouched({ ...touched, email: true });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: profile.name.trim(),
        email: profile.email.trim().toLowerCase(),
        phone: profile.phone?.trim(),
        gender: profile.gender,
        dob: profile.dob,
      };
      let saved: Customer;
      if (customerId) {
        saved = await updateCustomer(customerId, payload);
      } else {
        saved = await upsertCustomer(payload as { name: string; email: string });
        setCustomerId(saved._id);
        localStorage.setItem('cuddles_customer_id', saved._id);
      }
      setProfile({
        ...saved,
        dob: saved.dob ? saved.dob : undefined,
      });
      // Update customerId if it was just created
      if (!customerId) {
        setCustomerId(saved._id);
        localStorage.setItem('cuddles_customer_id', saved._id);
      }
      setToast('Profile saved successfully! ✨');
      setTouched({});
      
      // Trigger a custom event to update navbar
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ProfileLayout title="Profile & Preferences" subtitle="Manage your personal information and preferences">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg sm:right-6">
          {toast}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
        </div>
      ) : !customerId ? (
        <div className="rounded-2xl border border-brand/15 bg-white/90 p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light/20 text-3xl">
            👤
          </div>
          <h3 className="mb-2 font-display text-xl text-brand-dark">Please sign in</h3>
          <p className="mb-6 text-sm text-brand-dark/70">
            Sign in or create an account to manage your profile and track orders.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/signin')}
              className="rounded-full border border-brand px-6 py-3 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Sign Up
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-brand/15 bg-gradient-to-br from-brand-light/20 to-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand text-2xl font-semibold text-white">
                  {profile.name ? getInitials(profile.name) : '👤'}
                </div>
                <h3 className="font-display text-xl text-brand-dark">{profile.name || 'Guest User'}</h3>
                <p className="mt-1 text-sm text-brand-dark/70">{profile.email || 'No email'}</p>
                {customerId && (
                  <p className="mt-2 text-xs text-brand-dark/50">ID: {customerId.slice(-8)}</p>
                )}
                {profile.createdAt && (
                  <p className="mt-2 text-xs text-brand-dark/50">
                    Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-brand/15 bg-white/90 p-6 shadow-sm">
              <h2 className="mb-6 font-display text-xl text-brand-dark">Personal Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                    Full Name *
                  </label>
                  <input
                    className={`mt-2 w-full rounded-xl border px-4 py-3 transition focus:outline-none focus:ring-2 ${
                      touched.name && !profile.name
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-brand/20 focus:border-brand focus:ring-brand/20'
                    }`}
                    value={profile.name ?? ''}
                    onChange={(e) => {
                      setProfile((p) => ({ ...p, name: e.target.value }));
                      setTouched({ ...touched, name: true });
                    }}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                    Email Address *
                  </label>
                  <input
                    className={`mt-2 w-full rounded-xl border px-4 py-3 transition focus:outline-none focus:ring-2 ${
                      touched.email && (!profile.email || !validateEmail(profile.email))
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-brand/20 focus:border-brand focus:ring-brand/20'
                    }`}
                    type="email"
                    value={profile.email ?? ''}
                    onChange={(e) => {
                      setProfile((p) => ({ ...p, email: e.target.value }));
                      setTouched({ ...touched, email: true });
                    }}
                    placeholder="your.email@example.com"
                    required
                  />
                  {touched.email && profile.email && !validateEmail(profile.email) && (
                    <p className="mt-1 text-xs text-red-600">Please enter a valid email address</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                    Phone Number
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-brand/20 bg-white px-4 py-3 text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                    type="tel"
                    value={profile.phone ?? ''}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                      Gender
                    </label>
                    <select
                      className="mt-2 w-full rounded-xl border border-brand/20 bg-white px-4 py-3 text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                      value={profile.gender ?? ''}
                      onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value as Customer['gender'] }))}
                    >
                      <option value="">Select gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                      Date of Birth
                    </label>
                    <input
                      className="mt-2 w-full rounded-xl border border-brand/20 bg-white px-4 py-3 text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                      type="date"
                      value={formattedDob}
                      onChange={(e) => setProfile((p) => ({ ...p, dob: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined }))}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleSaveProfile}
                    disabled={saving || !profile.name?.trim() || !profile.email?.trim()}
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="mt-6 rounded-2xl border border-brand/15 bg-white/90 p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl text-brand-dark">Change Password</h2>
                  <p className="mt-1 text-sm text-brand-dark/70">Update your account password</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(!showPasswordForm);
                    setPasswordError(null);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="rounded-full border border-brand/20 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-light/20"
                >
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordForm && (
                <div className="space-y-4 border-t border-brand/10 pt-4">
                  {passwordError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {passwordError}
                    </div>
                  )}

                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                      Current Password *
                    </label>
                    <div className="relative mt-2">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="w-full rounded-xl border border-brand/20 px-4 py-3 pr-10 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setPasswordError(null);
                        }}
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/50 hover:text-brand-dark"
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                      New Password *
                    </label>
                    <div className="relative mt-2">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="w-full rounded-xl border border-brand/20 px-4 py-3 pr-10 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError(null);
                        }}
                        placeholder="Enter new password (min 6 characters)"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/50 hover:text-brand-dark"
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {newPassword && newPassword.length < 6 && (
                      <p className="mt-1 text-xs text-red-600">Password must be at least 6 characters</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-brand-dark/70">
                      Confirm New Password *
                    </label>
                    <div className="relative mt-2">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="w-full rounded-xl border border-brand/20 px-4 py-3 pr-10 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordError(null);
                        }}
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/50 hover:text-brand-dark"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setPasswordError(null);

                        if (!currentPassword) {
                          setPasswordError('Current password is required');
                          return;
                        }

                        if (!newPassword || newPassword.length < 6) {
                          setPasswordError('New password must be at least 6 characters');
                          return;
                        }

                        if (newPassword !== confirmPassword) {
                          setPasswordError('Passwords do not match');
                          return;
                        }

                        if (!customerId) {
                          setPasswordError('Please sign in to change password');
                          return;
                        }

                        setChangingPassword(true);
                        try {
                          await changePassword(customerId, currentPassword, newPassword);
                          setToast('Password changed successfully! 🔒');
                          setShowPasswordForm(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        } catch (err) {
                          setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
                        } finally {
                          setChangingPassword(false);
                        }
                      }}
                      disabled={
                        changingPassword ||
                        !currentPassword ||
                        !newPassword ||
                        newPassword.length < 6 ||
                        newPassword !== confirmPassword
                      }
                      className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                          Changing...
                        </span>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
};
