import api from './client';
import type { Product } from '../types';

export const fetchProducts = async () => {
  const { data } = await api.get<Product[]>('/products');
  return data;
};

export const fetchProductById = async (id: string) => {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
};

