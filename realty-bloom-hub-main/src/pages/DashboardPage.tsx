import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import PropertyGrid from "@/components/properties/PropertyGrid";
import { Button } from "@/components/ui/button";
import { Property } from "@/types/property";
import { propertyApi, inquiryApi } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface Inquiry {
  id: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  property: {
    title: string;
  };
  user: {
    name: string;
  };
}

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  console.log('DashboardPage Auth State:', { user, isAuthenticated, authLoading });

  // Helper function to filter properties
  const getFilteredProperties = (filterFn: (p: Property) => boolean) => {
    return Array.isArray(properties) ? properties.filter(filterFn) : [];
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Only fetch properties for property owners and admins
        if (user.role === 'property_owner' || user.role === 'admin') {
          const propertiesResponse = await propertyApi.my_listings();
          setProperties(Array.isArray(propertiesResponse.data) ? propertiesResponse.data : []);
        } else {
          setProperties([]);
        }
        
        // Fetch inquiries - the backend will automatically filter based on user role
        const inquiriesResponse = await inquiryApi.getAll();
        // Handle paginated response
        const inquiriesData = inquiriesResponse.data?.results || [];
        setInquiries(Array.isArray(inquiriesData) ? inquiriesData : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast]);

  const handleInquiryAction = async (inquiryId: string, action: 'approve' | 'reject') => {
    try {
      await (action === 'approve'
        ? inquiryApi.approveInquiry(inquiryId)
        : inquiryApi.rejectInquiry(inquiryId));

      setInquiries(prev =>
        prev.map(inquiry =>
          inquiry.id === inquiryId
            ? { ...inquiry, status: action === 'approve' ? 'approved' : 'rejected' }
            : inquiry
        )
      );

      toast({ title: `Inquiry ${action}d successfully` });
    } catch (error) {
      console.error(`Error ${action}ing inquiry:`, error);
      toast({ title: `Failed to ${action} inquiry`, variant: "destructive" });
    }
  };

  const handleVerifyProperty = async (id: string) => {
    try {
      await propertyApi.verifyProperty(id);
      setProperties(prev =>
        prev.map(property =>
          property.id === id ? { ...property, isVerified: true } : property
        )
      );
      toast({ title: "Property verified successfully" });
    } catch (error) {
      console.error("Error verifying property:", error);
      toast({ title: "Failed to verify property", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          {user?.role === 'admin' && 'Manage properties and inquiries'}
          {user?.role === 'property_owner' && 'Manage your property listings'}
          {user?.role !== 'admin' && user?.role !== 'property_owner' && 'Track your property inquiries'}
        </p>

        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-6">
            {(user?.role === 'admin' || user?.role === 'property_owner') && (
              <TabsTrigger value="properties">Properties</TabsTrigger>
            )}
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            {user?.role === 'admin' && (
              <TabsTrigger value="verification">Verification Queue</TabsTrigger>
            )}
          </TabsList>

          {(user?.role === 'admin' || user?.role === 'property_owner') && (
            <TabsContent value="properties">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Your Properties</h2>
                <Button asChild>
                  <a href="/post-property">Add New Property</a>
                </Button>
              </div>
              {loading ? (
                <div className="text-center py-12">Loading properties...</div>
              ) : (
                <PropertyGrid properties={properties} />
              )}
            </TabsContent>
          )}

          <TabsContent value="inquiries">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">Loading inquiries...</div>
              ) : Array.isArray(inquiries) ? (
                inquiries.map(inquiry => (
                  <div key={inquiry.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{inquiry.property.title}</h3>
                        <p className="text-sm text-muted-foreground">{inquiry.message}</p>
                        <p className="text-sm">From: {inquiry.user.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleInquiryAction(inquiry.id, 'approve')}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleInquiryAction(inquiry.id, 'reject')}>Reject</Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">No inquiries found</div>
              )}
              {!loading && Array.isArray(inquiries) && inquiries.length === 0 && (
                <div className="text-center py-12">No inquiries found</div>
              )}
            </div>
          </TabsContent>

          {user?.role === 'admin' && (
            <TabsContent value="verification">
              <h2 className="text-xl font-medium mb-6">Properties Pending Verification</h2>
              {loading ? (
                <div className="text-center py-12">Loading verification queue...</div>
              ) : (
                <div className="space-y-4">
                  {getFilteredProperties(property => !property.isVerified)
                    .map(property => (
                      <div key={property.id} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{property.title}</h3>
                          <Button size="sm" onClick={() => handleVerifyProperty(property.id)}>
                            Verify
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{property.location}</p>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardPage;
