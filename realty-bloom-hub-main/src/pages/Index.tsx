import React, { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import SearchHero from "@/components/home/SearchHero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import PropertyGrid from "@/components/properties/PropertyGrid";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { propertyApi } from "@/services/api";
import PropertyCard from "@/components/properties/PropertyCard";

const Index: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/properties/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedProperties(data);
        } else if (Array.isArray(data.results)) {
          setFeaturedProperties(data.results);
        } else {
          setFeaturedProperties([]);
        }
      })
      .catch(() => setFeaturedProperties([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <SearchHero />
      
      <FeaturedCategories />
      
      <PropertyGrid 
        properties={featuredProperties.slice(0, 3)}
        title="Featured Properties"
        subtitle="Explore our handpicked selection of featured properties"
      />
      
      <div className="container py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Find Your Dream Property</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Whether you're looking for a cozy apartment, a spacious family home, or a luxury villa, 
            we have the perfect property for you. Start your search today and discover your dream home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/properties">Browse All Properties</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/post-property">List Your Property</Link>
            </Button>
          </div>
        </div>
      </div>

   

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Why Choose RealityChance?</h2>
              <p className="mb-6">
                We're dedicated to providing exceptional service and making your property journey 
                seamless and enjoyable. Our platform offers:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2 text-secondary">✓</span>
                  <span>Thousands of verified property listings</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-secondary">✓</span>
                  <span>Seamless and secure communication with agents and owners</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-secondary">✓</span>
                  <span>Advanced search filters to find your perfect match</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-secondary">✓</span>
                  <span>Virtual tours and high-quality images</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-secondary">✓</span>
                  <span>Expert real estate agents ready to assist you</span>
                </li>
              </ul>
            </div>
            <div className="relative h-64 md:h-full">
              <div className="absolute top-0 right-0 w-4/5 h-4/5">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cmVhbCUyMGVzdGF0ZSUyMGFnZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60" 
                  alt="Real estate agent helping clients" 
                  className="rounded-lg shadow-lg object-cover w-full h-full"
                />
              </div>
              <div className="absolute bottom-0 left-0 w-3/5 h-3/5 z-10">
                <img 
                  src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aG91c2UlMjBrZXlzfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60" 
                  alt="House keys" 
                  className="rounded-lg shadow-lg object-cover w-full h-full border-4 border-background"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Getting Started Is Easy</h2>
          <p className="text-muted-foreground">Follow these simple steps to find your perfect property</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="">
                <path d="M11 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.5"></path>
                <path d="M18 12.5v5.5m0 0-2.5-2.5M18 18l2.5-2.5"></path>
                <path d="M3 7h18v4H3z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Browse Listings</h3>
            <p className="text-muted-foreground">
              Explore our extensive collection of properties using our advanced search filters to find what matches your criteria.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="">
                <path d="M15.2 22H8.8a2 2 0 0 1-2-1.79L5 3h14l-1.81 17.21a2 2 0 0 1-1.99 1.79Z"></path>
                <path d="M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Schedule Viewings</h3>
            <p className="text-muted-foreground">
              Contact agents or property owners directly to schedule in-person visits or virtual tours at your convenience.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="">
                <path d="M12 22v-5"></path>
                <path d="M9 8V2"></path>
                <path d="M15 8V2"></path>
                <path d="M18 18v-7a2 2 0 0 0-2-2h-2"></path>
                <path d="M6 11V9a2 2 0 0 1 2-2h2"></path>
                <path d="M3 22h18"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Find Your Home</h3>
            <p className="text-muted-foreground">
              Make informed decisions with our detailed listings and finalize your dream property purchase or rental.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Button asChild>
            <Link to="/properties">Start Your Search</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
