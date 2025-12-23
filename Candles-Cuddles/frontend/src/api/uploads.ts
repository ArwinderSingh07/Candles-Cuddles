import api from './client';
import type { PresignResponse } from '../types';

export const requestPresignedUrl = async (contentType: string) => {
  const { data } = await api.post<PresignResponse>('/uploads/presign', { contentType });
  return data;
};

