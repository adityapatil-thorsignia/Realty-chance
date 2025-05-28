import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from './pages/Index';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import NewProjectsPage from './pages/NewProjectsPage';
import PostPropertyPage from './pages/PostPropertyPage';
import PropertyListingPage from './pages/PropertyListingPage';
import SearchPage from './pages/SearchPage';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <FavoritesProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<PropertyListingPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/new-projects" element={<NewProjectsPage />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* Protected routes */}
            <Route path="/favorites" element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            } />
            <Route path="/post-property" element={
              <ProtectedRoute>
                <PostPropertyPage />
              </ProtectedRoute>
            } />
          </Routes>
        </FavoritesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Notifications from './components/Notifications';