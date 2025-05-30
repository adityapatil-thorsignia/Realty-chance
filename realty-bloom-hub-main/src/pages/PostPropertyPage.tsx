import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/ui/back-button";
import { Building, Construction, Upload, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { propertyApi } from "@/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";


const PostPropertyPage: React.FC = () => {
  const [propertyType, setPropertyType] = useState<"normal" | "new">("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, updateUserRole, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  console.log('PostPropertyPage Auth State:', { user, isAuthenticated, authLoading });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login', { state: { from: '/post-property' } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Form states for normal property
  const [normalPropertyData, setNormalPropertyData] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    beds: "",
    baths: "",
    sqft: "",
    saleType: "sale", // sale, rent, lease
    yearBuilt: "",
    features: [] as string[]
  });

  // Form states for new project
  const [newPropertyData, setNewPropertyData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    projectType: "residential", // residential, commercial, mixed
    possessionDate: "",
    developerName: "",
    totalUnits: ""
  });

  const handleNormalPropertyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNormalPropertyData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPropertyData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const newImages = [...images, ...selectedFiles].slice(0, 10); // Limit to 10 images
      setImages(newImages);

      // Create previews
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]); // Clean up memory
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleFeatureToggle = (feature: string) => {
    setNormalPropertyData(prev => {
      const features = [...prev.features];
      if (features.includes(feature)) {
        return { ...prev, features: features.filter(f => f !== feature) };
      } else {
        return { ...prev, features: [...features, feature] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      if (propertyType === "normal") {
        Object.entries(normalPropertyData).forEach(([key, value]) => {
          if (key === 'features') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        });
        formData.append("isNewProject", "false"); // Differentiate normal property
      } else {
        Object.entries(newPropertyData).forEach(([key, value]) => {
          formData.append(key, value.toString());
        });
        formData.append("isNewProject", "true"); // Differentiate new project
      }
      
      // Add common fields
      // formData.append("propertyType", propertyType); // This might be redundant if isNewProject is used by backend
      formData.append("listingType", propertyType === "normal" ? normalPropertyData.saleType : "new-project");
      
      if (user && user.id) {
        formData.append("ownerId", user.id);
      } else {
        toast.error("User not authenticated. Please log in.");
        setIsSubmitting(false);
        return;
      }
      
      images.forEach((image) => {
        formData.append(`images`, image); // Ensure backend expects 'images' for multiple files
      });
      
      // Use the updated propertyApi.create method
      const response = await propertyApi.create(formData);
      
      if (response.status === 201 || response.status === 200) { // 201 Created is typical for POST
        await updateUserRole("property_owner"); // Now this should work
        toast.success("Property listed successfully! Your status has been updated to Owner.");
        navigate("/dashboard");
      } else {
        const errorData = response.data;
        const errorMessage = errorData?.detail || errorData?.message || "Failed to list property. Please try again.";
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error("Error listing property:", err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to list property. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <BackButton to="/home" label="Back to Home" />
      <h1 className="text-3xl font-bold mb-2 mt-4">Post a Property</h1>
      <p className="text-muted-foreground mb-4">
        Fill in the details below to list your property. Once listed, your account status will be updated to Property Owner.
      </p>

      <Tabs defaultValue="normal" onValueChange={(value) => setPropertyType(value as "normal" | "new")} className="mb-8">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
          <TabsTrigger value="normal" className="flex items-center">
            <Building className="mr-2 h-4 w-4" /> Normal Property
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center">
            <Construction className="mr-2 h-4 w-4" /> New Project
          </TabsTrigger>
        </TabsList>

        <TabsContent value="normal">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="normal-title" className="block text-sm font-medium mb-1">Property Title *</label>
                  <input
                    id="normal-title"
                    name="title"
                    type="text"
                    value={normalPropertyData.title}
                    onChange={handleNormalPropertyChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g. Modern Apartment"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="saleType" className="block text-sm font-medium mb-1">
                    Listing Type *
                  </label>
                  <select
                    id="saleType"
                    name="saleType"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    required
                    value={normalPropertyData.saleType}
                    onChange={handleNormalPropertyChange}
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                    <option value="lease">For Lease</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-1">
                    {normalPropertyData.saleType === "sale" ? "Price *" : 
                    normalPropertyData.saleType === "rent" ? "Monthly Rent *" : 
                    "Security Amount *"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      value={normalPropertyData.price}
                      onChange={handleNormalPropertyChange}
                      className="w-full rounded-md border px-3 py-2 pl-8 text-sm"
                      placeholder={normalPropertyData.saleType === "sale" ? "e.g. 2500000" : "e.g. 15000"}
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={normalPropertyData.description}
                    onChange={handleNormalPropertyChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    rows={4}
                    placeholder="Describe your property..."
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium mb-1">
                    Address *
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={normalPropertyData.address}
                    onChange={handleNormalPropertyChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Street address"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={normalPropertyData.city}
                    onChange={handleNormalPropertyChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g. Mumbai"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">
                    State *
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={normalPropertyData.state}
                    onChange={handleNormalPropertyChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g. Maharashtra"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                    Zip Code *
                  </label>
                  <input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    value={normalPropertyData.zipCode}
                    onChange={handleNormalPropertyChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g. 400001"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="beds" className="block text-sm font-medium mb-1">
                    Bedrooms *
                  </label>
                  <input
                    id="beds"
                    name="beds"
                    type="number"
                    min="0"
                    value={normalPropertyData.beds}
                    onChange={handleNormalPropertyChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g. 3"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="baths" className="block text-sm font-medium mb-1">
                    Bathrooms *
                  </label>
                  <input
                    id="baths"
                    name="baths"
                    type="number"
                    min="0"
                    step="0.5"
                    value={normalPropertyData.baths}
                    onChange={handleNormalPropertyChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g. 2"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="sqft" className="block text-sm font-medium mb-1">
                    Area (sq ft) *
                  </label>
                  <input
                    id="sqft"
                    name="sqft"
                    type="number"
                    min="0"
                    value={normalPropertyData.sqft}
                    onChange={handleNormalPropertyChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g. 1200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="yearBuilt" className="block text-sm font-medium mb-1">
                    Year Built
                  </label>
                  <input
                    id="yearBuilt"
                    name="yearBuilt"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={normalPropertyData.yearBuilt}
                    onChange={handleNormalPropertyChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g. 2010"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Features</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                  {["Air Conditioning", "Balcony", "Gym", "Swimming Pool", "Furnished", "Pet Friendly", "Security", "Garden", "Elevator", "Parking", "Internet"].map((feature) => (
                    <label key={feature} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4"
                        checked={normalPropertyData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                      />
                      {feature}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Images</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="property-images" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG or JPEG (MAX. 10 images)
                      </p>
                    </div>
                    <input 
                      id="property-images" 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Property preview ${index + 1}`} 
                          className="h-24 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "List Property"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="new">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Project Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="new-title" className="block text-sm font-medium mb-1">Project Title *</label>
                  <input
                    id="new-title"
                    name="title"
                    type="text"
                    value={newPropertyData.title}
                    onChange={handleNewProjectChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g. Green Valley Project"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="projectType" className="block text-sm font-medium mb-1">
                    Project Type *
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    required
                    value={newPropertyData.projectType}
                    onChange={handleNewProjectChange}
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="mixed">Mixed Use</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="new-price" className="block text-sm font-medium mb-1">
                    Starting Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                    <input
                      id="new-price"
                      name="price"
                      type="number"
                      min="0"
                      value={newPropertyData.price}
                      onChange={handleNewProjectChange}
                      className="w-full rounded-md border px-3 py-2 pl-8 text-sm"
                      placeholder="e.g. 5000000"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">
                    Location *
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={newPropertyData.location}
                    onChange={handleNewProjectChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g. Sector 10, Gurgaon"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="developerName" className="block text-sm font-medium mb-1">
                    Developer Name *
                  </label>
                  <input
                    id="developerName"
                    name="developerName"
                    type="text"
                    value={newPropertyData.developerName}
                    onChange={handleNewProjectChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g. ABC Developers"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="totalUnits" className="block text-sm font-medium mb-1">
                    Total Units
                  </label>
                  <input
                    id="totalUnits"
                    name="totalUnits"
                    type="number"
                    min="1"
                    value={newPropertyData.totalUnits}
                    onChange={handleNewProjectChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g. 120"
                  />
                </div>
                
                <div>
                  <label htmlFor="possessionDate" className="block text-sm font-medium mb-1">
                    Possession Date
                  </label>
                  <input
                    id="possessionDate"
                    name="possessionDate"
                    type="date"
                    value={newPropertyData.possessionDate}
                    onChange={handleNewProjectChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="new-description" className="block text-sm font-medium mb-1">
                    Description *
                  </label>
                  <textarea
                    id="new-description"
                    name="description"
                    value={newPropertyData.description}
                    onChange={handleNewProjectChange}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    rows={4}
                    placeholder="Describe your project..."
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Project Images</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="project-images" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG or JPEG (MAX. 10 images)
                      </p>
                    </div>
                    <input 
                      id="project-images" 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Project preview ${index + 1}`} 
                          className="h-24 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "List Project"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PostPropertyPage;
