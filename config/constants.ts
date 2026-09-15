import type {
  AdminRole,
  BodyType,
  CustomerStatus,
  FuelType,
  InquirySource,
  InquiryStatus,
  TestDriveStatus,
  TradeInStatus,
  Transmission,
  VehicleFeature,
  VehicleStatus,
  VehicleType,
} from "@/types";

export const BRAND_NAME = "Hansagiri Auto Traders";

export const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/trade-in", label: "Trade-In" },
  { href: "/financing", label: "Financing" },
  { href: "/contact", label: "Contact" },
] as const;

export const VEHICLE_STATUSES: VehicleStatus[] = [
  "draft",
  "available",
  "reserved",
  "sold",
  "archived",
];

export const PUBLIC_VEHICLE_STATUSES: VehicleStatus[] = [
  "available",
  "reserved",
  "sold",
];

export const VEHICLE_TYPES: VehicleType[] = ["new", "used"];

export const FUEL_TYPES: FuelType[] = [
  "Petrol",
  "Diesel",
  "Hybrid",
  "Electric",
  "CNG",
  "Other",
];

export const TRANSMISSIONS: Transmission[] = [
  "Automatic",
  "Manual",
  "CVT",
  "DCT",
  "Other",
];

export const BODY_TYPES: BodyType[] = [
  "Sedan",
  "Hatchback",
  "SUV",
  "Crossover",
  "Wagon",
  "Coupe",
  "Pickup",
  "Van",
  "MPV",
  "Other",
];

export const VEHICLE_FEATURES: VehicleFeature[] = [
  "Air Conditioning",
  "Power Steering",
  "Power Windows",
  "Central Locking",
  "Reverse Camera",
  "Parking Sensors",
  "Sunroof",
  "Leather Seats",
  "Apple CarPlay",
  "Android Auto",
  "Alloy Wheels",
  "Cruise Control",
  "Keyless Entry",
  "Push Start",
  "Navigation",
  "Bluetooth",
  "ABS",
  "Airbags",
  "Climate Control",
  "Fog Lights",
];

export const INQUIRY_STATUSES: InquiryStatus[] = [
  "new",
  "contacted",
  "follow_up",
  "interested",
  "negotiation",
  "converted",
  "closed",
  "lost",
];

export const INQUIRY_SOURCES: InquirySource[] = [
  "vehicles",
  "vehicle_detail",
  "contact",
  "home",
  "financing",
  "other",
];

export const CUSTOMER_STATUSES: CustomerStatus[] = [
  "new",
  "active",
  "interested",
  "converted",
  "lost",
];

export const TEST_DRIVE_STATUSES: TestDriveStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

export const TRADE_IN_STATUSES: TradeInStatus[] = [
  "new",
  "reviewing",
  "valuation",
  "offer_sent",
  "accepted",
  "rejected",
  "closed",
];

export const ADMIN_ROLES: AdminRole[] = ["super_admin", "admin", "sales"];

export const PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;
export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
export const MAX_TRADE_IN_IMAGES = 8;
export const MAX_VEHICLE_IMAGES = 20;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: ["*"],
  admin: [
    "vehicles",
    "vehicles:write",
    "inquiries",
    "test_drives",
    "trade_ins",
    "customers",
    "messages",
    "settings",
    "activity",
  ],
  sales: ["vehicles:read", "inquiries", "test_drives", "customers"],
};

export const SERVICES = [
  {
    slug: "vehicle-sales",
    title: "Vehicle Sales",
    description:
      "Browse a carefully selected range of quality new and pre-owned vehicles, presented with clear specifications and transparent pricing.",
  },
  {
    slug: "new-vehicles",
    title: "New Vehicles",
    description:
      "Source current-model vehicles through Hansagiri Auto Traders with professional guidance from first enquiry to handover.",
  },
  {
    slug: "pre-owned-vehicles",
    title: "Pre-Owned Vehicles",
    description:
      "Inspected, honestly described pre-owned cars chosen for condition, value, and everyday reliability.",
  },
  {
    slug: "vehicle-sourcing",
    title: "Vehicle Sourcing",
    description:
      "Looking for a specific make or model? Tell us what you need and we will help source the right vehicle.",
  },
  {
    slug: "trade-in-assistance",
    title: "Trade-In Assistance",
    description:
      "Submit your current vehicle for a professional review as part of your next purchase.",
  },
  {
    slug: "financing-assistance",
    title: "Financing Assistance",
    description:
      "We can introduce you to financing options. Final terms depend on the relevant institution and approval.",
  },
  {
    slug: "test-drives",
    title: "Test Drives",
    description:
      "Request a test drive for a vehicle you are considering. All requests are confirmed by our team.",
  },
  {
    slug: "after-sales-support",
    title: "After-Sales Support",
    description:
      "Straightforward assistance after you drive away, so you know who to contact if you need help.",
  },
] as const;
