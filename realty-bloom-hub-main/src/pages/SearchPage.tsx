
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PropertyGrid from "@/components/properties/PropertyGrid";
import SearchFilters from "@/components/search/SearchFilters";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import propertyApi from "@/services/api";
import { Property } from "@/types/property";

const SearchPage: React.FC = () => {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get query params from URL
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get("q") || "";
  const searchType = searchParams.get("type") || "sale";
  const searchCity = searchParams.get("city") || "";
  const searchState = searchParams.get("state") || "";
  const searchAmenity = searchParams.get("amenity") || "";
  const lat = searchParams.get("lat") || null;
  const lng = searchParams.get("lng") || null;

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        // Build filter parameters
        const filters: any = {};
        if (searchType) filters.property_type = searchType;
        if (searchCity) filters.city = searchCity;
        if (searchState) filters.state = searchState;
        if (searchTerm) filters.location_keyword = searchTerm;
        if (lat && lng) {
          filters.lat = lat;
          filters.lng = lng;
        }
        // Fetch properties from API
        const response = await propertyApi.get('/properties', { params: filters });
        setProperties(response.data);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [searchTerm, searchType, searchCity, searchState, searchAmenity, lat, lng]);

  const handleFilterApply = async (filters: any) => {
    setLoading(true);
    
    try {
      // Convert frontend filters to backend filters
      const apiFilters: any = {
        property_type: searchType === "buy" ? "sale" : searchType,
      };
      
      if (filters.state) apiFilters.state = filters.state;
      if (filters.city) apiFilters.city = filters.city;
      
      // Price range
      if (filters.priceRange && filters.priceRange.length === 2) {
        apiFilters.min_price = filters.priceRange[0];
        apiFilters.max_price = filters.priceRange[1];
      }
      
      // Bedrooms and bathrooms
      if (filters.bedrooms && filters.bedrooms !== "any") {
        apiFilters.bedrooms = filters.bedrooms === "4+" ? 4 : parseInt(filters.bedrooms);
      }
      
      if (filters.bathrooms && filters.bathrooms !== "any") {
        apiFilters.bathrooms = filters.bathrooms === "3+" ? 3 : parseInt(filters.bathrooms);
      }
      
      // Verification status
      if (filters.verifiedOnly) {
        apiFilters.is_verified = true;
      }
      
      // Fetch filtered properties
      const response = await propertyApi.get('/properties', { params: apiFilters });
      setFilteredProperties(response.data);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    
    setIsGettingLocation(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsGettingLocation(false);
        
        // In a real app, we would reverse geocode to get the address and find nearby properties
        alert(`Location found! Finding properties near you...`);
        
        // For now, let's just show all properties
        setFilteredProperties(properties as Property[]);
        setLoading(false);
      },
      (error) => {
        setIsGettingLocation(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("An unknown error occurred");
        }
      }
    );
  };

  useEffect(() => {
    // Simulate API search delay
    setLoading(true);
    
    setTimeout(() => {
      // Initial filtering based on URL params
      let results = [...properties] as Property[];
      
      // Filter by search term (location)
      if (searchTerm) {
        results = results.filter(property => 
          property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Filter by city
      if (searchCity) {
        results = results.filter(property =>
          property.location.toLowerCase().includes(searchCity.toLowerCase())
        );
      }
      
      // Filter by state
      if (searchState) {
        results = results.filter(property =>
          property.address.toLowerCase().includes(searchState.toLowerCase())
        );
      }
      
      
      // Filter by type (buy/rent/lease)
      if (searchType === "buy") {
        results = results.filter(property => property.propertyType === "sale");
      } else if (searchType === "rent") {
        results = results.filter(property => property.propertyType === "rent");
      } else if (searchType === "lease") {
        results = results.filter(property => property.propertyType === "lease" as "sale" | "rent");
      }
      
      // Filter by amenity
      if (searchAmenity) {
        results = results.filter(property => 
          property.amenities?.some(amenity => 
            amenity.name.toLowerCase().includes(searchAmenity.replace('-', ' '))
          ) ||
          property.nearbyLocations?.some(nearby => 
            nearby.type.toLowerCase().includes(searchAmenity.replace('-', ' '))
          )
        );
      }
      
      setFilteredProperties(results);
      setLoading(false);
    }, 500);
  }, [searchTerm, searchType, searchCity, searchState, searchAmenity]);

  const handleApplyFilters = (filters: any) => {
    setLoading(true);
    
    // Simulate API filtering delay
    setTimeout(() => {
      // Start with properties matching the search term and type
      let results = [...properties] as Property[];
      
      // Filter by location params
      if (filters.state) {
        results = results.filter(property => 
          property.address.toLowerCase().includes(filters.state.toLowerCase())
        );
      }
      
      if (filters.city) {
        results = results.filter(property => 
          property.location.toLowerCase().includes(filters.city.toLowerCase())
        );
      }
      
      // Filter by type (buy/rent/lease)
      if (searchType === "buy") {
        results = results.filter(property => property.propertyType === "sale");
      } else if (searchType === "rent") {
        results = results.filter(property => property.propertyType === "rent");
      } else if (searchType === "lease") {
        results = results.filter(property => property.propertyType === "lease" as "sale" | "rent");
      }
      
      // Apply additional filters
      if (filters.propertyType !== "any") {
        results = results.filter(property => {
          if (filters.propertyType === "house") return property.title.toLowerCase().includes("house") || property.title.toLowerCase().includes("home");
          if (filters.propertyType === "apartment") return property.title.toLowerCase().includes("apartment") || property.title.toLowerCase().includes("studio");
          if (filters.propertyType === "villa") return property.title.toLowerCase().includes("villa");
          return true;
        });
      }
      
      // Filter by price range
      results = results.filter(property => 
        property.price >= filters.priceRange[0] && property.price <= filters.priceRange[1]
      );
      
      // Filter by bedrooms
      if (filters.bedrooms !== "any") {
        if (filters.bedrooms === "4+") {
          results = results.filter(property => property.beds >= 4);
        } else {
          results = results.filter(property => property.beds === parseInt(filters.bedrooms));
        }
      }
      
      // Filter by bathrooms
      if (filters.bathrooms !== "any") {
        if (filters.bathrooms === "3+") {
          results = results.filter(property => property.baths >= 3);
        } else {
          results = results.filter(property => property.baths === parseInt(filters.bathrooms));
        }
      }
      
      // Filter by amenities
      if (filters.amenities && filters.amenities.length > 0) {
        results = results.filter(property => 
          filters.amenities.every((amenity: string) => 
            property.amenities?.some(a => a.name.toLowerCase().includes(amenity.toLowerCase())) ||
            property.nearbyLocations?.some(n => n.type.toLowerCase().includes(amenity.toLowerCase()))
          )
        );
      }
      
      // Filter by verification status
      if (filters.verifiedOnly) {
        results = results.filter(property => property.isVerified);
      }
      
      // Filter by possession status
      if (filters.possessionStatus !== "any" && filters.possessionStatus) {
        results = results.filter(property => property.possessionStatus === filters.possessionStatus);
      }
      
      // Filter by furnishing
      if (filters.furnishingStatus !== "any" && filters.furnishingStatus) {
        results = results.filter(property => property.furnishingStatus === filters.furnishingStatus);
      }
      
      setFilteredProperties(results);
      setLoading(false);
    }, 500);
  };

  // Build the search title
  const getSearchTitle = () => {
    if (searchTerm) return `Search Results for "${searchTerm}"`;
    if (searchAmenity) return `Properties with ${searchAmenity.replace('-', ' ')} nearby`;
    if (searchCity) return `Properties in ${searchCity}`;
    if (searchState) return `Properties in ${searchState}`;
    return "Search Properties";
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2 animate-fade-in">
          {getSearchTitle()}
        </h1>
        <p className="text-muted-foreground mb-6 animate-fade-in">
          {searchType === "buy" ? "Properties for sale" : searchType === "rent" ? "Properties for rent" : "Properties for lease"}
          {searchCity ? ` in ${searchCity}` : ""}
          {searchState && !searchCity ? ` in ${searchState}` : ""}

        </p>
        
        {/* Location based search */}
        <div className="mb-6 animate-fade-in">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={getUserLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-primary border-t-transparent rounded-full"></div>
                Finding properties near you...
              </>
            ) : (
              <>
                <Compass className="mr-2 h-4 w-4" />
                Find properties near me
              </>
            )}
          </Button>
          {locationError && (
            <p className="text-xs text-destructive mt-1">{locationError}</p>
          )}
        </div>
        
        {/* Search Filters */}
        <SearchFilters onApplyFilters={handleApplyFilters} />
        
        {/* Results */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted max-w-md mx-auto rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="h-64 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 animate-fade-in">
              <p className="text-muted-foreground">
                {properties.length} properties found
              </p>
            </div>
            {properties.length > 0 ? (
              <PropertyGrid properties={properties} />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No properties found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria to find more properties
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
