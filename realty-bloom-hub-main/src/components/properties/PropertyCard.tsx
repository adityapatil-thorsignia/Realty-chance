import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Heart, ArrowRight, Home, BadgeCheck, IndianRupee } from "lucide-react";
import { formatIndianRupees } from "@/utils/indianHelpers";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Button } from '../ui/button';
import { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const favorite = isFavorite(property.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) {
      removeFromFavorites(property.id);
    } else {
      addToFavorites(property);
    }
  };

  return (
    <Link to={`/properties/${property.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <img
            src={property.image || property.images?.[0]}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 ${
              favorite ? 'text-red-500' : 'text-gray-400'
            }`}
            onClick={handleFavoriteClick}
          >
            <Heart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
          <p className="text-gray-600 mb-2">{property.location}</p>
          <p className="text-xl font-bold text-primary">
            {formatIndianRupees(property.price)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
