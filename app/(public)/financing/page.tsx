import type { Metadata } from "next";
import { FinancingForm } from "@/components/public/ContactForm";
import { marketingPageMetadata } from "@/lib/seo/pages";

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(
    "/financing",
    "Financing",
    "General financing information and an enquiry form. Final terms depend on institution and dealership approval.",
  );
}

export default function FinancingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">Financing</p>
      <h1 className="mt-3 font-display text-4xl text-white">Financing assistance</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Hansagiri Auto Traders can introduce you to financing options for a vehicle purchase. This
        website does not process payments or loan agreements. Final terms depend on the relevant
        financial institution and dealership approval.
      </p>
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {[
          [
            "How it works",
            "Choose a vehicle, tell us your estimated budget, and we will discuss possible next steps with you.",
          ],
          [
            "Typical documents",
            "Identification, proof of income, and any documents requested by the financing institution. Requirements vary.",
          ],
          [
            "Important note",
            "An enquiry is not credit approval. Do not treat website content as a finance offer or interest-rate quote.",
          ],
        ].map(([title, text]) => (
          <article key={title} className="surface-card p-6">
            <h2 className="font-display text-xl text-white">{title}</h2>
            <p className="mt-3 text-sm text-muted">{text}</p>
          </article>
        ))}
      </div>
      <div className="mt-14 max-w-xl">
        <h2 className="font-display text-2xl">Financing enquiry</h2>
        <p className="mt-2 mb-6 text-sm text-muted">Optional. We will contact you to continue the conversation.</p>
        <FinancingForm />
      </div>
    </div>
  );
}
