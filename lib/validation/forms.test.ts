import { describe, expect, it } from "vitest";
import { inquirySchema } from "@/lib/validation/inquiry";
import { testDriveSchema } from "@/lib/validation/test-drive";
import { vehicleSchema } from "@/lib/validation/vehicle";

describe("inquiry validation", () => {
  it("accepts a complete enquiry", () => {
    const result = inquirySchema.safeParse({
      name: "Amal Perera",
      phone: "0771234567",
      whatsapp: "0771234567",
      email: "amal@example.com",
      message: "I would like more information about this car.",
      preferredContact: "whatsapp",
      source: "vehicle_detail",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a short name and invalid email", () => {
    const result = inquirySchema.safeParse({
      name: "A",
      phone: "123",
      email: "not-an-email",
      message: "Hi",
      preferredContact: "email",
    });
    expect(result.success).toBe(false);
  });
});

describe("test drive validation", () => {
  it("requires a preferred date", () => {
    const result = testDriveSchema.safeParse({
      name: "Amal Perera",
      phone: "0771234567",
      email: "amal@example.com",
      preferredDate: "",
      preferredTime: "10:00",
    });
    expect(result.success).toBe(false);
  });
});

describe("vehicle validation", () => {
  it("accepts a publishable vehicle", () => {
    const result = vehicleSchema.safeParse({
      stockId: "HT-100",
      make: "Honda",
      model: "Civic",
      year: 2020,
      price: 10000000,
      mileage: 20000,
      fuelType: "Petrol",
      transmission: "Automatic",
      bodyType: "Sedan",
      vehicleType: "used",
      status: "draft",
    });
    expect(result.success).toBe(true);
  });
});
