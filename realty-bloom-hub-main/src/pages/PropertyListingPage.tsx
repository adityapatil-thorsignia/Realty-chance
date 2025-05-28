import React, { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import SearchFilters from "@/components/search/SearchFilters";
import PropertyGrid from "@/components/properties/PropertyGrid";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Compass, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from 'react-router-dom';
import { propertyApi } from '@/services/api';

const PropertyListingPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialType = queryParams.get('type') as "buy" | "rent" | "lease" | null;

  const [activeTab, setActiveTab] = useState<"buy" | "rent" | "lease">(initialType || "buy");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { propertyType: activeTab, ...filters };
        const response = await propertyApi.getAll(params);
        setProperties(response.data.results || response.data);
      } catch (err: any) {
        console.error("Error fetching properties:", err);
        setError(err.response?.data?.detail || "Failed to load properties");
        toast.error("Failed to load properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [activeTab, filters]);

  const handleTabChange = useCallback((tab: "buy" | "rent" | "lease") => {
    setActiveTab(tab);
  }, []);
  
  const handleApplyFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGettingLocation(false);
        
        const { latitude, longitude } = position.coords;
        console.log(`Found location: ${latitude}, ${longitude}`);
        
        toast.success("Location found! You would see nearby properties here if implemented.");
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMsg = "An unknown error occurred";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMsg = "Location request timed out";
            break;
        }
        
        toast.error(`Error: ${errorMsg}`);
      }
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <div className="animate-pulse text-primary text-lg">Loading properties...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-12 text-center text-destructive">
          <h3 className="text-xl font-medium mb-2">Error loading properties</h3>
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">Browse Properties</h1>
        
        {/* Buy/Rent/Lease Tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "buy"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => handleTabChange("buy")}
          >
            For Sale
          </button>
          <button
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === "rent"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => handleTabChange("rent")}
          >
            For Rent
          </button>
          {/* Hide Lease tab for now if not supported by backend API */}
          {/*
          <button
            className={`px-6 py-3 text-lg font-medium ${ activeTab === "lease" ? "border-b-2 border-primary text-primary" : "text-muted-foreground" }`}
            onClick={() => handleTabChange("lease")}
          >
            For Lease
          </button>
          */}
        </div>
        
        {/* Find Properties Near Me */}
        <div className="mb-6">
          <Button 
            onClick={getUserLocation} 
            disabled={isGettingLocation}
            className="flex items-center"
            variant="outline"
          >
            {isGettingLocation ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-primary border-t-transparent rounded-full"></div>
                Finding properties near you...
              </>
            ) : (
              <>
                <Compass className="mr-2 h-4 w-4" />
                Find Properties Near Me
              </>
            )}
          </Button>
        </div>
        
        {/* Search Filters */}
        <SearchFilters onApplyFilters={handleApplyFilters} />
        
        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {properties.length} properties found
          </p>
          <div className="flex items-center">
            <label htmlFor="sort" className="text-sm mr-2">
              Sort by:
            </label>
            <select
              id="sort"
              className="rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price (Low to High)</option>
              <option value="price_high">Price (High to Low)</option>
            </select>
          </div>
        </div>
        
        {/* Property Grid with Amenity Filter */}
        {properties.length > 0 ? (
          <PropertyGrid 
            properties={properties} 
            showAmenityFilter={true}
          />
        ) : (
          !loading && !error && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No properties found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later.
              </p>
            </div>
          )
        )}
      </div>
    </Layout>
  );
};

export default PropertyListingPage;
