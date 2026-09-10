import type { SiteSettings } from "@/types";
import { BRAND_NAME } from "@/config/constants";

export const DEFAULT_SETTINGS: SiteSettings = {
  businessName: BRAND_NAME,
  businessDescription:
    "Hansagiri Auto Traders is a premier auto dealership specializing in quality new and pre-owned vehicles. We’re committed to honest pricing, dependable service, and putting you in the right ride. Drive with confidence every time.",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  mapsUrl: "",
  openingHours: [
    { day: "Monday", hours: "9:00 AM – 6:00 PM", closed: false },
    { day: "Tuesday", hours: "9:00 AM – 6:00 PM", closed: false },
    { day: "Wednesday", hours: "9:00 AM – 6:00 PM", closed: false },
    { day: "Thursday", hours: "9:00 AM – 6:00 PM", closed: false },
    { day: "Friday", hours: "9:00 AM – 6:00 PM", closed: false },
    { day: "Saturday", hours: "9:00 AM – 4:00 PM", closed: false },
    { day: "Sunday", hours: "Closed", closed: true },
  ],
  social: {
    facebook: "",
    instagram: "",
    tiktok: "",
    whatsapp: "",
    youtube: "",
  },
  currency: "LKR",
  currencySymbol: "Rs.",
  heroTitle: "HANSAGIRI AUTO TRADERS",
  heroSubtitle: "Drive With Confidence.",
  heroSupporting:
    "Quality new and pre-owned vehicles, trusted service, and honest deals.",
  seoTitle: "Hansagiri Auto Traders | Quality New & Pre-Owned Vehicles",
  seoDescription:
    "Quality vehicles. Transparent deals. Confident driving. Browse new and pre-owned cars from Hansagiri Auto Traders.",
  featuredLimit: 6,
  showSoldVehicles: false,
  showReservedVehicles: true,
  privacyPolicy: "",
  terms: "",
};

export const DEFAULT_PRIVACY = `Privacy Policy

This page is a general template for Hansagiri Auto Traders. It is not legal advice and should be reviewed by the business before publication.

Information we collect
We may collect the name, phone number, email address, and message details you submit through enquiry, test-drive, trade-in, financing, or contact forms. If you upload images with a trade-in request, those files are stored so our team can review your vehicle.

How we use information
Submitted information is used to respond to your enquiry, arrange a test drive, review a trade-in, or provide requested information about vehicles and services. Internal admin notes are never shown to customers.

Sharing
We do not sell your information. Details may be shared with a financing institution only when you request financing assistance.

Retention
Enquiry records are kept for as long as needed to manage the customer relationship and legitimate business records.

Your choices
You may contact the dealership using the details on the Contact page to ask questions about information you have submitted.

This template can be updated from the admin settings.`;

export const DEFAULT_TERMS = `Terms of Use

This page is a general template for the Hansagiri Auto Traders website. It is not a legally binding contract unless the business replaces it with reviewed terms.

Vehicle information
Vehicle specifications, prices, availability, and images are provided for information. Details may change, and vehicles may be reserved or sold without notice. Please confirm current information with the dealership.

No account required
Customers can browse vehicles and submit enquiries without creating an account.

Test drives
A test-drive submission is a request only. It is not a confirmed booking until the dealership contacts you.

Financing
Financing information on this website is general. Final terms depend on the relevant financial institution and dealership approval. This website does not process payments or loan agreements.

Limitation
The website is provided as an information and enquiry channel for the dealership. Vehicle sale terms are agreed separately.

These terms can be updated from the admin settings.`;
