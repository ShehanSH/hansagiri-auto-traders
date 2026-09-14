export type VehicleStatus =
  | "draft"
  | "available"
  | "reserved"
  | "sold"
  | "archived";

export type VehicleType = "new" | "used";

export type FuelType =
  | "Petrol"
  | "Diesel"
  | "Hybrid"
  | "Electric"
  | "CNG"
  | "Other";

export type Transmission =
  | "Automatic"
  | "Manual"
  | "CVT"
  | "DCT"
  | "Other";

export type BodyType =
  | "Sedan"
  | "Hatchback"
  | "SUV"
  | "Crossover"
  | "Wagon"
  | "Coupe"
  | "Pickup"
  | "Van"
  | "MPV"
  | "Other";

export type InquiryStatus =
  | "new"
  | "contacted"
  | "follow_up"
  | "interested"
  | "negotiation"
  | "converted"
  | "closed"
  | "lost";

export type TestDriveStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type TradeInStatus =
  | "new"
  | "reviewing"
  | "valuation"
  | "offer_sent"
  | "accepted"
  | "rejected"
  | "closed";

export type CustomerStatus =
  | "new"
  | "active"
  | "interested"
  | "converted"
  | "lost";

export type AdminRole = "super_admin" | "admin" | "sales";

export type ContactMethod = "phone" | "whatsapp" | "email";

export type InquirySource =
  | "vehicles"
  | "vehicle_detail"
  | "contact"
  | "home"
  | "financing"
  | "other";

export type VehicleFeature =
  | "Air Conditioning"
  | "Power Steering"
  | "Power Windows"
  | "Central Locking"
  | "Reverse Camera"
  | "Parking Sensors"
  | "Sunroof"
  | "Leather Seats"
  | "Apple CarPlay"
  | "Android Auto"
  | "Alloy Wheels"
  | "Cruise Control"
  | "Keyless Entry"
  | "Push Start"
  | "Navigation"
  | "Bluetooth"
  | "ABS"
  | "Airbags"
  | "Climate Control"
  | "Fog Lights";

export interface VehicleImage {
  url: string;
  path: string;
  alt: string;
  sortOrder: number;
}

export interface Vehicle {
  id: string;
  slug: string;
  stockId: string;
  name: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  bodyType: BodyType;
  engine: string;
  color: string;
  condition: string;
  registrationStatus: string;
  description: string;
  features: VehicleFeature[];
  images: VehicleImage[];
  primaryImage: string;
  location: string;
  vehicleType: VehicleType;
  status: VehicleStatus;
  featured: boolean;
  deleted?: boolean;
  seoTitle: string;
  seoDescription: string;
  searchKeywords: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface VehicleFilters {
  keyword?: string;
  make?: string;
  model?: string;
  vehicleType?: VehicleType | "";
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  fuelType?: FuelType | "";
  transmission?: Transmission | "";
  bodyType?: BodyType | "";
  status?: VehicleStatus | "";
  featured?: boolean;
}

export type VehicleSort =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "year_desc"
  | "mileage_asc";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  vehicleId: string | null;
  vehicleLabel: string;
  message: string;
  preferredContact: ContactMethod;
  preferredDate: string;
  preferredTime: string;
  source: InquirySource;
  status: InquiryStatus;
  assignedStaff: string;
  lastContact: string;
  followUpDate: string;
  notes: AdminNote[];
  customerId: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface AdminNote {
  id: string;
  body: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface TestDriveRequest {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  vehicleId: string | null;
  vehicleLabel: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: TestDriveStatus;
  notes: AdminNote[];
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TradeInRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: FuelType | "";
  transmission: Transmission | "";
  condition: string;
  registrationStatus: string;
  expectedPrice: number | null;
  notes: string;
  images: VehicleImage[];
  status: TradeInStatus;
  valuationNotes: string;
  estimatedValuation: number | null;
  adminNotes: AdminNote[];
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  whatsapp: string;
  interestedVehicles: string[];
  inquiryIds: string[];
  testDriveIds: string[];
  tradeInIds: string[];
  notes: AdminNote[];
  lastContact: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface FinancingInquiry {
  id: string;
  name: string;
  phone: string;
  vehicleLabel: string;
  estimatedBudget: string;
  employmentType: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
}

export interface OpeningHours {
  day: string;
  hours: string;
  closed: boolean;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  youtube: string;
}

export interface SiteSettings {
  businessName: string;
  businessDescription: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapsUrl: string;
  openingHours: OpeningHours[];
  social: SocialLinks;
  currency: string;
  currencySymbol: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSupporting: string;
  seoTitle: string;
  seoDescription: string;
  featuredLimit: number;
  showSoldVehicles: boolean;
  showReservedVehicles: boolean;
  privacyPolicy: string;
  terms: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
}

export interface MediaAsset {
  id: string;
  url: string;
  path: string;
  name: string;
  contentType: string;
  size: number;
  folder: string;
  createdAt: string;
  createdBy: string;
}

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  reservedVehicles: number;
  soldVehicles: number;
  newInquiries: number;
  pendingTestDrives: number;
  tradeInRequests: number;
  unreadMessages: number;
}
