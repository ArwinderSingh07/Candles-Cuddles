import { Request, Response } from 'express';
import { verifyWebhookSignature } from '../services/razorpay.service';
import { OrderModel } from '../models/Order';
import { logger } from '../config/logger';

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'];
  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ message: 'Missing signature' });
  }

  const payload = req.rawBody;
  if (!payload) return res.status(400).json({ message: 'Missing raw body' });

  const isValid = verifyWebhookSignature(payload, signature);
  if (!isValid) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  const event = req.body;
  const razorpayOrderId = event?.payload?.payment?.entity?.order_id;
  if (!razorpayOrderId) {
    logger.warn({ event }, 'Webhook missing order id');
    return res.status(202).json({ message: 'No order to reconcile' });
  }

  const order = await OrderModel.findOne({ razorpayOrderId });
  if (!order) {
    logger.warn({ event }, 'Order not found for webhook');
    return res.status(202).json({ message: 'Order not found' });
  }

  const status = event?.event === 'payment.captured' ? 'captured' : event?.event === 'payment.failed' ? 'failed' : order.status;
  order.status = status;
  order.metadata = {
    ...order.metadata,
    webhookPayload: event,
  };
  await order.save();

  res.json({ message: 'Webhook processed' });
};

