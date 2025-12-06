import { useState } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { submitContactForm } from '../api/contact';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        message: formData.message.trim(),
      });
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-120px)] bg-gradient-to-b from-brand-light/40 to-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(198,93,123,0.08),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(198,93,123,0.06),transparent_30%)]" />
      
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-brand-dark/70">Let&apos;s Connect</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-brand-dark md:text-5xl">
            We&apos;d love to hear from you
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-dark/80">
            Share a custom brief, ask about candle care, or just say hello. We reply within one business day.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Information Cards */}
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-3xl border border-brand/10 bg-white/90 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-brand-light p-3">
                  <EnvelopeIcon className="h-6 w-6 text-brand" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark">Email</h3>
                  <a
                    href="mailto:contact@candlesandcuddles.com"
                    className="mt-1 block text-sm text-brand-dark/70 hover:text-brand transition"
                  >
                    contact@candlesandcuddles.com
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-brand/10 bg-white/90 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-brand-light p-3">
                  <ClockIcon className="h-6 w-6 text-brand" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark">Business Hours</h3>
                  <p className="mt-1 text-sm text-brand-dark/70">
                    Monday - Friday
                    <br />
                    9:00 AM - 5:00 PM EST
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-brand/10 bg-white/90 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-brand-light p-3">
                  <MapPinIcon className="h-6 w-6 text-brand" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-dark">Response Time</h3>
                  <p className="mt-1 text-sm text-brand-dark/70">
                    We typically respond within 24 hours during business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="rounded-3xl border border-brand/10 bg-white/90 p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-brand-dark">Follow Us</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://instagram.com/candlesandcuddles"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-brand/20 px-4 py-2 text-sm font-medium text-brand-dark transition hover:border-brand hover:bg-brand-light/30"
                >
                  Instagram
                </a>
                <a
                  href="https://pinterest.com/candlesandcuddles"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-brand/20 px-4 py-2 text-sm font-medium text-brand-dark transition hover:border-brand hover:bg-brand-light/30"
                >
                  Pinterest
                </a>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            {success ? (
              <div className="animate-slide-down rounded-3xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
                <CheckCircleIcon className="mx-auto h-16 w-16 text-green-600" />
                <h2 className="mt-4 font-display text-2xl text-green-800">Message sent!</h2>
                <p className="mt-2 text-green-700">
                  Thank you for reaching out. We&apos;ll get back to you within one business day.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-brand/10 bg-white/90 p-8 shadow-inner ring-1 ring-brand-light/80"
              >
                {error && (
                  <div className="mb-6 animate-slide-down rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Name Field */}
        <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-semibold text-brand-dark">
            Your Name
          </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <UserIcon className="h-5 w-5 text-brand-dark/40" />
                      </div>
          <input
            id="name"
                        type="text"
                        className="w-full rounded-2xl border border-brand/20 bg-white py-3 pl-10 pr-4 text-gray-700 transition placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            placeholder="Aanya Kapoor"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
                  </div>

                  {/* Email Field */}
        <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-brand-dark">
            Your Email
          </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <EnvelopeIcon className="h-5 w-5 text-brand-dark/40" />
                      </div>
          <input
            id="email"
            type="email"
                        className="w-full rounded-2xl border border-brand/20 bg-white py-3 pl-10 pr-4 text-gray-700 transition placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
                  </div>

                  {/* Phone Field */}
        <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-brand-dark">
                      Phone Number <span className="text-brand-dark/50 font-normal">(Optional)</span>
          </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <PhoneIcon className="h-5 w-5 text-brand-dark/40" />
                      </div>
          <input
            id="phone"
                        type="tel"
                        className="w-full rounded-2xl border border-brand/20 bg-white py-3 pl-10 pr-4 text-gray-700 transition placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
                  </div>

                  {/* Message Field */}
        <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-semibold text-brand-dark">
            Your Message
          </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-3 top-3">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-brand-dark/40" />
                      </div>
          <textarea
            id="message"
                        rows={6}
                        className="w-full rounded-2xl border border-brand/20 bg-white py-3 pl-10 pr-4 text-gray-700 transition placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        placeholder="Tell us about your inquiry, custom order ideas, candle care questions, or anything else you'd like to share..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
          />
        </div>
          </div>

                  {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
                    className="w-full rounded-full bg-brand px-8 py-4 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
              Sending...
            </span>
          ) : (
            'Send Message'
          )}
        </button>
        </div>
      </form>
            )}
    </div>
      </div>
    </div>
    </section>
  );
};
