import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getAdminToken } from '../api/admin';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const token = getAdminToken();

  useEffect(() => {
    if (!token) {
      // Redirect to login if no token
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

