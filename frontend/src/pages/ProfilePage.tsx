import { useEffect, useMemo, useState } from 'react';
import type { Customer } from '../types';
import { getCustomer, updateCustomer, upsertCustomer } from '../api/customers';

const links = [
  { to: '/profile', label: 'Profile' },
  { to: '/profile/addresses', label: 'Addresses' },
  { to: '/profile/payments', label: 'Payment methods' },
  { to: '/profile/orders', label: 'Orders' },
];

export const ProfilePage = () => {
  const [customerId, setCustomerId] = useState<string | null>(() => localStorage.getItem('cuddles_customer_id'));
  const [profile, setProfile] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    gender: undefined,
    dob: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formattedDob = useMemo(() => (profile.dob ? profile.dob.slice(0, 10) : ''), [profile.dob]);

  useEffect(() => {
    const hydrate = async () => {
      if (!customerId) return;
      setLoading(true);
      try {
        const data = await getCustomer(customerId);
        setProfile({
          ...data,
          dob: data.dob ? data.dob : undefined,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, [customerId]);

  const handleSaveProfile = async () => {
    if (!profile.name || !profile.email) {
      setError('Name and email are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
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
      setToast('Profile saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-gradient-to-b from-brand-light/30 to-white px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">Your space</p>
            <h1 className="font-display text-3xl text-brand-dark">Profile &amp; preferences</h1>
            <p className="text-sm text-brand-dark/70">Data persists in MongoDB; update anytime.</p>
          </div>
          <button
            type="button"
            className="rounded-full border border-brand px-5 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white transition disabled:opacity-60"
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-sm font-semibold text-brand-dark/70">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className="rounded-full border border-brand/20 px-4 py-2 hover:border-brand hover:text-brand transition"
            >
              {l.label}
            </a>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {toast && <p className="text-sm text-green-700">{toast}</p>}

        <div className="rounded-2xl border border-brand/15 bg-white/90 p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl text-brand-dark">Profile</h2>
            {customerId ? (
              <span className="text-xs uppercase tracking-wide text-brand-dark/60">ID: {customerId.slice(-6)}</span>
            ) : null}
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase text-brand-dark/70">
              Name
              <input
                className="mt-1 w-full rounded-xl border border-brand/20 px-3 py-2"
                value={profile.name ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </label>
            <label className="block text-xs font-semibold uppercase text-brand-dark/70">
              Email
              <input
                className="mt-1 w-full rounded-xl border border-brand/20 px-3 py-2"
                type="email"
                value={profile.email ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </label>
            <label className="block text-xs font-semibold uppercase text-brand-dark/70">
              Phone
              <input
                className="mt-1 w-full rounded-xl border border-brand/20 px-3 py-2"
                value={profile.phone ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </label>
            <label className="block text-xs font-semibold uppercase text-brand-dark/70">
              Gender
              <select
                className="mt-1 w-full rounded-xl border border-brand/20 px-3 py-2"
                value={profile.gender ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value as Customer['gender'] }))}
              >
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer_not_say">Prefer not to say</option>
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase text-brand-dark/70">
              Date of birth
              <input
                className="mt-1 w-full rounded-xl border border-brand/20 px-3 py-2"
                type="date"
                value={formattedDob}
                onChange={(e) => setProfile((p) => ({ ...p, dob: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined }))}
              />
            </label>
            <button
              type="button"
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              Save profile
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
