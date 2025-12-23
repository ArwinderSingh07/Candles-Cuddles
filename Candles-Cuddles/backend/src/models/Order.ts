import { Schema, model, Document } from 'mongoose';

interface OrderItem {
  productId: string;
  title: string;
  qty: number;
  price: number;
}

export interface OrderDocument extends Document {
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  customerId?: string;
  items: OrderItem[];
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'pending' | 'paid' | 'captured' | 'failed';
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const orderSchema = new Schema<OrderDocument>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    user: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    items: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: { type: String, enum: ['pending', 'paid', 'captured', 'failed', 'cancelled'], default: 'pending' },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const OrderModel = model<OrderDocument>('Order', orderSchema);

