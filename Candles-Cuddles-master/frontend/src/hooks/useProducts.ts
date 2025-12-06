import { useQuery } from '@tanstack/react-query';
import { fetchProducts, getProducts, fetchProductById, type ProductFilters } from '../api/products';
import type { Product } from '../types';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery<Product[]>({
    queryKey: ['products', filters],
    queryFn: () => (filters ? getProducts(filters) : fetchProducts()),
  });
};

export const useProduct = (id?: string) =>
  useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: Boolean(id),
  });
