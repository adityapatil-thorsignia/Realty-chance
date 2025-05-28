
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PropertyImageGallery from "@/components/properties/PropertyImageGallery";
import { Button } from "@/components/ui/button";
import { Heart, Share, Phone, Mail, MapPin, Bed, Bath, Home, Calendar, Award, ArrowLeft } from "lucide-react";
import { propertyApi } from "@/services/api";
import { toast } from "sonner";
import PropertyInquiryForm from "@/components/properties/PropertyInquiryForm";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await propertyApi.getById(id);
        setProperty(response.data);
        
        // Fetch similar properties
        if (response.data) {
          // Safely destructure propertyType and city with fallbacks
          const propertyType = response.data.propertyType || response.data.property_type || 'sale';
          const city = response.data.city || '';
          
          // Use getAll or search, assuming it handles these filter parameters
          const similarResponse = await propertyApi.getAll({ // Or propertyApi.search if that's more appropriate
            property_type: propertyType,
            city,
            exclude_id: id,
            limit: 4
          });
          setSimilarProperties(similarResponse.data);
        }
      } catch (err: any) {
        console.error("Error fetching property:", err);
        setError(err.response?.data?.detail || "Failed to load property details");
        toast.error("Failed to load property details");
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
      <Layout>
        <div className="container py-12">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-pulse text-center">
              <div className="h-8 bg-muted w-64 mb-4 rounded"></div>
              <div className="h-4 bg-muted w-32 mx-auto rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <p className="mb-8">The property you are looking for does not exist or has been removed.</p>
          <Button asChild>
            <Link to="/properties">Browse All Properties</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link to="/properties" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Link>
        </div>

        {/* Property Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.address}</span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(property.price)}
              {property.propertyType === "rent" && <span className="text-sm text-muted-foreground"> /month</span>}
            </div>
            <div className="mt-2 flex items-center justify-end">
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                property.propertyType === "sale" ? "bg-secondary/20 text-secondary-foreground" : "bg-primary/20 text-primary"
              }`}>
                For {property.propertyType === "sale" ? "Sale" : "Rent"}
              </span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <PropertyImageGallery images={property.images} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column (Property Details) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                  <Bed className="h-5 w-5 text-primary mb-1" />
                  <span className="text-sm text-muted-foreground">Bedrooms</span>
                  <span className="font-medium">{property.beds}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                  <Bath className="h-5 w-5 text-primary mb-1" />
                  <span className="text-sm text-muted-foreground">Bathrooms</span>
                  <span className="font-medium">{property.baths}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                  <Home className="h-5 w-5 text-primary mb-1" />
                  <span className="text-sm text-muted-foreground">Area</span>
                  <span className="font-medium">{property.sqft} ft²</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary mb-1" />
                  <span className="text-sm text-muted-foreground">Year Built</span>
                  <span className="font-medium">{property.yearBuilt}</span>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-3">Description</h3>
                <p className="text-muted-foreground">{property.description}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Features & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2">
                {property.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <Award className="h-4 w-4 text-primary mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden">
                {/* Map Placeholder - Will be replaced with actual map integration */}
                <div className="w-full h-full flex items-center justify-center bg-muted/50 text-muted-foreground">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p>Map integration will be added when backend is connected</p>
                    <p className="text-sm">{property.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Contact Agent & Actions) */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Agent</h2>
              <div className="flex items-center mb-4">
                <img 
                  src={property.agent.image} 
                  alt={property.agent.name} 
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-medium">{property.agent.name}</h3>
                  <p className="text-sm text-muted-foreground">Listing Agent</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-primary mr-2" />
                  <span>{property.agent.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-primary mr-2" />
                  <a href={`mailto:${property.agent.email}`} className="text-primary hover:underline">
                    {property.agent.email}
                  </a>
                </div>
              </div>

              <PropertyInquiryForm 
                propertyId={property.id} 
                propertyTitle={property.title} 
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full flex items-center justify-center">
                  <Heart className="mr-2 h-4 w-4" />
                  Save to Wishlist
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-center">
                  <Share className="mr-2 h-4 w-4" />
                  Share Property
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      {similarProperties.length > 0 && (
        <div className="container mt-12 mb-8">
          <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProperties.map((similarProperty) => (
              <Link 
                to={`/property/${similarProperty.id}`} 
                key={similarProperty.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video relative">
                  <img 
                    src={similarProperty.images[0]} 
                    alt={similarProperty.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      similarProperty.propertyType === "sale" ? "bg-secondary/20 text-secondary-foreground" : "bg-primary/20 text-primary"
                    }`}>
                      For {similarProperty.propertyType === "sale" ? "Sale" : "Rent"}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium truncate">{similarProperty.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{similarProperty.address}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-primary font-bold">
                      {formatPrice(similarProperty.price)}
                    </p>
                    <div className="flex items-center text-sm">
                      <Bed className="h-3 w-3 mr-1" />
                      <span className="mr-2">{similarProperty.beds}</span>
                      <Bath className="h-3 w-3 mr-1" />
                      <span>{similarProperty.baths}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PropertyDetailPage;
