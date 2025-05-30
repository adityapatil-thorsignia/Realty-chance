import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import PropertyGrid from "@/components/properties/PropertyGrid";
import PropertySearch from "@/components/properties/PropertySearch";
import BackButton from "@/components/ui/back-button";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Building, MapPin, Search, Compass } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { propertyApi } from "@/services/api";
import { toast } from "sonner";

const NewProjectsPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [newProjects, setNewProjects] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('NewProjectsPage Auth State:', { user, isAuthenticated, authLoading });

  useEffect(() => {
    const fetchNewProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await propertyApi.getAll();
        if (Array.isArray(response.data.results)) {
          // Filter only new projects from the fetched data
          const projectsData = response.data.results.filter((property: Property) => property.isNewProject === true);
          setNewProjects(projectsData);
        } else {
          setNewProjects([]);
        }
      } catch (err) {
        console.error("Error fetching new projects:", err);
        setError("Failed to load new projects.");
        toast.error("Failed to load new projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewProjects();
  }, [toast]);

  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
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

  return (
    <Layout>
      <div className="container py-8">
        
        <h1 className="text-3xl font-bold mb-2">New Projects</h1>
        <p className="text-muted-foreground mb-6">Discover upcoming and newly launched projects in prime locations</p>
        
        {/* Property Search */}
        <div className="mb-8">
          <PropertySearch simplified />
        </div>
        
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
        
        {/* Quick filters */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3">Quick Filters</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <Building className="mr-1.5 h-3.5 w-3.5" />
              Apartments
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Building className="mr-1.5 h-3.5 w-3.5" />
              Villas
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <MapPin className="mr-1.5 h-3.5 w-3.5" />
              Plots
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Ready to Move
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Building className="mr-1.5 h-3.5 w-3.5" />
              Under Construction
            </Button>
          </div>
        </div>
        
        {/* Project Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Popular Project Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Luxury Projects</h3>
              <p className="text-sm text-muted-foreground mb-3">Premium housing with high-end amenities</p>
              <Badge variant="outline">20+ Projects</Badge>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Affordable Housing</h3>
              <p className="text-sm text-muted-foreground mb-3">Budget-friendly options with essential amenities</p>
              <Badge variant="outline">35+ Projects</Badge>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Township Projects</h3>
              <p className="text-sm text-muted-foreground mb-3">Self-contained communities with all facilities</p>
              <Badge variant="outline">12+ Projects</Badge>
            </div>
          </div>
        </div>
        
        {/* New Projects Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Latest Projects</h2>
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground mr-2">Sort by:</span>
              <select className="rounded-md border border-input bg-background px-2 py-1 text-sm">
                <option>Newest First</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Most Popular</option>
              </select>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading new projects...</div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : newProjects.length > 0 ? (
            <PropertyGrid properties={newProjects} />
          ) : (
            <div className="text-center py-12">No new projects found.</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NewProjectsPage;
