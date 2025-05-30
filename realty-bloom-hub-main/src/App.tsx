import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/Home';
import PropertyDetails from './components/properties/PropertyDetails';
import Favorites from './components/properties/Favorites';
import { useAuth } from './contexts/AuthContext';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import SearchPage from './pages/SearchPage';
import AdminPropertyManagementPage from './pages/AdminPropertyManagementPage';
import PostPropertyPage from "./pages/PostPropertyPage";
import NewProjectsPage from './pages/NewProjectsPage';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute state:', {
    isAuthenticated,
    loading,
    path: location.pathname
  });

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If we get here, the user is authenticated
  console.log('Access granted to protected route');
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <FavoritesProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="home" element={<Home />} />
              <Route path="properties/:id" element={<PropertyDetails />} />
              <Route path="favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />
              <Route path="new-projects" element={<NewProjectsPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="properties" element={<SearchPage />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPropertyManagementPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/properties" 
              element={
                <ProtectedRoute>
                  <AdminPropertyManagementPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Add Post Property route */}
            <Route 
              path="/post-property" 
              element={
                <ProtectedRoute>
                  <PostPropertyPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </FavoritesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;