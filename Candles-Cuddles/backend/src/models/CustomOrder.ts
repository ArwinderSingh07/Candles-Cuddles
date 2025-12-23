import { Schema, model, Document } from 'mongoose';

export interface CustomOrderDocument extends Document {
  name: string;
  email: string;
  theme: string;
  message: string;
  referenceImageUrl?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const customOrderSchema = new Schema<CustomOrderDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    theme: { type: String, required: true },
    message: { type: String, required: true },
    referenceImageUrl: { type: String },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true },
);

export const CustomOrderModel = model<CustomOrderDocument>('CustomOrder', customOrderSchema);

