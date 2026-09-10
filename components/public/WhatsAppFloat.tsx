import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import type { SiteSettings } from "@/types";
import { generalWhatsAppMessage, toWhatsAppHref } from "@/utils/whatsapp";

export function WhatsAppFloat({ settings }: { settings: SiteSettings }) {
  const href = toWhatsAppHref(
    settings.whatsapp || settings.phone,
    generalWhatsAppMessage(settings.businessName),
  );
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-5 bottom-24 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#20bd5a] lg:bottom-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
