import { Request, Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { OrderModel } from '../models/Order';
import { hydrateItems, markOrderStatus } from '../services/order.service';
import { createRazorpayOrder, verifyCheckoutSignature } from '../services/razorpay.service';
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
    key: env.RAZORPAY_KEY_ID,
  });
};

export const verifyOrder = async (req: Request, res: Response) => {
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

  order.status = 'paid';
  order.razorpayPaymentId = parsed.data.razorpayPaymentId;
  order.razorpaySignature = parsed.data.razorpaySignature;
  await order.save();

  res.json({ message: 'Order verified', order });
};

export const listOrders = async (_req: Request, res: Response) => {
  const orders = await OrderModel.find().sort({ createdAt: -1 }).limit(100);
  res.json(orders);
};

export const adminUpdateOrderStatus = async (req: Request, res: Response) => {
  const schema = z.object({
    status: z.enum(['pending', 'paid', 'captured', 'failed']),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const order = await markOrderStatus(req.params.id, parsed.data.status);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};
