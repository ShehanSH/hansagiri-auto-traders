import type { Metadata } from "next";
import { getSettings } from "@/lib/services/settings.server";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Hansagiri Auto Traders is a premier auto dealership specializing in quality new and pre-owned vehicles.",
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div>
      <section className="relative overflow-hidden py-24">
        <img
          src="https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=1800&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/80 to-dark" />
        <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-gold">About</p>
          <h1 className="mt-4 font-display text-5xl text-white">{settings.businessName}</h1>
          <p className="mt-6 text-lg leading-relaxed text-white/80">
            {settings.businessDescription}
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-2 lg:px-8">
        {[
          [
            "Who We Are",
            "Hansagiri Auto Traders is a professional car trading business focused on quality vehicles and a clear buying process. We work with customers who want honest information before they commit.",
          ],
          [
            "Our Mission",
            "Help you find the right car at a price that is explained plainly — then support the steps that follow, from enquiry to handover.",
          ],
          [
            "Why Customers Choose Us",
            "Carefully selected new and pre-owned vehicles, transparent pricing, and a team that answers questions without pressure.",
          ],
          [
            "Our Commitment",
            "We describe vehicles as they are. If a car is reserved or sold, we update the listing. If you need time to decide, that is part of a confident purchase.",
          ],
          [
            "Quality & Transparency",
            "Specifications, mileage, and condition are listed for each vehicle. We encourage inspections and test-drive requests so you can verify what you see online.",
          ],
        ].map(([title, text]) => (
          <article key={title} className="surface-card p-8">
            <h2 className="font-display text-2xl text-white">{title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
