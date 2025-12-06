import { Schema, model, Document } from 'mongoose';

interface Address {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

interface PaymentMethod {
  methodType: 'card' | 'upi' | 'wallet' | 'netbanking';
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  token?: string;
  upiHandle?: string;
  isDefault?: boolean;
}

export interface CustomerDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_say';
  dob?: Date;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<Address>(
  {
    label: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const paymentMethodSchema = new Schema<PaymentMethod>(
  {
    methodType: { type: String, enum: ['card', 'upi', 'wallet', 'netbanking'], required: true },
    brand: { type: String, required: true },
    last4: { type: String, required: true },
    expiryMonth: { type: Number, required: true },
    expiryYear: { type: Number, required: true },
    token: { type: String },
    upiHandle: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const customerSchema = new Schema<CustomerDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_say'] },
    dob: { type: Date },
    addresses: { type: [addressSchema], default: [] },
    paymentMethods: { type: [paymentMethodSchema], default: [] },
  },
  { timestamps: true },
);

export const CustomerModel = model<CustomerDocument>('Customer', customerSchema);
