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
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

export const listProducts = async (req: Request, res: Response) => {
  const { search, category, minPrice, maxPrice, sortBy = 'newest' } = req.query;
  
  const query: any = { active: true };
  
  // Search filter
  if (search && typeof search === 'string') {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }
  
  // Category filter
  if (category && typeof category === 'string') {
    query.category = category;
  }
  
  // Price filters
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  
  // Sorting
  let sort: any = { createdAt: -1 }; // default: newest first
  if (sortBy === 'price-low') sort = { price: 1 };
  if (sortBy === 'price-high') sort = { price: -1 };
  if (sortBy === 'name') sort = { title: 1 };
  if (sortBy === 'newest') sort = { createdAt: -1 };
  
  const products = await ProductModel.find(query).sort(sort);
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

export const adminListProducts = async (_req: Request, res: Response) => {
  // Return all products (including inactive) for admin
  const products = await ProductModel.find().sort({ createdAt: -1 });
  res.json(products);
};

