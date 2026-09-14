import { Cinzel, Outfit } from "next/font/google";
import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import { DEFAULT_SETTINGS } from "@/config/defaults";
import { getSiteUrl } from "@/lib/seo/content";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: DEFAULT_SETTINGS.seoTitle,
    template: `%s | ${DEFAULT_SETTINGS.businessName}`,
  },
  description: DEFAULT_SETTINGS.seoDescription,
  applicationName: DEFAULT_SETTINGS.businessName,
  keywords: [
    "Hansagiri Auto Traders",
    "cars for sale Sri Lanka",
    "pre-owned vehicles",
    "new cars",
    "used cars",
    "test drive",
    "trade in",
  ],
  openGraph: {
    title: DEFAULT_SETTINGS.seoTitle,
    description: DEFAULT_SETTINGS.seoDescription,
    images: ["/cover.jpg"],
    type: "website",
    locale: "en_LK",
    siteName: DEFAULT_SETTINGS.businessName,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_SETTINGS.seoTitle,
    description: DEFAULT_SETTINGS.seoDescription,
    images: ["/cover.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: { icon: "/logonew.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-LK" data-scroll-behavior="smooth" className={`${cinzel.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full bg-dark font-sans text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
