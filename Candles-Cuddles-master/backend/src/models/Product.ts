import { Schema, model, Document } from 'mongoose';

export interface ProductDocument extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  stock: number;
  active: boolean;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

const productSchema = new Schema<ProductDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    images: { type: [String], default: [] },
    stock: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    category: { type: String, index: true },
    tags: { type: [String], default: [], index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const ProductModel = model<ProductDocument>('Product', productSchema);

