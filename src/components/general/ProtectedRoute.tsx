import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;