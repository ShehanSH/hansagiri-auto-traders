import type { Metadata } from "next";
import { DEFAULT_TERMS } from "@/config/defaults";
import { getSettings } from "@/lib/services/settings.server";
import { marketingPageMetadata } from "@/lib/seo/pages";

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(
    "/terms",
    "Terms of Use",
    "Website terms for browsing vehicles and submitting enquiries.",
  );
}

export default async function TermsPage() {
  const settings = await getSettings();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <h1 className="font-display text-4xl">Terms of Use</h1>
      <p className="mt-8 whitespace-pre-line text-sm leading-relaxed text-white/75">
        {settings.terms || DEFAULT_TERMS}
      </p>
    </article>
  );
}
