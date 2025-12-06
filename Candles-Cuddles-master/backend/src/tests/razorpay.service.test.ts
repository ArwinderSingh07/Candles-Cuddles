import crypto from 'crypto';
import { verifyCheckoutSignature, verifyWebhookSignature } from '../services/razorpay.service';

describe('Razorpay signature helpers', () => {
  it('validates checkout signatures', () => {
    const orderId = 'order_123';
    const paymentId = 'pay_123';
    const signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(`${orderId}|${paymentId}`).digest('hex');

    expect(
      verifyCheckoutSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        signature,
      }),
    ).toBe(true);
  });

  it('validates webhook payload', () => {
    const payload = JSON.stringify({ id: 'evt_1' });
    const signature = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!).update(payload).digest('hex');

    expect(verifyWebhookSignature(payload, signature)).toBe(true);
  });
});

