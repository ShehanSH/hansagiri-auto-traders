import { Cinzel, Outfit } from "next/font/google";
import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import { DEFAULT_SETTINGS } from "@/config/defaults";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://hansagiriautotraders.example"),
  title: {
    default: DEFAULT_SETTINGS.seoTitle,
    template: `%s | ${DEFAULT_SETTINGS.businessName}`,
  },
  description: DEFAULT_SETTINGS.seoDescription,
  openGraph: {
    title: DEFAULT_SETTINGS.seoTitle,
    description: DEFAULT_SETTINGS.seoDescription,
    images: ["/cover.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_SETTINGS.seoTitle,
    description: DEFAULT_SETTINGS.seoDescription,
    images: ["/cover.jpg"],
  },
  icons: { icon: "/logonew.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cinzel.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full bg-dark font-sans text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
