
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PropertyImageGallery from "@/components/properties/PropertyImageGallery";
import { Button } from "@/components/ui/button";
import { Heart, Share, Phone, Mail, MapPin, Bed, Bath, Home, Calendar, Award, ArrowLeft } from "lucide-react";
import { propertyApi } from "@/services/api";
import { toast } from "sonner";

function mapPropertyFromApi(apiProp: any) {
  // Ensure images is always an array of objects with an 'image' property
  let images = [];
  if (Array.isArray(apiProp.images)) {
    images = apiProp.images.map((img: any) =>
      typeof img === 'string' ? { image: img } : img
    );
  }
  return {
    title: apiProp.title,
    address: apiProp.address,
    price: apiProp.price,
    propertyType: apiProp.property_type,
    images,
    beds: apiProp.bedrooms,
    baths: apiProp.bathrooms,
    sqft: apiProp.area_sqft,
    yearBuilt: apiProp.year_built,
    description: apiProp.description,
    features: apiProp.features || [],
    agent: apiProp.agent || { image: '', name: '', phone: '', email: '' },
  };
}

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top when id changes
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await propertyApi.getById(id);
        setProperty(mapPropertyFromApi(response.data));
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
      <div className="container py-8 max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link to="/properties" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Link>
        </div>

        {/* Property Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 border-b pb-6">
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
        {/* Image Gallery with fallback */}
        {property.images && property.images.length > 0 ? (
          <PropertyImageGallery images={property.images} />
        ) : (
          <div className="aspect-[4/3] w-full bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg mb-6">
            <span>No Image Available</span>
          </div>
        )}


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Left Column (Property Details) */}
          <div className="md:col-span-2">
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

            {property.features && property.features.length > 0 && (
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
            )}

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
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Agent</h2>
              {/* <div className="flex items-center mb-4 gap-4">
                <img 
                  src={property.agent?.image || '/placeholder.jpg'} 
                  alt={property.agent?.name || 'Agent'} 
                  className="w-16 h-16 rounded-full object-cover border"
                />
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
              </div> */}

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input 
                    type="text" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                    placeholder="Your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input 
                    type="tel" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                    rows={4}
                    placeholder="I'm interested in this property..."
                  ></textarea>
                </div>
                <Button type="submit" className="w-full">Contact Agent</Button>
              </form>
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
    </Layout>
  );
};

export default PropertyDetailPage;
