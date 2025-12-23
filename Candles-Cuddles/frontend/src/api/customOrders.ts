import api from './client';

export interface CustomOrderData {
  name: string;
  email: string;
  theme: string;
  message: string;
  referenceImageUrl?: string;
}

export const submitCustomOrder = async (data: CustomOrderData) => {
  const { data: response } = await api.post<{ message: string; orderId: string }>('/custom-orders', data);
  return response;
};

