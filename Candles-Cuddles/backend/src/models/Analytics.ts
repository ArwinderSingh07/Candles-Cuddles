import { Schema, model, Document } from 'mongoose';

export interface PageViewDocument extends Document {
  path: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
  country?: string;
  region?: string;
  city?: string;
  sessionId: string;
  userId?: string;
  timestamp: Date;
}

export interface ProductViewDocument extends Document {
  productId: string;
  sessionId: string;
  userId?: string;
  timestamp: Date;
}

export interface CartActionDocument extends Document {
  productId: string;
  action: 'add' | 'remove';
  sessionId: string;
  userId?: string;
  timestamp: Date;
}

const pageViewSchema = new Schema<PageViewDocument>(
  {
    path: { type: String, required: true, index: true },
    referrer: { type: String },
    userAgent: { type: String },
    ip: { type: String },
    country: { type: String, index: true },
    region: { type: String, index: true },
    city: { type: String },
    sessionId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Customer', index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

const productViewSchema = new Schema<ProductViewDocument>(
  {
    productId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Customer', index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

const cartActionSchema = new Schema<CartActionDocument>(
  {
    productId: { type: String, required: true, index: true },
    action: { type: String, enum: ['add', 'remove'], required: true },
    sessionId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Customer', index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const PageViewModel = model<PageViewDocument>('PageView', pageViewSchema);
export const ProductViewModel = model<ProductViewDocument>('ProductView', productViewSchema);
export const CartActionModel = model<CartActionDocument>('CartAction', cartActionSchema);

