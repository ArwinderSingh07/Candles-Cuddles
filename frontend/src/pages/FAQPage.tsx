import { faqs } from '../data/faqs';

export const FAQPage = () => (
  <section className="mx-auto max-w-3xl px-6 py-16">
    <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/60">Need clarity?</p>
    <h1 className="mt-2 font-display text-4xl text-brand-dark">FAQ</h1>
    <div className="mt-8 divide-y divide-brand/10 rounded-3xl bg-white shadow">
      {faqs.map((faq) => (
        <details key={faq.question} className="group p-6">
          <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-brand-dark marker:content-none">
            {faq.question}
            <span className="text-brand">{'+'}</span>
          </summary>
          <p className="mt-3 text-brand-dark/80">{faq.answer}</p>
        </details>
      ))}
    </div>
  </section>
);

