import { useEffect, useMemo, useState } from 'react';
import type { Address, Customer } from '../types';
import { getCustomer, updateAddresses, upsertCustomer } from '../api/customers';

const links = [
  { to: '/profile', label: 'Profile' },
  { to: '/profile/addresses', label: 'Addresses' },
  { to: '/profile/payments', label: 'Payment methods' },
  { to: '/profile/orders', label: 'Orders' },
];

const emptyAddress = (): Address => ({
  label: 'Home',
  line1: '',
  city: '',
  postalCode: '',
  country: 'India',
  line2: '',
  state: '',
  isDefault: false,
});

export const ProfileAddressesPage = () => {
  const [customerId, setCustomerId] = useState<string | null>(() => localStorage.getItem('cuddles_customer_id'));
  const [profile, setProfile] = useState<Partial<Customer>>({ name: '', email: '' });
  const [addresses, setAddresses] = useState<Address[]>([emptyAddress()]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const hasDefault = useMemo(() => addresses.some((a) => a.isDefault), [addresses]);

  useEffect(() => {
    const hydrate = async () => {
      if (!customerId) return;
      setLoading(true);
      try {
        const data = await getCustomer(customerId);
        setProfile(data);
        setAddresses(data.addresses?.length ? data.addresses : [emptyAddress()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load addresses');
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, [customerId]);

  const validateAddresses = () => {
    if (!addresses.length) return true;
    for (const addr of addresses) {
      if (!addr.label || !addr.line1 || !addr.city || !addr.postalCode || !addr.country) {
        setError('Label, line1, city, postal code, and country are required for each address');
        return false;
      }
    }
    return true;
  };

  const handleSaveAddresses = async () => {
    if (!validateAddresses()) return;
    if (!profile.email || !profile.name) {
      setError('Save profile with name and email first');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let id = customerId;
      if (!id) {
        const created = await upsertCustomer({ name: profile.name, email: profile.email });
        id = created._id;
        setCustomerId(id);
        localStorage.setItem('cuddles_customer_id', id);
      }
      const payload = hasDefault
        ? addresses
        : addresses.map((a, idx) => (idx === 0 ? { ...a, isDefault: true } : a));
      const updated = await updateAddresses(id!, payload);
      setAddresses(updated.addresses);
      setToast('Addresses saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save addresses');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = () => {
    if (!validateAddresses()) return;
    setError(null);
    setAddresses((prev) => [...prev, emptyAddress()]);
  };

  return (
    <section className="bg-gradient-to-b from-brand-light/30 to-white px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">Your space</p>
            <h1 className="font-display text-3xl text-brand-dark">Addresses</h1>
            <p className="text-sm text-brand-dark/70">Manage shipping addresses stored in the DB.</p>
          </div>
          <button
            type="button"
            className="rounded-full border border-brand px-5 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white transition disabled:opacity-60"
            onClick={handleSaveAddresses}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save addresses'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-sm font-semibold text-brand-dark/70">
            {links.map((l) => (
              <a
                key={l.to}
                href={l.to}
                className={`rounded-full border px-4 py-2 transition ${l.to === '/profile/addresses' ? 'border-brand bg-brand-light/50 text-brand-dark' : 'border-brand/20 hover:border-brand hover:text-brand'}`}
            >
              {l.label}
            </a>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {toast && <p className="text-sm text-green-700">{toast}</p>}

        {loading ? (
          <p className="text-sm text-brand-dark/70">Loading addresses...</p>
        ) : (
            <div className="space-y-4 rounded-2xl border border-brand/15 bg-white/90 p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-xl text-brand-dark">Saved addresses</h2>
                <button
                  type="button"
                  className="text-sm font-semibold text-brand hover:text-brand-dark transition"
                  onClick={handleAddAddress}
                >
                  Add address
                </button>
              </div>
            <div className="space-y-4">
              {addresses.map((addr, idx) => (
                <div key={idx} className="space-y-2 rounded-xl border border-brand/10 p-3">
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      className="rounded-lg border border-brand/20 px-3 py-2"
                      placeholder="Label*"
                      value={addr.label}
                      onChange={(e) =>
                        setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, label: e.target.value } : a)))
                      }
                      required
                    />
                    <input
                      className="rounded-lg border border-brand/20 px-3 py-2"
                      placeholder="Line 1*"
                      value={addr.line1}
                      onChange={(e) =>
                        setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, line1: e.target.value } : a)))
                      }
                      required
                    />
                    <input
                      className="rounded-lg border border-brand/20 px-3 py-2"
                      placeholder="Line 2"
                      value={addr.line2 ?? ''}
                      onChange={(e) =>
                        setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, line2: e.target.value } : a)))
                      }
                    />
                    <input
                      className="rounded-lg border border-brand/20 px-3 py-2"
                      placeholder="City*"
                      value={addr.city}
                      onChange={(e) =>
                        setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, city: e.target.value } : a)))
                      }
                      required
                    />
                    <input
                      className="rounded-lg border border-brand/20 px-3 py-2"
                      placeholder="State"
                      value={addr.state ?? ''}
                      onChange={(e) =>
                        setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, state: e.target.value } : a)))
                      }
                    />
                    <input
                      className="rounded-lg border border-brand/20 px-3 py-2"
                      placeholder="Postal code*"
                      value={addr.postalCode}
                      onChange={(e) =>
                        setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, postalCode: e.target.value } : a)))
                      }
                      required
                    />
                    <input
                      className="rounded-lg border border-brand/20 px-3 py-2"
                      placeholder="Country*"
                      value={addr.country}
                      onChange={(e) =>
                        setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, country: e.target.value } : a)))
                      }
                      required
                    />
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-dark/70">
                      <input
                        type="checkbox"
                        checked={addr.isDefault ?? false}
                        onChange={(e) =>
                          setAddresses((prev) =>
                            prev.map((a, i) => (i === idx ? { ...a, isDefault: e.target.checked } : a)),
                          )
                        }
                      />
                      Default
                    </label>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                      onClick={() => setAddresses((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      Delete address
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
