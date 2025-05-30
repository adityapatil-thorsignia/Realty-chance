import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { propertyApi } from "@/services/api";
import { toast } from "sonner";
import { Property } from "@/types/property";

const AdminPropertyManagementPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== 'admin' || !user?.token) {
      navigate('/');
      return;
    }

    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await propertyApi.getAll();
        setProperties(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to load properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [authLoading, isAuthenticated, user, navigate]);

  const handleVerifyProperty = async (id: string) => {
    try {
      await propertyApi.verifyProperty(id);
      setProperties(prev => 
        prev.map(property => 
          property.id === id ? { ...property, isVerified: true } : property
        )
      );
      toast.success('Property verified successfully');
    } catch (error) {
      console.error('Error verifying property:', error);
      toast.error('Failed to verify property');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      await propertyApi.delete(id);
      setProperties(prev => prev.filter(property => property.id !== id));
      toast.success('Property deleted successfully');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  // Helper function to filter properties
  const getFilteredProperties = (filterFn: (p: Property) => boolean) => {
    return Array.isArray(properties) ? properties.filter(filterFn) : [];
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">Admin Property Management</h1>
        <p className="text-muted-foreground mb-6">Manage all properties in the system</p>

        <Tabs defaultValue="unverified" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="unverified">Unverified Properties</TabsTrigger>
            <TabsTrigger value="verified">Verified Properties</TabsTrigger>
          </TabsList>

          <TabsContent value="unverified">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">Loading properties...</div>
              ) : (
                getFilteredProperties(property => !property.isVerified)
                  .map(property => (
                    <div key={property.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{property.title}</h3>
                          <p className="text-sm text-muted-foreground">{property.address}</p>
                          <p className="text-sm">Location: {property.city}, {property.state}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleVerifyProperty(property.id)}>Verify</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteProperty(property.id)}>Delete</Button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
              {!loading && getFilteredProperties(p => !p.isVerified).length === 0 && (
                <div className="text-center py-12">No unverified properties found</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="verified">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">Loading properties...</div>
              ) : (
                getFilteredProperties(property => property.isVerified)
                  .map(property => (
                    <div key={property.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{property.title}</h3>
                          <p className="text-sm text-muted-foreground">{property.address}</p>
                          <p className="text-sm">Location: {property.city}, {property.state}</p>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteProperty(property.id)}>Delete</Button>
                      </div>
                    </div>
                  ))
              )}
              {!loading && getFilteredProperties(p => p.isVerified).length === 0 && (
                <div className="text-center py-12">No verified properties found</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPropertyManagementPage;
