import api from './client';
import type { Product } from '../types';

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'name';
}

export const fetchProducts = async () => {
  const { data } = await api.get<Product[]>('/products');
  return data;
};

export const getProducts = async (filters?: ProductFilters) => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  
  const { data } = await api.get<Product[]>(`/products?${params.toString()}`);
  return data;
};

export const fetchProductById = async (id: string) => {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
};

