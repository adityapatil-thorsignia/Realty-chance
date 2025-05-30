import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { propertyApi } from '@/services/api';
import { Property } from '@/types/property';
import { toast } from 'sonner';
import { formatIndianRupees } from '@/utils/indianHelpers';
import { MapPin, Bed, Bath, Home, Building } from 'lucide-react';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await propertyApi.getById(id!);
        setProperty(response.data);
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <p className="text-gray-600">The property you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
        <p className="text-gray-600 mb-6 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          {property.location}
        </p>

        <div className="relative mb-8">
          <img
            src={property.image || property.images?.[0]}
            alt={property.title}
            className="w-full h-[400px] object-cover rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Price</p>
            <p className="text-xl font-bold text-primary">{formatIndianRupees(property.price)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Bedrooms</p>
            <p className="text-xl font-bold flex items-center">
              <Bed className="h-5 w-5 mr-2" />
              {property.beds}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Bathrooms</p>
            <p className="text-xl font-bold flex items-center">
              <Bath className="h-5 w-5 mr-2" />
              {property.baths}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Area</p>
            <p className="text-xl font-bold">{property.sqft} sq.ft</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Building className="h-5 w-5 mr-2 text-gray-600" />
              <span className="text-gray-700">Type: {property.propertyType}</span>
            </div>
            <div className="flex items-center">
              <Home className="h-5 w-5 mr-2 text-gray-600" />
              <span className="text-gray-700">Status: {property.possessionStatus || 'Not specified'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails; 