import { Request, Response } from 'express';
import { z } from 'zod';
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
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_say']).optional(),
  dob: z.string().datetime().optional(),
});

export const createOrUpdateCustomer = async (req: Request, res: Response) => {
  const schema = baseProfileSchema.extend({
    addresses: z.array(addressSchema).optional(),
    paymentMethods: z.array(paymentMethodSchema).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const { dob, ...rest } = parsed.data;
  const customer = await CustomerModel.findOneAndUpdate(
    { email: parsed.data.email },
    { ...rest, ...(dob ? { dob: new Date(dob) } : {}), updatedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res.status(201).json(customer);
};

export const getCustomer = async (req: Request, res: Response) => {
  const customer = await CustomerModel.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
};

export const updateCustomer = async (req: Request, res: Response) => {
  const parsed = baseProfileSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const { dob, ...rest } = parsed.data;
  const customer = await CustomerModel.findByIdAndUpdate(
    req.params.id,
    { ...rest, ...(dob ? { dob: new Date(dob) } : {}), updatedAt: new Date() },
    { new: true },
  );
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
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
