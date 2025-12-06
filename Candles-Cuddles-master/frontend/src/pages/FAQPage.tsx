import { useMemo, useState } from 'react';
import { faqs } from '../data/faqs';

export const FAQPage = () => {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return faqs;
    const query = search.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-dark/60">
          Need clarity?
        </p>
        <h1 className="mt-3 font-display text-4xl text-brand-dark sm:text-5xl">Frequently Asked Questions</h1>
        <p className="mt-4 text-sm text-brand-dark/70 sm:text-base">
          Short on time? Start here. These are the questions we hear most often about candles, custom orders, and shipping.
        </p>
      </div>

      {/* Helper cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand/10 bg-white/80 p-4 text-left shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark/60">
            New to Candles &amp; Cuddles?
          </p>
          <p className="mt-2 text-sm font-medium text-brand-dark">Start with ordering &amp; shipping</p>
          <p className="mt-1 text-xs text-brand-dark/60">
            Learn how delivery works, timelines, and payment options.
          </p>
        </div>
        <div className="rounded-2xl border border-brand/10 bg-white/80 p-4 text-left shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark/60">
            Custom briefs
          </p>
          <p className="mt-2 text-sm font-medium text-brand-dark">See custom order FAQs</p>
          <p className="mt-1 text-xs text-brand-dark/60">
            Perfect if you're planning weddings, gifting or brand drops.
          </p>
        </div>
        <div className="rounded-2xl border border-brand/10 bg-white/80 p-4 text-left shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark/60">
            Something specific?
          </p>
          <p className="mt-2 text-sm font-medium text-brand-dark">Try searching your question</p>
          <p className="mt-1 text-xs text-brand-dark/60">
            Type a keyword like &ldquo;shipping&rdquo; or &ldquo;refund&rdquo; below.
          </p>
        </div>
      </div>

      {/* Search + FAQ list */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          {/* Search */}
          <div className="flex items-center gap-3 rounded-full border border-brand/20 bg-white/80 px-4 py-2 shadow-sm">
            <span className="text-brand-dark/60">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FAQs (e.g. shipping, custom order, gifts)"
              className="h-9 flex-1 border-none bg-transparent text-sm text-brand-dark placeholder:text-brand-dark/40 focus:outline-none focus:ring-0"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs font-semibold text-brand-dark/60 hover:text-brand-dark"
              >
                Clear
              </button>
            )}
          </div>

          {/* FAQ list */}
          <div className="mt-6 divide-y divide-brand/10 overflow-hidden rounded-3xl bg-white shadow">
            {filteredFaqs.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-brand-dark/70">
                We couldn&rsquo;t find an answer for that keyword yet.
                <br />
                <span className="mt-1 inline-block">
                  You can always reach us via the contact form or WhatsApp for a quick response.
                </span>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <button
                    key={faq.question}
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left transition hover:bg-brand-light/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-brand-dark">{faq.question}</p>
                        {isOpen && (
                          <p className="mt-2 text-sm leading-relaxed text-brand-dark/80">{faq.answer}</p>
                        )}
                      </div>
                      <span
                        className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold transition ${
                          isOpen
                            ? 'border-brand bg-brand text-white shadow-sm'
                            : 'border-brand/30 bg-white text-brand'
                        }`}
                        aria-hidden="true"
                      >
                        {isOpen ? '−' : '+'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Still need help card */}
        <aside className="space-y-4 rounded-3xl border border-brand/10 bg-white/90 p-6 shadow-sm">
          <h2 className="font-display text-lg text-brand-dark">Still need help?</h2>
          <p className="text-sm text-brand-dark/75">
            If your question isn&rsquo;t covered here, we&rsquo;re happy to help over email or WhatsApp.
          </p>
          <ul className="space-y-2 text-sm text-brand-dark/80">
            <li>• Customising scents, colours, or packaging for events</li>
            <li>• Bulk / corporate gifting requirements</li>
            <li>• Order updates, delivery issues, or refunds</li>
          </ul>
          <div className="space-y-2 text-sm">
            <a
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-full bg-brand px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-brand-dark"
            >
              Go to Contact Page
            </a>
            <p className="text-xs text-brand-dark/60">
              We usually respond within 24 hours on business days.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
};

