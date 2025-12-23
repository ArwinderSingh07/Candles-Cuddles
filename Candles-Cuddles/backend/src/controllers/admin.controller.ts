import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AdminUserModel } from '../models/AdminUser';
import { env } from '../config/env';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'staff']).default('staff'),
});

export const adminLogin = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors });

  const user = await AdminUserModel.findOne({ email: parsed.data.email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ sub: user._id, role: user.role, email: user.email }, env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
};

export const createAdminUser = async (req: Request, res: Response) => {
  const parsed = createAdminSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors });

  const existing = await AdminUserModel.findOne({ email: parsed.data.email });
  if (existing) return res.status(409).json({ message: 'Admin already exists' });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await AdminUserModel.create({
    email: parsed.data.email,
    passwordHash,
    role: parsed.data.role,
  });

  res.status(201).json({ id: user._id, email: user.email, role: user.role });
};

