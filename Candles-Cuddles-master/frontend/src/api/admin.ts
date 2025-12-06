import axios from 'axios';
import api from './client';
import type { Product, Order } from '../types';

// Store admin token in localStorage
const ADMIN_TOKEN_KEY = 'candles_admin_token';

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);
export const setAdminToken = (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token);
export const removeAdminToken = () => localStorage.removeItem(ADMIN_TOKEN_KEY);

// Create admin API client with token interceptor
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ?? error.message;
    // If unauthorized, clear token
    if (error.response?.status === 401) {
      removeAdminToken();
    }
    return Promise.reject(new Error(message));
  },
);

export interface AdminLoginResponse {
  token: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'staff';
}

// Admin Authentication
export const adminLogin = async (email: string, password: string) => {
  const { data } = await api.post<AdminLoginResponse>('/admin/login', { email, password });
  setAdminToken(data.token);
  return data;
};

export const adminLogout = () => {
  removeAdminToken();
};

// Products Management
export const adminGetProducts = async () => {
  const { data } = await adminApi.get<Product[]>('/admin/products');
  return data;
};

export const adminGetProduct = async (id: string) => {
  const { data } = await adminApi.get<Product>(`/products/${id}`);
  return data;
};

export const adminCreateProduct = async (product: Partial<Product>) => {
  const { data } = await adminApi.post<Product>('/admin/products', product);
  return data;
};

export const adminUpdateProduct = async (id: string, product: Partial<Product>) => {
  const { data } = await adminApi.patch<Product>(`/admin/products/${id}`, product);
  return data;
};

export const adminDeleteProduct = async (id: string) => {
  await adminApi.delete(`/admin/products/${id}`);
};

// Orders Management
export const adminGetOrders = async () => {
  const { data } = await adminApi.get<Order[]>('/admin/orders');
  return data;
};

export const adminUpdateOrderStatus = async (id: string, status: string) => {
  const { data } = await adminApi.patch<Order>(`/admin/orders/${id}/status`, { status });
  return data;
};

export const adminDeleteOrder = async (id: string) => {
  await adminApi.delete(`/admin/orders/${id}`);
};

// Analytics
export interface VisitorDetail {
  sessionId: string;
  firstVisit: string;
  lastVisit: string;
  pageViews: number;
  userId?: string;
  region?: string;
  country?: string;
  city?: string;
  userAgent?: string;
  paths: string[];
  userName?: string;
  userEmail?: string;
}

export interface TrafficMetrics {
  totalVisitors: number;
  pageViewsByDay: Array<{ date: string; views: number; uniqueVisitors: number }>;
  geographicBreakdown: Array<{ region?: string; country?: string; visitors: number; views: number }>;
  visitors: VisitorDetail[];
}

export interface ProductEngagement {
  products: Array<{
    productId: string;
    title: string;
    category?: string;
    views: number;
    uniqueViewers: number;
    cartAdditions: number;
    uniqueCartAdditions: number;
    salesQuantity: number;
    salesRevenue: number;
    salesOrderCount: number;
    conversionRate: number;
    cartToOrderRate: number;
  }>;
  summary: {
    totalProductViews: number;
    totalCartAdditions: number;
    totalSalesRevenue: number;
    totalSalesQuantity: number;
    totalSuccessfulOrders: number;
    averageConversionRate: number;
  };
}

export const getTrafficMetrics = async (params?: {
  startDate?: string;
  endDate?: string;
  region?: string;
}) => {
  const { data } = await adminApi.get<TrafficMetrics>('/admin/analytics/traffic', { params });
  return data;
};

export const getProductEngagement = async (params?: {
  startDate?: string;
  endDate?: string;
  category?: string;
}) => {
  const { data } = await adminApi.get<ProductEngagement>('/admin/analytics/products', { params });
  return data;
};

