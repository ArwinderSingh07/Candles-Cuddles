export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  stock: number;
}

export interface OrderPayload {
  user: {
    name: string;
    email: string;
    phone?: string;
  };
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

