import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Heart, ArrowRight, Home, BadgeCheck, IndianRupee } from "lucide-react";
import { formatIndianRupees } from "@/utils/indianHelpers";
import { useFavorites } from "@/contexts/FavoritesContext";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: "sale" | "rent" | "lease";
  isVerified?: boolean;
  isNewProject?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  price,
  image,
  location,
  beds,
  baths,
  sqft,
  propertyType,
  isVerified = false,
  isNewProject = false,
}) => {
  // Debug log for image prop
  console.log("PropertyCard image prop:", image);
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const isFav = isFavorite(id);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFav) {
      removeFromFavorites(id);
    } else {
      addToFavorites({ id, title, location, image });
    }
  };

  return (
    <div className="property-card group stagger-item">
      <div className="relative">
        <Link to={`/properties/${id}`}>
          {image && image.trim() !== "" ? (
            <img
              src={image}
              alt={title}
              className="aspect-[4/3] w-full object-cover transition-all duration-300 group-hover:brightness-90"
              onError={e => {
                (e.target as HTMLImageElement).src = process.env.PUBLIC_URL + "/placeholder.jpg";
              }}
            />
          ) : (
            <div className="aspect-[4/3] w-full bg-gray-100 flex items-center justify-center text-gray-400">
              <span>No Image</span>
            </div>
          )}
        </Link>
        
        {/* Property Type Badge */}
        <span className={`property-badge ${
          propertyType === "sale" ? "bg-secondary text-secondary-foreground" : 
          propertyType === "rent" ? "bg-primary text-primary-foreground" :
          "bg-amber-500 text-white"
        }`}>
          {propertyType === "sale" ? "For Sale" : 
           propertyType === "rent" ? "For Rent" : "For Lease"}
        </span>
        
        {/* Verified Badge */}
        {isVerified && (
          <div className="absolute top-3 left-3 z-10 bg-green-500 text-white rounded-full px-2 py-1 text-xs flex items-center">
            <BadgeCheck className="h-3 w-3 mr-1" />
            <span>Aadhar Verified</span>
          </div>
        )}
        
        {/* New Project Badge */}
        {isNewProject && (
          <div className="absolute top-12 left-3 z-10 bg-orange-500 text-white rounded-full px-2 py-1 text-xs">
            New Project
          </div>
        )}
        
        {/* Favorite Button */}
        <button 
          className={`absolute top-3 right-3 z-10 rounded-full ${isFav ? 'bg-red-100' : 'bg-white/80'} p-1.5 ${isFav ? 'text-red-500' : 'text-muted-foreground'} backdrop-blur-sm transition-colors hover:text-red-500`}
          onClick={handleFavoriteToggle}
        >
          <Heart className="h-5 w-5" fill={isFav ? "currentColor" : "none"} />
          <span className="sr-only">{isFav ? 'Remove from favorites' : 'Add to favorites'}</span>
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between mb-2">
          <span className="text-lg font-semibold text-primary flex items-center">
            <IndianRupee className="h-4 w-4 mr-1" />
            {formatIndianRupees(price).replace('₹', '')}
            {propertyType !== "sale" && <span className="text-sm text-muted-foreground"> /month</span>}
          </span>
        </div>
        
        <Link to={`/properties/${id}`} className="group-hover:text-primary transition-colors">
          <h3 className="text-lg font-medium leading-tight mb-2 line-clamp-1">{title}</h3>
        </Link>

        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center" title={`${beds} Bedrooms`}>
              <Bed className="feature-icon" />
              <span>{beds}</span>
            </div>
            <div className="flex items-center" title={`${baths} Bathrooms`}>
              <Bath className="feature-icon" />
              <span>{baths}</span>
            </div>
            <div className="flex items-center" title={`${sqft} Square Feet`}>
              <Home className="feature-icon" />
              <span>{sqft} ft²</span>
            </div>
          </div>
          
          <Link 
            to={`/properties/${id}`} 
            className="flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            View
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
