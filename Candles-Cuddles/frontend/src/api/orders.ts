import api from './client';
import type { OrderPayload, OrderResponse } from '../types';

export const createOrder = async (payload: OrderPayload) => {
  const { data } = await api.post<OrderResponse>('/orders/create', payload);
  return data;
};

export const verifyOrder = async (payload: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) => {
  const { data } = await api.post('/orders/verify', payload);
  return data;
};

