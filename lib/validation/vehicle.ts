import { z } from "zod";
import { mileageSchema, priceSchema, yearSchema } from "@/lib/validation/common";

const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric", "CNG", "Other"] as const;
const transmissions = ["Automatic", "Manual", "CVT", "DCT", "Other"] as const;
const bodyTypes = [
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
] as const;
const features = [
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
] as const;

export const vehicleSchema = z.object({
  stockId: z.string().trim().max(30).optional().default(""),
  name: z.string().trim().max(120).optional().default(""),
  make: z.string().trim().min(1).max(40),
  model: z.string().trim().min(1).max(40),
  variant: z.string().trim().max(60).default(""),
  year: yearSchema,
  price: priceSchema,
  currency: z.string().trim().min(3).max(8).default("LKR"),
  mileage: mileageSchema,
  fuelType: z.enum(fuelTypes),
  transmission: z.enum(transmissions),
  bodyType: z.enum(bodyTypes),
  engine: z.string().trim().max(80).default(""),
  color: z.string().trim().max(40).default(""),
  condition: z.string().trim().max(80).default(""),
  registrationStatus: z.string().trim().max(80).default(""),
  description: z.string().trim().max(8000).default(""),
  features: z.array(z.enum(features)).default([]),
  location: z.string().trim().max(80).default(""),
  vehicleType: z.enum(["new", "used"]),
  status: z.enum(["draft", "available", "reserved", "sold", "archived"]),
  featured: z.boolean().default(false),
  seoTitle: z.string().trim().max(70).optional().default(""),
  seoDescription: z.string().trim().max(180).optional().default(""),
});

export { loginSchema } from "@/lib/validation/auth";

export type VehicleInput = z.infer<typeof vehicleSchema>;
