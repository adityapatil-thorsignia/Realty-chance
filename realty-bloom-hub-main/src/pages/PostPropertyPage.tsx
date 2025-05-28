
import React from "react";
import Layout from "@/components/layout/Layout";
import PropertyForm from "@/components/properties/PropertyForm";
import BackButton from "@/components/ui/back-button";
import { BadgeCheck, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PostPropertyPage: React.FC = () => {
  return (
    <Layout>
      <div className="container py-8">
        {/* <BackButton to="/" label="Back to Home" /> */}
        
        <h1 className="text-3xl font-bold mb-2">Post a Property</h1>
        <p className="text-muted-foreground mb-4">Fill in the details below to list your property</p>
        
        {/* <div className="bg-muted/30 p-4 rounded-lg mb-8">
          <div className="flex items-start">
            <div className="mr-4 mt-1 text-primary">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Get Aadhar Verified Badge</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Verified properties get 3x more responses. Upload your Aadhar card to get a verified badge on your listing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Aadhar Number</label>
                  <input 
                    type="text" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    placeholder="XXXX XXXX XXXX" 
                  />
                </div>
                <div className="flex items-end">
                  <button className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Aadhar
                  </button>
                </div>
              </div>
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Privacy Assured</AlertTitle>
                <AlertDescription>
                  Your Aadhar details will be used only for verification purposes and will not be shared publicly.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div> */}
        
        <PropertyForm />
      </div>
    </Layout>
  );
};

export default PostPropertyPage;
