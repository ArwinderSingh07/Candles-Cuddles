export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  stock: number;
  active?: boolean;
  category?: string;
  tags?: string[];
  createdAt?: string;
}

export interface OrderPayload {
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  customerId?: string;
  items: Array<{
    productId: string;
    qty: number;
  }>;
}

export interface OrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
}

export interface Address {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  methodType: 'card' | 'upi' | 'wallet' | 'netbanking';
  brand: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  upiHandle?: string;
  token?: string;
  isDefault?: boolean;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_say';
  dob?: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id: string;
  orderId?: string;
  customerId?: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{ productId: string; title: string; qty: number; price: number }>;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'captured' | 'failed' | 'cancelled';
  createdAt: string;
}

