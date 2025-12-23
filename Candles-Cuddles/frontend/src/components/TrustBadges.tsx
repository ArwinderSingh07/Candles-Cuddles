export const TrustBadges = () => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="flex flex-col items-center rounded-xl border border-brand/10 bg-white/50 p-4 text-center">
        <div className="text-3xl">🚚</div>
        <p className="mt-2 text-xs font-semibold text-brand-dark">Free Shipping</p>
        <p className="mt-1 text-xs text-brand-dark/60">Pan-India</p>
      </div>
      <div className="flex flex-col items-center rounded-xl border border-brand/10 bg-white/50 p-4 text-center">
        <div className="text-3xl">🔒</div>
        <p className="mt-2 text-xs font-semibold text-brand-dark">Secure Payment</p>
        <p className="mt-1 text-xs text-brand-dark/60">Razorpay Protected</p>
      </div>
      <div className="flex flex-col items-center rounded-xl border border-brand/10 bg-white/50 p-4 text-center">
        <div className="text-3xl">↩️</div>
        <p className="mt-2 text-xs font-semibold text-brand-dark">Easy Returns</p>
        <p className="mt-1 text-xs text-brand-dark/60">7-Day Policy</p>
      </div>
      <div className="flex flex-col items-center rounded-xl border border-brand/10 bg-white/50 p-4 text-center">
        <div className="text-3xl">💚</div>
        <p className="mt-2 text-xs font-semibold text-brand-dark">Eco-Friendly</p>
        <p className="mt-1 text-xs text-brand-dark/60">Sustainable</p>
      </div>
    </div>
  );
};

