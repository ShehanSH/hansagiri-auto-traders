import Link from "next/link";
import {
  BadgeCheck,
  Car,
  Handshake,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const reasons = [
  {
    icon: BadgeCheck,
    title: "Quality Vehicles",
    text: "Each listing is presented with clear specifications so you can compare with confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Pricing",
    text: "Honest figures, no theatrics. What you see is the starting point for a straightforward conversation.",
  },
  {
    icon: Handshake,
    title: "Trusted Service",
    text: "From first enquiry to handover, we keep the process professional and easy to follow.",
  },
  {
    icon: HeartHandshake,
    title: "Customer First",
    text: "We help you find the right car for how you actually drive — not the loudest option on the floor.",
  },
  {
    icon: Sparkles,
    title: "Carefully Selected Cars",
    text: "New and pre-owned vehicles are chosen for condition, value, and everyday usability.",
  },
  {
    icon: Car,
    title: "Professional Assistance",
    text: "Need a test drive, trade-in, or financing introduction? Our team will guide the next step.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-dark py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Why choose us</p>
        <h2 className="mt-3 font-display text-3xl text-white sm:text-4xl">
          Quality vehicles. Transparent deals. Confident driving.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reasons.map((item) => (
            <div key={item.title} className="surface-card p-6">
              <item.icon className="h-6 w-6 text-gold" aria-hidden />
              <h3 className="mt-4 font-display text-xl text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewPreownedSplit() {
  return (
    <section className="grid lg:grid-cols-2">
      <Link
        href="/vehicles?type=new"
        className="group relative min-h-[340px] overflow-hidden bg-charcoal"
      >
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80"
          alt="New vehicles"
          className="absolute inset-0 h-full w-full object-cover opacity-50 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative flex h-full min-h-[340px] flex-col justify-end p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-gold">Collection</p>
          <h2 className="mt-2 font-display text-4xl text-white">New Vehicles</h2>
          <p className="mt-3 text-sm text-white/70">Current-model cars, ready for inspection.</p>
        </div>
      </Link>
      <Link
        href="/vehicles?type=used"
        className="group relative min-h-[340px] overflow-hidden bg-charcoal"
      >
        <img
          src="https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1600&q=80"
          alt="Pre-owned vehicles"
          className="absolute inset-0 h-full w-full object-cover opacity-50 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative flex h-full min-h-[340px] flex-col justify-end p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-gold">Collection</p>
          <h2 className="mt-2 font-display text-4xl text-white">Pre-Owned Vehicles</h2>
          <p className="mt-3 text-sm text-white/70">Inspected cars with honest descriptions.</p>
        </div>
      </Link>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="border-y border-gold/15 bg-dark-secondary py-20">
      <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
        <div className="gold-rule mx-auto mb-8 w-32" />
        <h2 className="font-display text-3xl text-white sm:text-5xl">
          Looking for Your Next Vehicle?
        </h2>
        <p className="mt-4 text-muted">
          Let Hansagiri Auto Traders help you find the right car.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/vehicles"
            className="bg-gold px-7 py-3.5 text-xs uppercase tracking-[0.18em] text-dark"
          >
            Browse Vehicles
          </Link>
          <Link
            href="/contact"
            className="border border-gold px-7 py-3.5 text-xs uppercase tracking-[0.18em] text-gold"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
