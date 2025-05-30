import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useFavorites } from '@/contexts/FavoritesContext';
import PropertyCard from './PropertyCard';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  image_url: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  property_type: string;
}

const Favorites: React.FC = () => {
  const { favorites } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        // Here you would typically fetch the full property details for each favorite
        // For now, we'll just use the basic data we have
        setProperties(favorites as Property[]);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast({
          title: 'Error',
          description: 'Failed to load favorite properties',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favorites, toast]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Favorites Yet</h2>
          <p className="text-muted-foreground mb-6">
            Start adding properties to your favorites to see them here.
          </p>
          <Button onClick={() => navigate('/')}>
            Browse Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Your Favorite Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
          />
        ))}
      </div>
    </div>
  );
};

export default Favorites; 