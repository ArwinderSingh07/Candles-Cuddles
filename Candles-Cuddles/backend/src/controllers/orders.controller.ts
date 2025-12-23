import { Request, Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { OrderModel } from '../models/Order';
import { hydrateItems, markOrderStatus } from '../services/order.service';
import { createRazorpayOrder, verifyCheckoutSignature, isRazorpayConfigured } from '../services/razorpay.service';
import { sendOrderConfirmationEmail } from '../lib/email';
import { logger } from '../config/logger';
import { env } from '../config/env';

const createOrderSchema = z.object({
  customerId: z.string().optional(),
  user: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        productId: z.string(),
        qty: z.number().int().positive(),
      }),
    )
    .min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const verifySchema = z.object({
  orderId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export const createOrder = async (req: Request, res: Response) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  let items;
  let amount;
  try {
    const hydrated = await hydrateItems(parsed.data.items);
    items = hydrated.items;
    amount = hydrated.amount;
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
  if (amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });

  const customerId = parsed.data.customerId && Types.ObjectId.isValid(parsed.data.customerId) ? parsed.data.customerId : undefined;

  const order = await OrderModel.create({
    customerId,
    user: parsed.data.user,
    items,
    amount,
    currency: 'INR',
    metadata: parsed.data.metadata,
    status: 'pending',
  });

  // Only create Razorpay order if Razorpay is configured
  if (isRazorpayConfigured()) {
    try {
      const razorpayOrder = await createRazorpayOrder({
        amount,
        currency: 'INR',
        receipt: order._id.toString(),
      });

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      res.status(201).json({
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount,
        currency: 'INR',
        key: env.RAZORPAY_KEY_ID || '',
      });
    } catch (error) {
      // If Razorpay fails, still save the order but mark it appropriately
      logger.error({ error }, 'Failed to create Razorpay order');
      order.status = 'pending_payment_setup';
      await order.save();
      res.status(500).json({
        message: 'Payment gateway not available. Order created but payment setup failed.',
        orderId: order._id,
      });
    }
  } else {
    // Razorpay not configured - return order without payment gateway info
    await order.save();
    res.status(201).json({
      orderId: order._id,
      amount,
      currency: 'INR',
      message: 'Razorpay not configured. Order created but payment gateway unavailable.',
    });
  }
};

export const verifyOrder = async (req: Request, res: Response) => {
  if (!isRazorpayConfigured()) {
    return res.status(503).json({ message: 'Payment gateway not configured' });
  }

  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const order = await OrderModel.findById(parsed.data.orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status === 'paid' || order.status === 'captured') {
    return res.json({ message: 'Order already processed' });
  }
  if (order.razorpayOrderId !== parsed.data.razorpayOrderId) {
    return res.status(400).json({ message: 'Order mismatch' });
  }

  const isValid = verifyCheckoutSignature({
    razorpayOrderId: parsed.data.razorpayOrderId,
    razorpayPaymentId: parsed.data.razorpayPaymentId,
    signature: parsed.data.razorpaySignature,
  });

  if (!isValid) return res.status(400).json({ message: 'Invalid signature' });

  order.status = 'captured';
  order.razorpayPaymentId = parsed.data.razorpayPaymentId;
  order.razorpaySignature = parsed.data.razorpaySignature;
  await order.save();

  // Send order confirmation email (don't fail the request if email fails)
  try {
    await sendOrderConfirmationEmail(
      order.user.email,
      order.user.name,
      order._id.toString(),
      order.items.map((item) => ({
        title: item.title || 'Product',
        qty: item.qty,
        price: item.price,
      })),
      order.amount,
    );
  } catch (emailError) {
    logger.error({ error: emailError, orderId: order._id }, 'Failed to send order confirmation email');
  }

  res.json({ message: 'Order verified', order });
};

export const listOrders = async (req: Request, res: Response) => {
  // Optionally filter out old pending orders (older than 24 hours)
  const hideOldPending = req.query.hideOldPending === 'true';
  
  let query: any = {};
  if (hideOldPending) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    query = {
      $or: [
        { status: { $ne: 'pending' } }, // Not pending
        { createdAt: { $gte: oneDayAgo } }, // Or pending but recent
      ],
    };
  }
  
  const orders = await OrderModel.find(query).sort({ createdAt: -1 }).limit(100);
  res.json(orders);
};

export const adminUpdateOrderStatus = async (req: Request, res: Response) => {
  const schema = z.object({
    status: z.enum(['pending', 'paid', 'captured', 'failed', 'cancelled']),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const order = await markOrderStatus(req.params.id, parsed.data.status);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

export const deleteOrder = async (req: Request, res: Response) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Only allow deleting pending or failed orders
  if (order.status !== 'pending' && order.status !== 'failed') {
    return res.status(400).json({ message: 'Can only delete pending or failed orders' });
  }

  await OrderModel.findByIdAndDelete(req.params.id);
  res.json({ message: 'Order deleted successfully' });
};
