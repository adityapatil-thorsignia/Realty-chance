import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { inquiryApi } from "@/services/api";
import { toast } from "sonner";

interface PropertyInquiryFormProps {
  propertyId: string;
  propertyTitle: string;
}

const PropertyInquiryForm: React.FC<PropertyInquiryFormProps> = ({ propertyId, propertyTitle }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    message: `I'm interested in this property: ${propertyTitle}`
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Please login to submit an inquiry");
      navigate("/login", { state: { from: `/properties/${propertyId}` } });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await inquiryApi.create({
        property_id: propertyId,
        message: formData.message,
        phone: formData.phone
      });
      
      toast.success("Inquiry submitted successfully!");
      setFormData(prev => ({ ...prev, message: "" }));
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input 
          type="text" 
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
          placeholder="Your name"
          required
          disabled={isAuthenticated}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input 
          type="email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
          placeholder="Your email"
          required
          disabled={isAuthenticated}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input 
          type="tel" 
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
          placeholder="Your phone number"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Message</label>
        <textarea 
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
          rows={4}
          placeholder="I'm interested in this property..."
          required
        ></textarea>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Inquiry"}
      </Button>
    </form>
  );
};

export default PropertyInquiryForm;