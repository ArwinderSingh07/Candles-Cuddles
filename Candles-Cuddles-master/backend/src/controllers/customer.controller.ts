import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { CustomerModel } from '../models/Customer';
import { OrderModel } from '../models/Order';

const addressSchema = z.object({
  label: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string(),
  country: z.string(),
  isDefault: z.boolean().optional(),
});

const paymentMethodSchema = z.object({
  methodType: z.enum(['card', 'upi', 'wallet', 'netbanking']),
  brand: z.string(),
  last4: z.string().min(4).max(4).optional(),
  expiryMonth: z.number().min(1).max(12).optional(),
  expiryYear: z.number().min(new Date().getFullYear()).max(new Date().getFullYear() + 15).optional(),
  token: z.string().optional(),
  upiHandle: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const baseProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_say']).optional(),
  dob: z.string().datetime().optional(),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const createOrUpdateCustomer = async (req: Request, res: Response) => {
  const schema = baseProfileSchema.extend({
    addresses: z.array(addressSchema).optional(),
    paymentMethods: z.array(paymentMethodSchema).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const { dob, password, ...rest } = parsed.data;
  
  // Hash password if provided
  let passwordHash: string | undefined;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  const updateData: any = {
    ...rest,
    ...(dob ? { dob: new Date(dob) } : {}),
    updatedAt: new Date(),
  };
  
  if (passwordHash) {
    updateData.passwordHash = passwordHash;
  }

  const customer = await CustomerModel.findOneAndUpdate(
    { email: parsed.data.email },
    updateData,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // Remove passwordHash from response
  const customerObj = customer.toObject();
  delete customerObj.passwordHash;
  
  res.status(201).json(customerObj);
};

export const getCustomer = async (req: Request, res: Response) => {
  const customer = await CustomerModel.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  
  // Remove passwordHash from response
  const customerObj = customer.toObject();
  delete customerObj.passwordHash;
  
  res.json(customerObj);
};

export const getCustomerByEmail = async (req: Request, res: Response) => {
  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' });
  }
  const customer = await CustomerModel.findOne({ email: email.toLowerCase() });
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  
  // Remove passwordHash from response
  const customerObj = customer.toObject();
  delete customerObj.passwordHash;
  
  res.json(customerObj);
};

export const signInCustomer = async (req: Request, res: Response) => {
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const customer = await CustomerModel.findOne({ email: parsed.data.email.toLowerCase() });
  if (!customer) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Check if customer has a password set
  if (!customer.passwordHash) {
    return res.status(401).json({ message: 'Account not set up with password. Please sign up again.' });
  }

  // Verify password
  const isValid = await bcrypt.compare(parsed.data.password, customer.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Remove passwordHash from response
  const customerObj = customer.toObject();
  delete customerObj.passwordHash;

  res.json(customerObj);
};

export const updateCustomer = async (req: Request, res: Response) => {
  const parsed = baseProfileSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const { dob, password, ...rest } = parsed.data;
  
  const updateData: any = {
    ...rest,
    ...(dob ? { dob: new Date(dob) } : {}),
    updatedAt: new Date(),
  };
  
  // Hash password if provided
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  const customer = await CustomerModel.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true },
  );
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  
  // Remove passwordHash from response
  const customerObj = customer.toObject();
  delete customerObj.passwordHash;
  
  res.json(customerObj);
};

export const updateCustomerAddresses = async (req: Request, res: Response) => {
  const parsed = z.array(addressSchema).safeParse(req.body.addresses);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const customer = await CustomerModel.findByIdAndUpdate(
    req.params.id,
    { addresses: parsed.data, updatedAt: new Date() },
    { new: true },
  );
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
};

export const updateCustomerPaymentMethods = async (req: Request, res: Response) => {
  const parsed = z.array(paymentMethodSchema).safeParse(req.body.paymentMethods);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const customer = await CustomerModel.findByIdAndUpdate(
    req.params.id,
    { paymentMethods: parsed.data, updatedAt: new Date() },
    { new: true },
  );
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
};

export const getCustomerOrders = async (req: Request, res: Response) => {
  const customer = await CustomerModel.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  const orders = await OrderModel.find({ customerId: customer._id }).sort({ createdAt: -1 }).limit(50);
  res.json(orders);
};

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const changePassword = async (req: Request, res: Response) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const customer = await CustomerModel.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  // Check if customer has a password set
  if (!customer.passwordHash) {
    return res.status(400).json({ message: 'Account not set up with password. Please set a password first.' });
  }

  // Verify current password
  const isValid = await bcrypt.compare(parsed.data.currentPassword, customer.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  // Check if new password is different from current password
  const isSamePassword = await bcrypt.compare(parsed.data.newPassword, customer.passwordHash);
  if (isSamePassword) {
    return res.status(400).json({ message: 'New password must be different from current password' });
  }

  // Hash and update password
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  customer.passwordHash = passwordHash;
  customer.updatedAt = new Date();
  await customer.save();

  res.json({ message: 'Password changed successfully' });
};
