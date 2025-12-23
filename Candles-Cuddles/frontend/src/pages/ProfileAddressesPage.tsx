import { useEffect, useMemo, useState } from 'react';
import type { Address, Customer } from '../types';
import { getCustomer, updateAddresses, upsertCustomer } from '../api/customers';
import { ProfileLayout } from '../components/ProfileLayout';

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

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
    <ProfileLayout title="Shipping Addresses" subtitle="Manage your delivery addresses">
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

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-brand-dark/70">Add and manage your shipping addresses</p>
        <button
          type="button"
          className="rounded-full border border-brand px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white disabled:opacity-60"
          onClick={handleSaveAddresses}
          disabled={saving || loading}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand/30 border-t-brand"></span>
              Saving...
            </span>
          ) : (
            'Save All Addresses'
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="rounded-2xl border border-brand/15 bg-white/90 p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light/20 text-3xl">
                📍
              </div>
              <h3 className="mb-2 font-display text-xl text-brand-dark">No addresses saved</h3>
              <p className="mb-6 text-sm text-brand-dark/70">Add your first shipping address to get started.</p>
              <button
                type="button"
                onClick={handleAddAddress}
                className="inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Add Address
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-brand-dark">Your Addresses</h2>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
                  onClick={handleAddAddress}
                >
                  <span>+</span> Add Address
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="relative rounded-xl border border-brand/15 bg-white p-5 shadow-sm transition hover:shadow-md">
                    {addr.isDefault && (
                      <div className="absolute right-3 top-3">
                        <span className="rounded-full bg-brand px-2 py-1 text-xs font-semibold text-white">Default</span>
                      </div>
                    )}
                    <div className="mb-3">
                      <h3 className="font-semibold text-brand-dark">{addr.label || `Address ${idx + 1}`}</h3>
                    </div>
                    <div className="space-y-3">
                      <input
                        className="w-full rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                        placeholder="Label (e.g., Home, Office)*"
                        value={addr.label}
                        onChange={(e) =>
                          setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, label: e.target.value } : a)))
                        }
                        required
                      />
                      <input
                        className="w-full rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                        placeholder="Street Address*"
                        value={addr.line1}
                        onChange={(e) =>
                          setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, line1: e.target.value } : a)))
                        }
                        required
                      />
                      <input
                        className="w-full rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                        placeholder="Apartment, suite, etc. (optional)"
                        value={addr.line2 ?? ''}
                        onChange={(e) =>
                          setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, line2: e.target.value } : a)))
                        }
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                          placeholder="City*"
                          value={addr.city}
                          onChange={(e) =>
                            setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, city: e.target.value } : a)))
                          }
                          required
                        />
                        <input
                          className="rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                          placeholder="Postal Code*"
                          value={addr.postalCode}
                          onChange={(e) =>
                            setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, postalCode: e.target.value } : a)))
                          }
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                          placeholder="State"
                          value={addr.state ?? ''}
                          onChange={(e) =>
                            setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, state: e.target.value } : a)))
                          }
                        />
                        <input
                          className="rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                          placeholder="Country*"
                          value={addr.country}
                          onChange={(e) =>
                            setAddresses((prev) => prev.map((a, i) => (i === idx ? { ...a, country: e.target.value } : a)))
                          }
                          required
                        />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-sm text-brand-dark/70">
                          <input
                            type="checkbox"
                            checked={addr.isDefault ?? false}
                            onChange={(e) =>
                              setAddresses((prev) =>
                                prev.map((a, i) => (i === idx ? { ...a, isDefault: e.target.checked } : a)),
                              )
                            }
                            className="h-4 w-4 rounded border-brand/20 text-brand focus:ring-brand/20"
                          />
                          Set as default
                        </label>
                        {addresses.length > 1 && (
                          <button
                            type="button"
                            className="text-sm font-semibold text-red-600 transition hover:text-red-700"
                            onClick={() => setAddresses((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </ProfileLayout>
  );
};
