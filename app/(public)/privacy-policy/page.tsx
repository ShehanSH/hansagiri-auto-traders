import type { Metadata } from "next";
import { DEFAULT_PRIVACY } from "@/config/defaults";
import { getSettings } from "@/lib/services/settings.server";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <h1 className="font-display text-4xl">Privacy Policy</h1>
      <p className="mt-8 whitespace-pre-line text-sm leading-relaxed text-white/75">
        {settings.privacyPolicy || DEFAULT_PRIVACY}
      </p>
    </article>
  );
}
