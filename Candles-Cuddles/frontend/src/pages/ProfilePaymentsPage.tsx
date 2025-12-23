import { useEffect, useState } from 'react';
import type { PaymentMethod } from '../types';
import { getCustomer, updatePaymentMethods } from '../api/customers';
import { ProfileLayout } from '../components/ProfileLayout';

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

  const formatCardNumber = (last4: string) => {
    return `•••• •••• •••• ${last4}`;
  };

  const formatExpiry = (month?: number, year?: number) => {
    if (!month || !year) return '';
    return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
  };

  return (
    <ProfileLayout 
      title="Payment Methods" 
      subtitle="Manage your saved payment methods securely"
    >
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

      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <p className="font-semibold">🔒 Secure Storage</p>
        <p className="mt-1 text-xs">We only store payment metadata (last 4 digits, expiry) or UPI handles. Full card numbers are never stored.</p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-brand-dark/70">Add and manage your payment methods</p>
        <button
          type="button"
          className="rounded-full border border-brand px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white disabled:opacity-60"
          onClick={handleSavePayments}
          disabled={saving || loading}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand/30 border-t-brand"></span>
              Saving...
            </span>
          ) : (
            'Save All Methods'
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentMethods.length === 0 ? (
            <div className="rounded-2xl border border-brand/15 bg-white/90 p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light/20 text-3xl">
                💳
              </div>
              <h3 className="mb-2 font-display text-xl text-brand-dark">No payment methods saved</h3>
              <p className="mb-6 text-sm text-brand-dark/70">Add your first payment method to get started.</p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setPaymentMethods((prev) => [...prev, emptyPayment()]);
                }}
                className="inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Add Payment Method
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-brand-dark">Your Payment Methods</h2>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
                  onClick={() => {
                    if (!validatePayment()) return;
                    setError(null);
                    setPaymentMethods((prev) => [...prev, emptyPayment()]);
                  }}
                >
                  <span>+</span> Add Method
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {paymentMethods.map((pm, idx) => (
                  <div key={`${pm.brand}-${idx}`} className="relative rounded-xl border border-brand/15 bg-white p-5 shadow-sm transition hover:shadow-md">
                    {pm.isDefault && (
                      <div className="absolute right-3 top-3">
                        <span className="rounded-full bg-brand px-2 py-1 text-xs font-semibold text-white">Default</span>
                      </div>
                    )}
                    {pm.methodType === 'card' && pm.last4 && (
                      <div className="mb-4 rounded-lg border border-brand/20 bg-gradient-to-br from-brand-light/10 to-white p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-brand-dark/60">Card Number</p>
                            <p className="mt-1 font-mono text-lg font-semibold text-brand-dark">
                              {formatCardNumber(pm.last4)}
                            </p>
                          </div>
                          <div className="text-2xl">💳</div>
                        </div>
                        {pm.expiryMonth && pm.expiryYear && (
                          <div className="mt-3 flex items-center gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-brand-dark/60">Expires</p>
                              <p className="mt-1 text-sm font-semibold text-brand-dark">{formatExpiry(pm.expiryMonth, pm.expiryYear)}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-brand-dark/60">Brand</p>
                              <p className="mt-1 text-sm font-semibold text-brand-dark">{pm.brand}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {pm.methodType === 'upi' && pm.upiHandle && (
                      <div className="mb-4 rounded-lg border border-brand/20 bg-gradient-to-br from-brand-light/10 to-white p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-brand-dark/60">UPI ID</p>
                            <p className="mt-1 font-semibold text-brand-dark">{pm.upiHandle}</p>
                          </div>
                          <div className="text-2xl">📱</div>
                        </div>
                        <p className="mt-2 text-xs text-brand-dark/60">Brand: {pm.brand}</p>
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
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
                          className="rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                          placeholder="Brand / Provider*"
                          value={pm.brand}
                          onChange={(e) =>
                            setPaymentMethods((prev) => prev.map((p, i) => (i === idx ? { ...p, brand: e.target.value } : p)))
                          }
                          required
                        />
                      </div>
                      {pm.methodType === 'card' && (
                        <>
                          <input
                            className="w-full rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                            placeholder="Last 4 digits*"
                            value={pm.last4 ?? ''}
                            maxLength={4}
                            onChange={(e) =>
                              setPaymentMethods((prev) => prev.map((p, i) => (i === idx ? { ...p, last4: e.target.value.replace(/\D/g, '') } : p)))
                            }
                            required
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              className="rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                              placeholder="MM*"
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
                              className="rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                              placeholder="YYYY*"
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
                          </div>
                        </>
                      )}
                      {pm.methodType === 'upi' && (
                        <input
                          className="w-full rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                          placeholder="UPI ID (e.g., name@paytm)*"
                          value={pm.upiHandle ?? ''}
                          onChange={(e) =>
                            setPaymentMethods((prev) => prev.map((p, i) => (i === idx ? { ...p, upiHandle: e.target.value } : p)))
                          }
                          required
                        />
                      )}
                      {pm.methodType !== 'card' && pm.methodType !== 'upi' && (
                        <input
                          className="w-full rounded-lg border border-brand/20 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 placeholder:text-gray-400"
                          placeholder="Reference / handle"
                          value={pm.token ?? ''}
                          onChange={(e) =>
                            setPaymentMethods((prev) => prev.map((p, i) => (i === idx ? { ...p, token: e.target.value } : p)))
                          }
                        />
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-sm text-brand-dark/70">
                          <input
                            type="checkbox"
                            checked={pm.isDefault ?? false}
                            onChange={(e) =>
                              setPaymentMethods((prev) =>
                                prev.map((p, i) => (i === idx ? { ...p, isDefault: e.target.checked } : p)),
                              )
                            }
                            className="h-4 w-4 rounded border-brand/20 text-brand focus:ring-brand/20"
                          />
                          Set as default
                        </label>
                        {paymentMethods.length > 1 && (
                          <button
                            type="button"
                            className="text-sm font-semibold text-red-600 transition hover:text-red-700"
                            onClick={() => setPaymentMethods((prev) => prev.filter((_, i) => i !== idx))}
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
