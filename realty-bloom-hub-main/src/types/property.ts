export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: 'sale' | 'rent' | 'lease';
  isNewProject?: boolean;
  isVerified?: boolean;
  yearBuilt: number;
  features: string[];
  images: { id: string; image: string; is_primary: boolean; }[];
  image: string; // For compatibility
  location: string; // For compatibility
  agent: {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string;
  };
  amenities?: {
    name: string;
    icon?: string;
    distance?: string;
  }[];
  verificationDetails?: {
    aadharVerified: boolean;
    verifiedDate?: string;
  };
  nearbyLocations?: {
    type: 'school' | 'hospital' | 'metro' | 'market' | 'park' | 'restaurant';
    name: string;
    distance: string;
  }[];
  possessionStatus?: 'ready-to-move' | 'under-construction' | 'upcoming';
  possessionDate?: string;
  transactionType?: 'new-booking' | 'resale';
  furnishingStatus?: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  facingDirection?: 'north' | 'south' | 'east' | 'west' | 'north-east' | 'north-west' | 'south-east' | 'south-west';
  floorLevel?: number;
  totalFloors?: number;
  maintenanceFee?: number;
  parkingAvailable?: boolean;
  numberOfParkingSpots?: number;
  leaseDetails?: {
    duration: number; // in months
    securityDeposit: number;
    lockinPeriod?: number; // in months
    maintenanceIncluded: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
  lastUpdated?: Date;
  viewCount?: number;
}

export interface PropertySearchParams {
  query?: string;
  city?: string;
  propertyType?: 'sale' | 'rent' | 'lease';
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  minSqft?: number;
  maxSqft?: number;
  page?: number;
  limit?: number;
}
