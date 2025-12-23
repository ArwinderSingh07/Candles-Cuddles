import { Request, Response } from 'express';
import { z } from 'zod';
import { NewsletterModel } from '../models/Newsletter';
import { sendNewsletterWelcomeEmail } from '../lib/email';
import { logger } from '../config/logger';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const subscribeNewsletter = async (req: Request, res: Response) => {
  const parsed = subscribeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues });
  }

  const email = parsed.data.email.toLowerCase();

  try {
    // Check if already subscribed
    const existing = await NewsletterModel.findOne({ email });
    if (existing && existing.subscribed) {
      return res.json({ message: 'You are already subscribed to our newsletter!' });
    }

    // Subscribe or resubscribe
    const subscriber = await NewsletterModel.findOneAndUpdate(
      { email },
      {
        email,
        subscribed: true,
        subscribedAt: new Date(),
        $unset: { unsubscribedAt: 1 },
      },
      { upsert: true, new: true },
    );

    // Send welcome email
    try {
      await sendNewsletterWelcomeEmail(email);
      logger.info({ email }, 'Newsletter welcome email sent');
    } catch (emailError) {
      logger.error({ error: emailError, email }, 'Failed to send newsletter welcome email');
    }

    logger.info({ email }, 'Newsletter subscription successful');
    res.json({ message: 'Successfully subscribed to our newsletter!' });
  } catch (error) {
    logger.error({ error, email }, 'Failed to subscribe to newsletter');
    res.status(500).json({ message: 'Failed to subscribe. Please try again later.' });
  }
};

export const unsubscribeNewsletter = async (req: Request, res: Response) => {
  const email = req.query.email || req.body.email;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    await NewsletterModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        subscribed: false,
        unsubscribedAt: new Date(),
      },
    );

    logger.info({ email }, 'Newsletter unsubscription successful');
    res.json({ message: 'Successfully unsubscribed from our newsletter.' });
  } catch (error) {
    logger.error({ error, email }, 'Failed to unsubscribe from newsletter');
    res.status(500).json({ message: 'Failed to unsubscribe. Please try again later.' });
  }
};

