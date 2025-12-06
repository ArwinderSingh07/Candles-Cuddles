import rateLimit from 'express-rate-limit';

export const createRateLimiter = (options?: { windowMs?: number; max?: number }) =>
  rateLimit({
    windowMs: options?.windowMs ?? 15 * 60 * 1000,
    max: options?.max ?? 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

