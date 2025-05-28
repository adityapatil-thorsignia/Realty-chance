import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Upload, X, Check } from "lucide-react";
// Remove these comments if you decide not to use react-hook-form
// import { useForm } from "react-hook-form";
// import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

// Import the propertyApi from your services
import { propertyApi } from '@/services/api';
import { toast } from 'sonner'; // Assuming you are using sonner for toasts
import { useNavigate } from 'react-router-dom'; // Assuming you are using react-router-dom for navigation
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';


const PropertyForm: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [propertyStatus, setPropertyStatus] = useState<"sale" | "rent" | "lease">("sale");
  // Add state for all required fields
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [propertyType, setPropertyType] = useState(""); // State for the second dropdown (Apartment, House, etc.) - NOT sent as property_type to backend
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [area, setArea] = useState(""); // Maps to area_sqft in backend
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateField, setStateField] = useState(""); // Maps to state in backend

  const [description, setDescription] = useState("");
  const [zipCode, setZipCode] = useState(""); // Assuming backend needs zip code

  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

   const navigate = useNavigate(); // Initialize navigate

  // Remove the getToken function as we will use the configured Axios instance


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      console.log('Selected files in handleImageChange:', selectedFiles);
      const newImages = [...images, ...selectedFiles].slice(0, 10); // Limit to 10 images
      setImages(newImages);
      console.log('Updated images state in handleImageChange:', newImages);
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

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    console.log("Submit button clicked. Starting submission process.");
    console.log('Images state at the start of handleSubmit:', images);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      // Check if optional number fields have values before appending
      if (bedrooms) formData.append("bedrooms", bedrooms);
      if (bathrooms) formData.append("bathrooms", bathrooms);
      if (area) formData.append("area_sqft", area);

      // **CORRECTION:** Map property_type to the first dropdown's value (Listing Type)
      formData.append("property_type", propertyStatus); // Use propertyStatus state for backend field
      // **Removed:** Not sending the second dropdown value (propertyType state) as it doesn't match backend choices in serializer

      formData.append("city", city);
      formData.append("state", stateField);


      formData.append("address", address);
      // Check if zipCode is required and add client-side validation if needed
      if (!zipCode.trim()) {
          setError("Zip Code is required.");
          setLoading(false);
          toast.error("Zip Code is required.");
          return;
      }
      // Do NOT append zip_code to FormData, unless backend expects it!
      // formData.append("zip_code", zipCode.trim());

      // Append images only if there are any selected
      if (images.length === 0) {
          setError("Please upload at least one property image.");
          setLoading(false);
          toast.error("Please upload at least one property image.");
          return;
      }
      // Append each image file with the same key (no brackets, no array)
      images.forEach(img => formData.append("images", img));

      // DEBUG: Log FormData contents to ensure images are appended
      let hasImage = false;
      for (const pair of formData.entries()) {
          console.log("FormData entry:", pair[0], pair[1]);
          if (pair[0] === "images" && pair[1] instanceof File) {
              hasImage = true;
          }
      }
      if (!hasImage) {
          setError("No images found in FormData. Please select images again.");
          setLoading(false);
          toast.error("No images found in FormData. Please select images again.");
          return;
      }
      console.log(`FormData has ${images.length} image(s).`);

      // DO NOT set Content-Type manually! Axios/browser will do this for you.
      // This ensures the request is sent as proper multipart/form-data with boundaries.
      const response = await propertyApi.create(formData); // No headers: { 'Content-Type': ... }

      console.log("API call finished. Checking response.");

      // Assuming successful response has status 2xx and data with an 'id'
      if (response.status === 201) {
        setSuccess("Property posted successfully!");
        setError(null);
        toast.success("Property listed successfully!");
        // Optionally navigate if response.data.id is present
        if (response.data && response.data.id) {
          navigate(`/properties/${response.data.id}`);
        }
        // Optionally clear form
        setTitle(""); setDescription(""); setPrice(""); setBedrooms(""); setBathrooms(""); setArea(""); setAddress(""); setCity(""); setStateField(""); setImages([]); setPreviews([]); setPropertyType(""); setPropertyStatus("sale");
        setZipCode("");
      } else {
        console.error("Unexpected API response:", response);
        setError("Failed to post property: Unexpected response from server.");
        toast.error("Failed to post property: Unexpected response.");
        setSuccess(null);
      }

    } catch (error: any) {
      console.error("API call error:", error); // Log the full error object

      let errorString = "Failed to post property.";
      if (error.response && error.response.data) {
         // Attempt to extract backend validation errors or other messages
         const backendErrors = error.response.data;
         if (typeof backendErrors === 'object') {
             errorString += ": ";
             // Join all error messages from all fields
             const fieldErrors = Object.entries(backendErrors)
                .map(([field, messages]) => {
                    const messageList = Array.isArray(messages) ? messages.join(', ') : messages;
                    return `${field}: ${messageList}`;
                })
                .join('; '); // Use semicolon to separate different field errors
             errorString += fieldErrors;

         } else {
             errorString += ": " + (backendErrors.detail || backendErrors.message || JSON.stringify(backendErrors));
         }
      } else if (error.message) {
          errorString += ": " + error.message;
      }

      setError(errorString.trim());
      toast.error(errorString.trim()); // Show error toast
      setSuccess(null);
      console.error("Submission caught exception:", error);
    } finally {
      setLoading(false);
      console.log("Submission process finished.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Property Title *
              </label>
              <input
                id="title"
                type="text"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. Modern Apartment with Amazing View"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                Listing Type *
              </label>
              <select
                id="status"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
                value={propertyStatus} // Bound to propertyStatus state
                onChange={(e) => setPropertyStatus(e.target.value as "sale" | "rent" | "lease")}
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="lease">For Lease</option>
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                {propertyStatus === "sale" ? "Price *" :
                 propertyStatus === "rent" ? "Monthly Rent *" :
                 "Security Amount *"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                <input
                  id="price"
                  type="number"
                  min="0"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={propertyStatus === "sale" ? "e.g. 2500000" : "e.g. 15000"}
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium mb-1">
                Property Type *
              </label>
              <select
                id="propertyType"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
                value={propertyType} // Bound to propertyType state
                onChange={e => setPropertyType(e.target.value)} // Update propertyType state
              >
                <option value="">Select property type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land/Plot</option>
                <option value="office">Office Space</option>
                <option value="shop">Shop/Retail</option>
                <option value="warehouse">Warehouse/Godown</option>
              </select>
            </div>
          </div>

          {propertyStatus === "lease" && (
            <div className="mt-4 border p-4 rounded-md bg-muted/30">
              <h4 className="font-medium mb-3">Lease Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* You might want to add state and input binding for leaseDuration and lockInPeriod here */}
                <div>
                  <label htmlFor="leaseDuration" className="block text-sm font-medium mb-1">
                    Lease Duration (months) *
                  </label>
                   {/* Add value and onChange binding for leaseDuration */}
                  <input
                    id="leaseDuration"
                    type="number"
                    min="1"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="e.g. 36"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lockInPeriod" className="block text-sm font-medium mb-1">
                    Lock-in Period (months)
                  </label>
                   {/* Add value and onChange binding for lockInPeriod */}
                  <input
                    id="lockInPeriod"
                    type="number"
                    min="0"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="e.g. 12"
                  />
                </div>
                {/* You might want to add state and input binding for Maintenance Included checkbox */}
                <div className="md:col-span-2">
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="mr-2 h-4 w-4" />
                    Maintenance Included in Rent
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium mb-1">
                Bedrooms
              </label>
              <input
                id="bedrooms"
                type="number"
                min="0"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. 3"
                value={bedrooms}
                onChange={e => setBedrooms(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium mb-1">
                Bathrooms
              </label>
              <input
                id="bathrooms"
                type="number"
                min="0"
                step="0.5"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. 2"
                value={bathrooms}
                onChange={e => setBathrooms(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="area" className="block text-sm font-medium mb-1">
                Area (sq ft)
              </label>
              <input
                id="area"
                type="number"
                min="0"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. 1200"
                value={area}
                onChange={e => setArea(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
              {/* You might want to add state to handle selected amenities */}
              {["Air Conditioning", "Balcony", "Garage", "Gym", "Swimming Pool", "Furnished", "Pet Friendly", "Security", "Garden", "Elevator", "Parking", "Internet"].map((amenity) => (
                <label key={amenity} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4"
                    name="amenities"
                    value={amenity.toLowerCase().replace(" ", "_")}
                     // Add checked state and onChange handler to manage selected amenities state
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Location</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-1">
                Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="address"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g. 123 Main St"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-1">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g. New York"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium mb-1">
                  State *
                </label>
                <input
                  id="state"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g. NY"
                  required
                  value={stateField}
                  onChange={e => setStateField(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                  Zip Code *
                </label>
                <input
                  id="zipCode"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g. 10001"
                  required
                  value={zipCode} // Bind zipCode state
                  onChange={e => setZipCode(e.target.value)} // Update zipCode state
                />
              </div>
            </div>
            {/* Google Map integration */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Location Map</label>
              <LoadScript googleMapsApiKey="AIzaSyCAPmBj3n7A4beLpIindQx1KodILM_ipr0">
                <GoogleMap
                  mapContainerStyle={{ height: '300px', width: '100%' }}
                  center={{ lat: 12.9716, lng: 77.5946 }} // Default to Bangalore
                  zoom={14}
                >
                  <Marker position={{ lat: 12.9716, lng: 77.5946 }} />
                </GoogleMap>
              </LoadScript>
            </div>
          </div>
        </div>

        {/* Nearby Amenities Section - Keep as is for now, need backend integration */}
         <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Nearby Amenities</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Properties with nearby amenities get 2x more inquiries
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Schools & Colleges</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Name (e.g. Delhi Public School)"
                />
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Distance (e.g. 1 km)"
                  />
                  <Button type="button" variant="outline" size="sm">
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Metro Stations</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Name (e.g. Rajiv Chowk)"
                />
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Distance (e.g. 500 m)"
                  />
                  <Button type="button" variant="outline" size="sm">
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hospitals</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Name (e.g. Apollo Hospital)"
                />
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Distance (e.g. 2 km)"
                  />
                  <Button type="button" variant="outline" size="sm">
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Shopping Malls</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Name (e.g. Select City Walk)"
                />
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Distance (e.g. 1.5 km)"
                  />
                  <Button type="button" variant="outline" size="sm">
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>


        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Description & Media</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Property Description *
              </label>
              <textarea
                id="description"
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Describe the property in detail..."
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium">
                  Property Images *
                </label>
                <span className="text-xs text-muted-foreground">
                  {images.length}/10 (Max 10 images)
                </span>
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative rounded-md overflow-hidden h-32">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white hover:bg-black/70 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop images here, or click to select files
                </p>
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={images.length >= 10}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("images")?.click()}
                  disabled={images.length >= 10}
                >
                  Select Files
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex justify-end gap-4">
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button
            type="submit"
            disabled={loading || images.length === 0} // Disable while loading or if no images
          >
            {loading ? "Publishing..." : "Publish Property"}
          </Button>
        </div>
         {/* Display error or success messages */}
         {error && <div className="text-red-500 mt-4">{error}</div>}
         {success && <div className="text-green-500 mt-4">{success}</div>}
      </form>
    </div>
  );
};

export default PropertyForm;
