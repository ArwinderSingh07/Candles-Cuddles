import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'RAZORPAY_WEBHOOK_SECRET is required'),
  FRONTEND_URL: z.string().min(1, 'FRONTEND_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  S3_BUCKET: z.string().min(1, 'S3_BUCKET is required'),
  S3_REGION: z.string().min(1, 'S3_REGION is required'),
  SENTRY_DSN: z.string().optional(),
  REDIS_URL: z.string().optional(),
  ALLOWED_ORIGINS: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_REGION: process.env.S3_REGION,
  SENTRY_DSN: process.env.SENTRY_DSN,
  REDIS_URL: process.env.REDIS_URL,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
});

if (!parsed.success) {
  console.error('❌ Invalid environment configuration', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const isDev = env.NODE_ENV === 'development';

