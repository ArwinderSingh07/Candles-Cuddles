import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';
import { logger } from '../config/logger';

// Initialize Razorpay only if credentials are provided
const razorpay = env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    })
  : null;

// Check if Razorpay is configured
export const isRazorpayConfigured = () => {
  return !!(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_WEBHOOK_SECRET);
};

export const createRazorpayOrder = async (params: { amount: number; currency: string; receipt: string }) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
  }
  return razorpay.orders.create({
    amount: params.amount,
    currency: params.currency,
    receipt: params.receipt,
    payment_capture: 1,
  });
};

export const verifyCheckoutSignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  signature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}) => {
  if (!env.RAZORPAY_KEY_SECRET) {
    logger.warn('Razorpay key secret not configured. Cannot verify signature.');
    return false;
  }
  const hmac = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  const digest = hmac.digest('hex');
  return digest === signature;
};

export const verifyWebhookSignature = (payload: string, signature: string) => {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    logger.warn('Razorpay webhook secret not configured. Cannot verify signature.');
    return false;
  }
  const hmac = crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  return digest === signature;
};

