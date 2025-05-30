import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute state:', {
    isAuthenticated,
    loading,
    user,
    requireAdmin,
    path: location.pathname
  });

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If admin access is required but user is not admin
  if (requireAdmin && user.role !== 'admin') {
    console.log('Admin access required but user is not admin');
    return <Navigate to="/" replace />;
  }

  // If we get here, the user is authenticated and has the required role
  console.log('Access granted to protected route');
  return <>{children}</>;
};

export default ProtectedRoute;