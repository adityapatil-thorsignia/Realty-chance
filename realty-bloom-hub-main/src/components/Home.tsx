import React, { useEffect, useState } from 'react';
import PropertyGrid from './properties/PropertyGrid';
import { propertyApi } from '@/services/api';
import { Property } from '@/types/property';
import { toast } from 'sonner';
import SearchHero from './home/SearchHero';
import FeaturedCategories from './home/FeaturedCategories';

const Home: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await propertyApi.getAll();
        setProperties(response.data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to load properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SearchHero />
      <FeaturedCategories />
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Properties</h2>
        <PropertyGrid 
          properties={properties}
          title="Featured Properties"
          subtitle="Discover our handpicked selection of premium properties"
        />
      </div>
    </div>
  );
};

export default Home; 