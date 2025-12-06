import { useEffect, useState } from 'react';
import type { PaymentMethod } from '../types';
import { getCustomer, updatePaymentMethods } from '../api/customers';

const links = [
  { to: '/profile', label: 'Profile' },
  { to: '/profile/addresses', label: 'Addresses' },
  { to: '/profile/payments', label: 'Payment methods' },
  { to: '/profile/orders', label: 'Orders' },
];

const emptyPayment = (): PaymentMethod => ({
  methodType: 'card',
  brand: 'Razorpay',
  last4: '',
  expiryMonth: new Date().getMonth() + 1,
  expiryYear: new Date().getFullYear(),
  token: '',
  isDefault: false,
});

export const ProfilePaymentsPage = () => {
  const [customerId] = useState<string | null>(() => localStorage.getItem('cuddles_customer_id'));
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([emptyPayment()]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      if (!customerId) {
        setError('Save your profile first to add payment methods');
        return;
      }
      setLoading(true);
      try {
        const data = await getCustomer(customerId);
        setPaymentMethods(data.paymentMethods?.length ? data.paymentMethods : [emptyPayment()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load payment methods');
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, [customerId]);

  const validatePayment = () => {
    if (!paymentMethods.length) return true;
    for (const pm of paymentMethods) {
      if (!pm.methodType) {
        setError('Select a Razorpay method type');
        return false;
      }
      if (!pm.brand) {
        setError('Brand or provider is required');
        return false;
      }
      if (pm.methodType === 'card') {
        if (!pm.last4 || pm.last4.length !== 4) {
          setError('Card last 4 digits are required');
          return false;
        }
        if (!pm.expiryMonth || pm.expiryMonth < 1 || pm.expiryMonth > 12) {
          setError('Expiry month must be between 1-12');
          return false;
        }
        if (!pm.expiryYear || pm.expiryYear < new Date().getFullYear()) {
          setError('Expiry year cannot be in the past');
          return false;
        }
      }
      if (pm.methodType === 'upi') {
        if (!pm.upiHandle) {
          setError('UPI ID is required for UPI methods');
          return false;
        }
      }
    }
    return true;
  };

  const handleSavePayments = async () => {
    if (!customerId) {
      setError('Save your profile first');
      return;
    }
    if (!validatePayment()) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updatePaymentMethods(customerId, paymentMethods);
      setPaymentMethods(updated.paymentMethods);
      setToast('Payment methods saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save payment methods');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-gradient-to-b from-brand-light/30 to-white px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">Your space</p>
            <h1 className="font-display text-3xl text-brand-dark">Payment methods</h1>
            <p className="text-sm text-brand-dark/70">Store preferred Razorpay instruments (card last4/expiry or UPI ID). No raw card data.</p>
          </div>
          <button
            type="button"
            className="rounded-full border border-brand px-5 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white transition disabled:opacity-60"
            onClick={handleSavePayments}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save payment methods'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-sm font-semibold text-brand-dark/70">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className={`rounded-full border px-4 py-2 transition ${l.to === '/profile/payments' ? 'border-brand bg-brand-light/50 text-brand-dark' : 'border-brand/20 hover:border-brand hover:text-brand'}`}
            >
              {l.label}
            </a>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {toast && <p className="text-sm text-green-700">{toast}</p>}

        {loading ? (
          <p className="text-sm text-brand-dark/70">Loading payment methods...</p>
        ) : (
          <div className="space-y-4 rounded-2xl border border-brand/15 bg-white/90 p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-xl text-brand-dark">Saved Razorpay methods</h2>
              <button
                type="button"
                className="text-sm font-semibold text-brand hover:text-brand-dark transition"
                onClick={() => {
                  if (!validatePayment()) return;
                  setError(null);
                  setPaymentMethods((prev) => [...prev, emptyPayment()]);
                }}
              >
                Add payment method
              </button>
            </div>
            <p className="text-xs text-brand-dark/70">
              Store only metadata Razorpay returns (card last4/expiry) or UPI handles. Never collect full card numbers here.
            </p>
            <div className="space-y-4">
              {paymentMethods.map((pm, idx) => (
                <div key={`${pm.brand}-${idx}`} className="space-y-2 rounded-xl border border-brand/10 p-3">
                  <div className="grid gap-2 md:grid-cols-2">
                    <select
                      className="rounded-lg border border-brand/20 px-3 py-2"
                      value={pm.methodType}
                      onChange={(e) =>
                        setPaymentMethods((prev) =>
                          prev.map((p, i) => (i === idx ? { ...p, methodType: e.target.value as PaymentMethod['methodType'] } : p)),
                        )
                      }
                    >
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="wallet">Wallet</option>
                      <option value="netbanking">Netbanking</option>
                    </select>
                    <input
                      className="rounded-lg border border-brand/20 px-3 py-2"
                      placeholder="Brand / Provider*"
                      value={pm.brand}
                      onChange={(e) =>
                        setPaymentMethods((prev) => prev.map((p, i) => (i === idx ? { ...p, brand: e.target.value } : p)))
                      }
                      required
                    />
                    {pm.methodType === 'card' && (
                      <>
                        <input
                          className="rounded-lg border border-brand/20 px-3 py-2"
                          placeholder="Last 4*"
                          value={pm.last4 ?? ''}
                          maxLength={4}
                          onChange={(e) =>
                            setPaymentMethods((prev) => prev.map((p, i) => (i === idx ? { ...p, last4: e.target.value } : p)))
                          }
                          required
                        />
                        <input
                          className="rounded-lg border border-brand/20 px-3 py-2"
                          placeholder="Expiry month*"
                          type="number"
                          min={1}
                          max={12}
                          value={pm.expiryMonth ?? ''}
                          onChange={(e) =>
                            setPaymentMethods((prev) =>
                              prev.map((p, i) => (i === idx ? { ...p, expiryMonth: Number(e.target.value) } : p)),
                            )
                          }
                          required
                        />
                        <input
                          className="rounded-lg border border-brand/20 px-3 py-2"
                          placeholder="Expiry year*"
                          type="number"
                          min={new Date().getFullYear()}
                          max={new Date().getFullYear() + 15}
                          value={pm.expiryYear ?? ''}
                          onChange={(e) =>
                            setPaymentMethods((prev) =>
                              prev.map((p, i) => (i === idx ? { ...p, expiryYear: Number(e.target.value) } : p)),
                            )
                          }
                          required
                        />
                      </>
                    )}
                    {pm.methodType === 'upi' && (
                      <input
                        className="rounded-lg border border-brand/20 px-3 py-2"
                        placeholder="UPI ID*"
                        value={pm.upiHandle ?? ''}
                        onChange={(e) =>
                          setPaymentMethods((prev) => prev.map((p, i) => (i === idx ? { ...p, upiHandle: e.target.value } : p)))
                        }
                        required
                      />
                    )}
                    {pm.methodType !== 'card' && pm.methodType !== 'upi' && (
                      <input
                        className="rounded-lg border border-brand/20 px-3 py-2"
                        placeholder="Reference / handle"
                        value={pm.token ?? ''}
                        onChange={(e) =>
                          setPaymentMethods((prev) => prev.map((p, i) => (i === idx ? { ...p, token: e.target.value } : p)))
                        }
                      />
                    )}
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-dark/70">
                      <input
                        type="checkbox"
                        checked={pm.isDefault ?? false}
                        onChange={(e) =>
                          setPaymentMethods((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, isDefault: e.target.checked } : p)),
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
                      onClick={() => setPaymentMethods((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      Delete payment method
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
