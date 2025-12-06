import { Request, Response } from 'express';
import { z } from 'zod';
import { CustomOrderModel } from '../models/CustomOrder';
import { sendCustomOrderNotification } from '../lib/email';
import { logger } from '../config/logger';

const customOrderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  theme: z.string().min(1, 'Theme is required'),
  message: z.string().min(1, 'Message is required'),
  referenceImageUrl: z.string().url().optional(),
});

export const submitCustomOrder = async (req: Request, res: Response) => {
  const parsed = customOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues });
  }

  const { name, email, theme, message, referenceImageUrl } = parsed.data;

  try {
    // Save to database
    const customOrder = await CustomOrderModel.create({
      name,
      email,
      theme,
      message,
      referenceImageUrl,
      status: 'pending',
    });

    // Send email notification
    try {
      await sendCustomOrderNotification(name, email, theme, message, referenceImageUrl, customOrder._id.toString());
      logger.info({ customOrderId: customOrder._id, email }, 'Custom order notification email sent');
    } catch (emailError) {
      // Log email error but don't fail the request
      logger.error({ error: emailError, customOrderId: customOrder._id }, 'Failed to send custom order notification email');
    }

    logger.info({ customOrderId: customOrder._id, email }, 'Custom order submitted');
    res.json({
      message: 'Your custom order brief has been received! Our team will review it and get back to you soon.',
      orderId: customOrder._id,
    });
  } catch (error) {
    logger.error({ error, email }, 'Failed to submit custom order');
    res.status(500).json({ message: 'Failed to submit custom order. Please try again later.' });
  }
};

