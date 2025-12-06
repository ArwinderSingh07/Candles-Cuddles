import api from './client';

export const subscribeNewsletter = async (email: string) => {
  const { data } = await api.post<{ message: string }>('/newsletter/subscribe', { email });
  return data;
};

export const unsubscribeNewsletter = async (email: string) => {
  const { data } = await api.post<{ message: string }>('/newsletter/unsubscribe', null, { params: { email } });
  return data;
};

