import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (params: { amount: number; currency: string; receipt: string }) => {
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
  const hmac = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  const digest = hmac.digest('hex');
  return digest === signature;
};

export const verifyWebhookSignature = (payload: string, signature: string) => {
  const hmac = crypto.createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  return digest === signature;
};

