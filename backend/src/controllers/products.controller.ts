import { Request, Response } from 'express';
import { z } from 'zod';
import { ProductModel } from '../models/Product';

const productBodySchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  price: z.number().int().positive(),
  currency: z.string().default('INR'),
  images: z.array(z.string()).default([]),
  stock: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const listProducts = async (_req: Request, res: Response) => {
  const products = await ProductModel.find({ active: true }).sort({ createdAt: -1 });
  res.json(products);
};

export const getProduct = async (req: Request, res: Response) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

export const adminCreateProduct = async (req: Request, res: Response) => {
  const parsed = productBodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });
  const product = await ProductModel.create(parsed.data as any);
  res.status(201).json(product);
};

export const adminUpdateProduct = async (req: Request, res: Response) => {
  const parsed = productBodySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const product = await ProductModel.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

export const adminDeleteProduct = async (req: Request, res: Response) => {
  const product = await ProductModel.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.status(204).send();
};

