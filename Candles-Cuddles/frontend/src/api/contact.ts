import api from './client';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const submitContactForm = async (data: ContactFormData) => {
  const { data: response } = await api.post<{ message: string }>('/contact', data);
  return response;
};

