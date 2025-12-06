import api from './client';
import type { Customer, Address, PaymentMethod, Order } from '../types';

export const upsertCustomer = async (payload: Partial<Customer> & { email: string; name: string }) => {
  const { data } = await api.post<Customer>('/customers', payload);
  return data;
};

export const getCustomer = async (id: string) => {
  const { data } = await api.get<Customer>(`/customers/${id}`);
  return data;
};

export const updateCustomer = async (id: string, payload: Partial<Customer>) => {
  const { data } = await api.patch<Customer>(`/customers/${id}`, payload);
  return data;
};

export const updateAddresses = async (id: string, addresses: Address[]) => {
  const { data } = await api.put<Customer>(`/customers/${id}/addresses`, { addresses });
  return data;
};

export const updatePaymentMethods = async (id: string, paymentMethods: PaymentMethod[]) => {
  const { data } = await api.put<Customer>(`/customers/${id}/payment-methods`, { paymentMethods });
  return data;
};

export const getCustomerOrders = async (id: string) => {
  const { data } = await api.get<Order[]>(`/customers/${id}/orders`);
  return data;
};
