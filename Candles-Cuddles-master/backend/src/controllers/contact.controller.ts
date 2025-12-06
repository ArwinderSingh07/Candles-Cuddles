import { Request, Response } from 'express';
import { z } from 'zod';
import { sendContactEmail } from '../lib/email';
import { logger } from '../config/logger';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
});

export const submitContactForm = async (req: Request, res: Response) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues });
  }

  const { name, email, phone, message } = parsed.data;

  try {
    await sendContactEmail(name, email, phone, message);
    logger.info({ email, name }, 'Contact form submission received');
    res.json({ message: 'Thank you for your message! We will get back to you within one business day.' });
  } catch (error) {
    logger.error({ error, email }, 'Failed to send contact email');
    res.status(500).json({ message: 'Failed to send message. Please try again later or email us directly.' });
  }
};

