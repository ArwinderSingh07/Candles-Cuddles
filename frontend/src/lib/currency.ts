export const formatINR = (amount: number) =>
  (amount / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

