import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { Property } from '@/types/property';

interface FavoritesContextType {
  favorites: Property[];
  addToFavorites: (property: Property) => void;
  removeFromFavorites: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const saveFavorites = (newFavorites: Property[]) => {
    try {
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
      toast.error('Failed to save favorites');
    }
  };

  const addToFavorites = (property: Property) => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }

    if (!favorites.some(fav => fav.id === property.id)) {
      const newFavorites = [...favorites, property];
      saveFavorites(newFavorites);
      toast.success('Added to favorites');
    }
  };

  const removeFromFavorites = (propertyId: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== propertyId);
    saveFavorites(newFavorites);
    toast.success('Removed from favorites');
  };

  const isFavorite = (propertyId: string) => {
    return favorites.some(fav => fav.id === propertyId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        loading
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
