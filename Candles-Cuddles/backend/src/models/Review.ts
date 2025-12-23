import { Schema, model, Document } from 'mongoose';

export interface ReviewDocument extends Document {
  productId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1-5
  comment: string;
  verifiedPurchase: boolean; // Whether the customer actually purchased this product
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    productId: { type: String, required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    verifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Ensure one review per customer per product
reviewSchema.index({ productId: 1, customerId: 1 }, { unique: true });

export const ReviewModel = model<ReviewDocument>('Review', reviewSchema);

