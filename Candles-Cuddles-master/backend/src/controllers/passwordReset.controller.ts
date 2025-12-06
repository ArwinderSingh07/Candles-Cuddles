import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { CustomerModel } from '../models/Customer';
import { PasswordResetModel } from '../models/PasswordReset';
import { sendPasswordResetOTP } from '../lib/email';
import { logger } from '../config/logger';

const requestResetSchema = z.object({
  email: z.string().email(),
});

const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const parsed = requestResetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const email = parsed.data.email.toLowerCase();

  // Check if customer exists
  const customer = await CustomerModel.findOne({ email });
  if (!customer) {
    // Don't reveal if email exists or not (security best practice)
    return res.json({ message: 'If an account exists with this email, a password reset OTP has been sent.' });
  }

  // Check if customer has a password set
  if (!customer.passwordHash) {
    return res.status(400).json({ message: 'Account not set up with password. Please sign up again.' });
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate any existing OTPs for this email
  await PasswordResetModel.updateMany({ email, used: false }, { used: true });

  // Save new OTP
  await PasswordResetModel.create({
    email,
    otp,
    expiresAt,
    used: false,
  });

  // Send email
  try {
    await sendPasswordResetOTP(email, otp, customer.name);
    logger.info({ email }, 'Password reset OTP sent');
  } catch (error) {
    logger.error({ error, email }, 'Failed to send password reset OTP');
    // Don't reveal email sending failure to user
    return res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
  }

  res.json({ message: 'If an account exists with this email, a password reset OTP has been sent.' });
};

export const verifyOTPAndResetPassword = async (req: Request, res: Response) => {
  const parsed = verifyOTPSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const { email, otp, newPassword } = parsed.data;
  const emailLower = email.toLowerCase();

  // Find valid OTP
  const resetRecord = await PasswordResetModel.findOne({
    email: emailLower,
    otp,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRecord) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // Find customer
  const customer = await CustomerModel.findOne({ email: emailLower });
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update customer password
  customer.passwordHash = passwordHash;
  await customer.save();

  // Mark OTP as used
  resetRecord.used = true;
  await resetRecord.save();

  logger.info({ email: emailLower }, 'Password reset successful');

  res.json({ message: 'Password reset successfully. You can now sign in with your new password.' });
};

