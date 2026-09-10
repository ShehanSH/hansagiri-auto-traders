import type { Metadata } from "next";
import { TradeInForm } from "@/components/public/TradeInForm";

export const metadata: Metadata = {
  title: "Trade-In",
  description: "Submit your current vehicle for a trade-in review with Hansagiri Auto Traders.",
};

export default function TradeInPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Trade-in</p>
        <h1 className="mt-3 font-display text-4xl text-white">Vehicle trade-in enquiry</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Tell us about your current car and optionally upload photos. Our team will review the
          details and contact you. A submission is not a guaranteed offer.
        </p>
      </div>
      <TradeInForm />
    </div>
  );
}
