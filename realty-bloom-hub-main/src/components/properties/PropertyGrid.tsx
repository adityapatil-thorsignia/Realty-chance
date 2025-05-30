import React, { useEffect, useState } from 'react';
import PropertyCard from './PropertyCard';
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { indianPropertyAmenities } from "@/utils/indianHelpers";

interface PropertyGridProps {
  properties: Property[];
  title?: string;
  subtitle?: string;
  showAmenityFilter?: boolean;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  title,
  subtitle,
  showAmenityFilter = false,
}) => {
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Function to handle amenity selection
  const handleAmenityChange = (amenity: string) => {
    const isSelected = selectedAmenities.includes(amenity);
    
    if (isSelected) {
      setSelectedAmenities(selectedAmenities.filter(item => item !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };
  
  // Apply amenity filters
  const applyAmenityFilters = () => {
    if (selectedAmenities.length === 0) {
      setFilteredProperties(properties);
      return;
    }
    
    const filtered = properties.filter(property => {
      // Check if property has amenities property and if it contains any of the selected amenities
      if (!property.amenities) return false;
      
      return selectedAmenities.some(selectedAmenity => 
        property.amenities?.some(amenity => 
          amenity.name.toLowerCase().includes(selectedAmenity.toLowerCase())
        )
      );
    });
    
    setFilteredProperties(filtered);
  };
  
  // Clear filters
  const clearFilters = () => {
    setSelectedAmenities([]);
    setFilteredProperties(properties);
  };
  
  // Update filtered properties when properties prop changes
  useEffect(() => {
    setFilteredProperties(properties);
  }, [properties]);

  if (properties.length === 0) {
    return <div className="text-center py-8">No properties found</div>;
  }

  return (
    <div className="container py-12">
      {(title || subtitle) && (
        <div className="mb-8 text-center">
          {title && <h2 className="text-3xl font-bold mb-2">{title}</h2>}
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      
      {showAmenityFilter && (
        <div className="mb-8 bg-muted/30 p-4 rounded-lg border">
          <h3 className="font-medium mb-3">Filter by Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
            {indianPropertyAmenities.slice(0, 8).map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox 
                  id={`amenity-${amenity}`} 
                  checked={selectedAmenities.includes(amenity)}
                  onCheckedChange={() => handleAmenityChange(amenity)}
                />
                <label 
                  htmlFor={`amenity-${amenity}`} 
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {amenity}
                </label>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={applyAmenityFilters}>Apply Filters</Button>
            <Button size="sm" variant="outline" onClick={clearFilters}>Clear</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <h3 className="text-xl font-medium">No properties found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters</p>
            {showAmenityFilter && selectedAmenities.length > 0 && (
              <Button className="mt-4" onClick={clearFilters}>Clear Filters</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyGrid;
