import api from './client';

export const requestPasswordReset = async (email: string) => {
  const { data } = await api.post<{ message: string }>('/customers/password/reset', { email });
  return data;
};

export const verifyOTPAndResetPassword = async (email: string, otp: string, newPassword: string) => {
  const { data } = await api.post<{ message: string }>('/customers/password/verify-otp', {
    email,
    otp,
    newPassword,
  });
  return data;
};

